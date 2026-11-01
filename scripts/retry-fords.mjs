// Relance uniquement les requêtes de gués qui ont échoué (fords === null) dans src/data/generated.json
// (l'API Overpass publique est souvent saturée). Usage : node scripts/retry-fords.mjs
import { readFile, writeFile } from 'node:fs/promises';
import { places, viaPoints, days, alternatives } from './itinerary.source.mjs';

const UA = { 'User-Agent': 'IcelandRoadTrip2027/0.1 (personal non-commercial trip planner)' };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const data = JSON.parse(await readFile('src/data/generated.json', 'utf8'));

// Rattrapage : la liste des étapes de calcul est aussi conservée sous `waypoints`
for (const d of data.days) d.waypoints ??= days.find((x) => x.n === d.n).route;
for (const a of data.alternatives) a.waypoints ??= alternatives.find((x) => x.id === a.id).route;

// Seuls les gués situés sur le tracé lui-même sont conservés (voir build-data.mjs)
for (const item of [...data.days, ...data.alternatives]) if (item.fords) item.fords = item.fords.filter((f) => f.distM <= 2);
data.method.fords = 'Overpass API : nœuds OSM ford=* situés sur le tracé calculé (≤ 2 m)';

const coordsOf =(id) => (places[id] ?? viaPoints[id]).coords ?? data.places[id]?.coords;
const segDist = (p, a, b) => {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const t = dx || dy ? Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy))) : 0;
  return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy);
};
const hav = ([a, b], [c, d]) => {
  const r = Math.PI / 180, x = Math.sin(((c - a) * r) / 2) ** 2 + Math.cos(a * r) * Math.cos(c * r) * Math.sin(((d - b) * r) / 2) ** 2;
  return 2 * 6371000 * Math.asin(Math.sqrt(x));
};

async function fullGeometry(ids) {
  const pts = ids.map(coordsOf);
  const r = await (await fetch(`https://router.project-osrm.org/route/v1/driving/${pts.map(([la, lo]) => `${lo},${la}`).join(';')}?overview=full&geometries=geojson&continue_straight=false`, { headers: UA })).json();
  return r.routes[0].geometry.coordinates.map(([lo, la]) => [la, lo]);
}

async function fords(full) {
  const lats = full.map((p) => p[0]), lons = full.map((p) => p[1]);
  const bb = [Math.min(...lats) - 0.01, Math.min(...lons) - 0.01, Math.max(...lats) + 0.01, Math.max(...lons) + 0.01].map((x) => x.toFixed(4)).join(',');
  const q = `[out:json][timeout:90];node["ford"]["ford"!="no"](${bb});out;`;
  for (let i = 0; i < 6; i++) {
    try {
      const res = await fetch('https://overpass-api.de/api/interpreter', { method: 'POST', headers: { ...UA, 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'data=' + encodeURIComponent(q) });
      if (res.ok) {
        const r = await res.json();
        return r.elements.map((e) => {
          const k = 111320 * Math.cos((e.lat * Math.PI) / 180), P = [e.lon * k, e.lat * 110540];
          let best = Infinity, acc = 0, bestD = Infinity, bestAcc = 0;
          for (let j = 0; j < full.length; j++) {
            if (j) {
              acc += hav(full[j - 1], full[j]);
              best = Math.min(best, segDist(P, [full[j - 1][1] * k, full[j - 1][0] * 110540], [full[j][1] * k, full[j][0] * 110540]));
            }
            const dd = hav([e.lat, e.lon], full[j]);
            if (dd < bestD) { bestD = dd; bestAcc = acc; }
          }
          return { osmId: 'node/' + e.id, coords: [e.lat, e.lon], tags: e.tags, distM: Math.round(best), alongKm: +(bestAcc / 1000).toFixed(1) };
        }).filter((f) => f.distM <= 2).sort((a, b) => a.alongKm - b.alongKm);
      }
      console.warn('  HTTP ' + res.status);
    } catch (e) { console.warn('  ERR ' + e.message); }
    await sleep(5000 * 2 ** i);
  }
  return null;
}

for (const item of [...data.days, ...data.alternatives]) {
  if (item.fords !== null || !item.waypoints.length || !item.route) continue;
  console.log('Relance gués : ' + item.waypoints.join(' > '));
  item.fords = await fords(await fullGeometry(item.waypoints));
  console.log('  → ' + (item.fords ? item.fords.length + ' gué(s) OSM' : 'échec, reste « À vérifier »'));
  await sleep(4000);
}
await writeFile('src/data/generated.json', JSON.stringify(data, null, 1));
console.log('OK');
