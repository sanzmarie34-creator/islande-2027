// Collecte reproductible des données géographiques du carnet.
// Usage : node scripts/build-data.mjs  → écrit src/data/generated.json
//
// Sources interrogées (aucune donnée n'est inventée : si un appel échoue, le champ reste null
// et le site affiche « À vérifier ») :
//  - Wikidata (SPARQL)      : coordonnées P625, photo P18, catégorie Commons P373
//  - OSRM (router.project-osrm.org, données OpenStreetMap) : tracé routier réel, distance, durée, numéros de route
//  - Overpass API (OpenStreetMap) : gués (nœuds ford=*) situés sur le tracé calculé
//  - Wikimedia Commons API  : URL, auteur et licence de chaque photo
import { writeFile, mkdir } from 'node:fs/promises';
import { places, viaPoints, days, alternatives, VERIFIED_ON } from './itinerary.source.mjs';
import { concordant } from './photo-filter.mjs';

const UA = { 'User-Agent': 'IcelandRoadTrip2027/0.1 (personal non-commercial trip planner)' };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const now = new Date().toISOString();

async function getJson(url, opts = {}, tries = 4) {
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(url, { ...opts, headers: { ...UA, ...(opts.headers || {}) } });
      if (r.ok) return await r.json();
      console.warn(`  HTTP ${r.status} ${url.slice(0, 90)}`);
    } catch (e) {
      console.warn(`  ERR ${e.message} ${url.slice(0, 90)}`);
    }
    await sleep(3000 * 2 ** i);
  }
  return null;
}

// ---------- 1. Wikidata ----------
async function wikidata() {
  const qids = new Set();
  for (const p of Object.values(places)) {
    if (p.qid) qids.add(p.qid);
    if (p.imageQid) qids.add(p.imageQid);
  }
  const q = `SELECT ?item ?coord ?img ?cat ?frwiki WHERE {
    VALUES ?item { ${[...qids].map((x) => 'wd:' + x).join(' ')} }
    OPTIONAL { ?item wdt:P625 ?coord } OPTIONAL { ?item wdt:P18 ?img } OPTIONAL { ?item wdt:P373 ?cat }
    OPTIONAL { ?frwiki schema:about ?item ; schema:isPartOf <https://fr.wikipedia.org/> }
  }`;
  const res = await getJson('https://query.wikidata.org/sparql?format=json&query=' + encodeURIComponent(q));
  const out = {};
  for (const b of res?.results?.bindings ?? []) {
    const id = b.item.value.split('/').pop();
    const o = (out[id] ??= { coords: [], images: new Set(), cat: null, frwiki: null });
    if (b.coord) {
      const m = b.coord.value.match(/Point\(([-\d.]+) ([-\d.]+)\)/);
      if (m) o.coords.push([+m[2], +m[1]]);
    }
    if (b.img) o.images.add(decodeURIComponent(b.img.value.split('/').pop()));
    if (b.cat) o.cat = b.cat.value;
    if (b.frwiki) o.frwiki = b.frwiki.value;
  }
  // Libellés islandais (lieux sans QID connu)
  for (const p of Object.values(places).filter((p) => p.isLabel)) {
    const lq = `SELECT ?item ?coord WHERE { ?item rdfs:label "${p.isLabel}"@is ; wdt:P17 wd:Q189 ; wdt:P31/wdt:P279* wd:Q486972 ; wdt:P625 ?coord }`;
    const r = await getJson('https://query.wikidata.org/sparql?format=json&query=' + encodeURIComponent(lq));
    const b = r?.results?.bindings?.[0];
    if (b) {
      const m = b.coord.value.match(/Point\(([-\d.]+) ([-\d.]+)\)/);
      p.qid = b.item.value.split('/').pop();
      out[p.qid] = { coords: [[+m[2], +m[1]]], images: new Set(), cat: null };
    }
  }
  return out;
}

// ---------- 2. OSRM ----------
function coordsOf(id) {
  const p = places[id] ?? viaPoints[id];
  if (!p) throw new Error('Lieu inconnu : ' + id);
  return p.coords;
}

async function route(ids) {
  const pts = ids.map(coordsOf);
  if (pts.some((c) => !c)) return null;
  const url = `https://router.project-osrm.org/route/v1/driving/${pts.map(([la, lo]) => `${lo},${la}`).join(';')}?overview=full&geometries=geojson&steps=true&continue_straight=false`;
  const r = await getJson(url);
  await sleep(1200);
  if (r?.code !== 'Ok') return null;
  const rt = r.routes[0];
  const byRef = {};
  const legs = rt.legs.map((leg, i) => {
    const refs = {};
    for (const s of leg.steps) {
      const k = s.ref || '';
      refs[k] = (refs[k] ?? 0) + s.distance;
      byRef[k] = (byRef[k] ?? 0) + s.distance;
    }
    return { from: ids[i], to: ids[i + 1], distanceKm: +(leg.distance / 1000).toFixed(1), durationMin: Math.round(leg.duration / 60), refs: Object.entries(refs).filter(([, d]) => d > 200).map(([ref, d]) => ({ ref, km: +(d / 1000).toFixed(1) })) };
  });
  const refs = Object.entries(byRef).filter(([, d]) => d > 200).sort((a, b) => b[1] - a[1]).map(([ref, d]) => ({ ref, km: +(d / 1000).toFixed(1), isF: /^F\d/.test(ref) }));
  const full = rt.geometry.coordinates.map(([lo, la]) => [la, lo]);
  // Segments colorés : étapes OSRM consécutives regroupées par type (piste F / route classique)
  const segments = [];
  for (const leg of rt.legs) for (const s of leg.steps) {
    const isF = /^F\d/.test(s.ref || '');
    const pts = s.geometry.coordinates.map(([lo, la]) => [la, lo]);
    const last = segments[segments.length - 1];
    if (last && last.isF === isF) last.pts.push(...pts.slice(1));
    else segments.push({ isF, pts });
  }
  return {
    segments: segments.filter((s) => s.pts.length > 1).map((s) => ({ isF: s.isF, coords: simplify(s.pts) })),
    distanceKm: +(rt.distance / 1000).toFixed(1),
    durationMin: Math.round(rt.duration / 60),
    fKm: +refs.filter((r) => r.isF).reduce((a, r) => a + r.km, 0).toFixed(1),
    refs,
    legs,
    snaps: r.waypoints.map((w, i) => ({ id: ids[i], snapM: Math.round(w.distance), road: w.name })),
    full,
  };
}

// Douglas-Peucker (affichage uniquement ; les distances viennent d'OSRM sur le tracé complet)
function simplify(pts, tolM = 25) {
  if (pts.length < 3) return pts;
  const toXY = ([la, lo]) => [lo * 111320 * Math.cos((la * Math.PI) / 180), la * 110540];
  const xy = pts.map(toXY);
  const keep = new Uint8Array(pts.length);
  keep[0] = keep[pts.length - 1] = 1;
  const stack = [[0, pts.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop();
    let max = 0, idx = -1;
    for (let i = a + 1; i < b; i++) {
      const d = segDist(xy[i], xy[a], xy[b]);
      if (d > max) { max = d; idx = i; }
    }
    if (max > tolM) { keep[idx] = 1; stack.push([a, idx], [idx, b]); }
  }
  return pts.filter((_, i) => keep[i]).map(([la, lo]) => [+la.toFixed(5), +lo.toFixed(5)]);
}
function segDist(p, a, b) {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const t = dx || dy ? Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy))) : 0;
  return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy);
}
function distToLine([la, lo], line) {
  const k = 111320 * Math.cos((la * Math.PI) / 180);
  const P = [lo * k, la * 110540];
  let best = Infinity;
  for (let i = 1; i < line.length; i++) {
    const A = [line[i - 1][1] * k, line[i - 1][0] * 110540], B = [line[i][1] * k, line[i][0] * 110540];
    best = Math.min(best, segDist(P, A, B));
  }
  return best;
}

// ---------- 3. Gués (OSM) ----------
async function fords(full) {
  const lats = full.map((p) => p[0]), lons = full.map((p) => p[1]);
  const bb = [Math.min(...lats) - 0.01, Math.min(...lons) - 0.01, Math.max(...lats) + 0.01, Math.max(...lons) + 0.01].map((x) => x.toFixed(4)).join(',');
  const q = `[out:json][timeout:90];node["ford"]["ford"!="no"](${bb});out;`;
  const r = await getJson('https://overpass-api.de/api/interpreter', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'data=' + encodeURIComponent(q) });
  await sleep(4000);
  if (!r) return null; // null = requête échouée → « À vérifier »
  return r.elements
    .map((e) => ({ osmId: 'node/' + e.id, coords: [e.lat, e.lon], tags: e.tags, distM: Math.round(distToLine([e.lat, e.lon], full)) }))
    // Le tracé OSRM passe par les nœuds OSM : un gué de la route est à ~0 m. Au-delà de 2 m, c'est une voie parallèle.
    .filter((f) => f.distM <= 2)
    .map((f) => ({ ...f, alongKm: alongKm(f.coords, full) }))
    .sort((a, b) => a.alongKm - b.alongKm);
}
function alongKm(pt, line) {
  let acc = 0, bestD = Infinity, bestAcc = 0;
  for (let i = 0; i < line.length; i++) {
    if (i) acc += hav(line[i - 1], line[i]);
    const d = hav(pt, line[i]);
    if (d < bestD) { bestD = d; bestAcc = acc; }
  }
  return +(bestAcc / 1000).toFixed(1);
}
function hav([a, b], [c, d]) {
  const R = 6371000, r = Math.PI / 180;
  const x = Math.sin(((c - a) * r) / 2) ** 2 + Math.cos(a * r) * Math.cos(c * r) * Math.sin(((d - b) * r) / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

// ---------- 4. Photos (Wikimedia Commons) ----------
const OK_LICENSE = /^(CC BY(-SA)? [\d.]+|CC0|Public domain|PD|CC BY-SA [\d.]+ .*|CC BY [\d.]+ .*)/i;
const strip = (h) => (h ?? '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

async function commonsCategory(cat) {
  const r = await getJson(`https://commons.wikimedia.org/w/api.php?action=query&list=categorymembers&cmtitle=${encodeURIComponent('Category:' + cat)}&cmtype=file&cmlimit=40&format=json`);
  await sleep(800);
  return (r?.query?.categorymembers ?? []).map((m) => m.title.replace(/^File:/, '')).filter((t) => /\.jpe?g$/i.test(t) && !/map|carte|kort|diagram|logo/i.test(t));
}
async function commonsInfo(titles) {
  const out = {};
  for (let i = 0; i < titles.length; i += 40) {
    const chunk = titles.slice(i, i + 40);
    const r = await getJson(`https://commons.wikimedia.org/w/api.php?action=query&prop=imageinfo&iiprop=url|extmetadata|size|mime&iiurlwidth=1600&format=json&titles=${encodeURIComponent(chunk.map((t) => 'File:' + t).join('|'))}`);
    await sleep(1000);
    for (const p of Object.values(r?.query?.pages ?? {})) {
      const ii = p.imageinfo?.[0];
      if (!ii) continue;
      const m = ii.extmetadata ?? {};
      out[p.title.replace(/^File:/, '')] = {
        file: p.title,
        thumb: ii.thumburl, full: ii.url, page: ii.descriptionurl, width: ii.width, height: ii.height, mime: ii.mime,
        author: strip(m.Artist?.value) || 'Auteur non indiqué', license: m.LicenseShortName?.value ?? null, licenseUrl: m.LicenseUrl?.value ?? null,
        description: strip(m.ImageDescription?.value).slice(0, 220), date: strip(m.DateTimeOriginal?.value).slice(0, 20),
        attributionRequired: m.AttributionRequired?.value !== 'false',
      };
    }
  }
  return out;
}

// ---------- Main ----------
console.log('1/4 Wikidata…');
const wd = await wikidata();
for (const [id, p] of Object.entries(places)) {
  if (!p.coords && p.qid && wd[p.qid]?.coords?.[0]) p.coords = wd[p.qid].coords[0];
  if (!p.coords) console.warn('  ⚠ coordonnées manquantes : ' + id);
}

console.log('2/4 OSRM + 3/4 Overpass…');
async function compute(r) {
  if (!r.route.length) return { route: null, fords: [] };
  const rt = await route(r.route);
  if (!rt) { console.warn('  ⚠ échec OSRM ' + r.route.join('>')); return { route: null, fords: null }; }
  const f = await fords(rt.full);
  delete rt.full;
  console.log(`  ${r.route.join(' > ')} : ${rt.distanceKm} km, F ${rt.fKm} km, gués OSM ${f ? f.length : '?'}`);
  return { route: { ...rt, computedAt: now }, fords: f };
}
const outDays = [];
for (const d of days) outDays.push({ ...d, waypoints: d.route, ...(await compute(d)) });
const outAlts = [];
for (const a of alternatives) outAlts.push({ ...a, waypoints: a.route, ...(await compute(a)) });

console.log('4/4 Commons…');
const wanted = {};
for (const [id, p] of Object.entries(places)) {
  const w = wd[p.imageQid ?? p.qid] ?? wd[p.qid];
  if (!w) continue;
  const list = [...(w.images ?? [])];
  if (w.cat) for (const t of (await commonsCategory(w.cat)).slice(0, 8)) if (!list.includes(t)) list.push(t);
  wanted[id] = { list, cat: w.cat, p18: [...(w.images ?? [])] };
}
const info = await commonsInfo([...new Set(Object.values(wanted).flatMap((w) => w.list))]);
const outPlaces = {};
for (const [id, p] of Object.entries(places)) {
  const w = wanted[id];
  const photos = (w?.list ?? [])
    .map((t) => info[t] && { ...info[t], basis: w.p18.includes(t) ? `Image principale (P18) de l'élément Wikidata ${p.imageQid ?? p.qid}` : `Fichier classé dans Category:${w.cat} sur Wikimedia Commons` })
    .filter((x) => x && x.license && OK_LICENSE.test(x.license) && x.width >= 1000 && x.width >= x.height * 0.9 && concordant(id, p, x))
    .slice(0, 5);
  outPlaces[id] = { ...p, wikidata: p.qid ? `https://www.wikidata.org/wiki/${p.qid}` : null, osmUrl: p.osm ? `https://www.openstreetmap.org/${p.osm}` : null, frwiki: wd[p.qid]?.frwiki ?? null, commonsCategory: w?.cat ?? null, photos };
}
for (const v of Object.values(viaPoints)) v.via = true;

await mkdir('src/data', { recursive: true });
await writeFile('src/data/generated.json', JSON.stringify({ generatedAt: now, verifiedOn: VERIFIED_ON, method: { routing: 'OSRM (router.project-osrm.org), profil voiture, données OpenStreetMap', fords: 'Overpass API : nœuds OSM ford=* situés sur le tracé calculé (≤ 2 m)', photos: 'Wikimedia Commons API (extmetadata : auteur, licence)', coords: 'Wikidata SPARQL (P625) ou objet OSM cité' }, places: outPlaces, viaPoints, days: outDays, alternatives: outAlts }, null, 1));
console.log('OK → src/data/generated.json');
