// Complète les photos des lieux qui n'en ont aucune (Wikimedia Commons limite le débit : HTTP 429).
// Même règles que build-data.mjs : P18 Wikidata ou catégorie Commons du lieu, licences libres uniquement.
// Usage : node scripts/retry-photos.mjs
import { readFile, writeFile } from 'node:fs/promises';
import { concordant } from './photo-filter.mjs';

const UA = { 'User-Agent': 'IcelandRoadTrip2027/0.1 (personal non-commercial trip planner)' };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const OK_LICENSE = /^(CC BY(-SA)? [\d.]+|CC0|Public domain|PD|CC BY-SA [\d.]+ .*|CC BY [\d.]+ .*)/i;
const strip = (h) => (h ?? '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

async function getJson(url) {
  for (let i = 0; i < 5; i++) {
    const r = await fetch(url, { headers: UA }).catch(() => null);
    if (r?.ok) return r.json();
    console.warn(`  HTTP ${r?.status ?? 'ERR'} – nouvelle tentative`);
    await sleep(10000 * (i + 1));
  }
  return null;
}

const data = JSON.parse(await readFile('src/data/generated.json', 'utf8'));
const todo = Object.entries(data.places).filter(([, p]) => !p.photos.length && (p.imageQid || p.qid));
const qids = [...new Set(todo.map(([, p]) => p.imageQid ?? p.qid))];
const q = `SELECT ?item ?img ?cat WHERE { VALUES ?item { ${qids.map((x) => 'wd:' + x).join(' ')} } OPTIONAL { ?item wdt:P18 ?img } OPTIONAL { ?item wdt:P373 ?cat } }`;
const wd = {};
for (const b of (await getJson('https://query.wikidata.org/sparql?format=json&query=' + encodeURIComponent(q)))?.results?.bindings ?? []) {
  const id = b.item.value.split('/').pop();
  const o = (wd[id] ??= { images: new Set(), cat: null });
  if (b.img) o.images.add(decodeURIComponent(b.img.value.split('/').pop()));
  if (b.cat) o.cat = b.cat.value;
}

for (const [id, p] of todo) {
  const w = wd[p.imageQid ?? p.qid];
  if (!w) { console.log(`${id} : aucune image Wikidata ni catégorie`); continue; }
  const list = [...w.images];
  if (w.cat) {
    await sleep(3000);
    const r = await getJson(`https://commons.wikimedia.org/w/api.php?action=query&list=categorymembers&cmtitle=${encodeURIComponent('Category:' + w.cat)}&cmtype=file&cmlimit=40&format=json`);
    for (const m of r?.query?.categorymembers ?? []) {
      const t = m.title.replace(/^File:/, '');
      if (/\.jpe?g$/i.test(t) && !/map|carte|kort|diagram|logo/i.test(t) && !list.includes(t)) list.push(t);
    }
  }
  const titles = list.slice(0, 9);
  if (!titles.length) { console.log(`${id} : 0 fichier`); continue; }
  await sleep(3000);
  const r = await getJson(`https://commons.wikimedia.org/w/api.php?action=query&prop=imageinfo&iiprop=url|extmetadata|size|mime&iiurlwidth=1600&format=json&titles=${encodeURIComponent(titles.map((t) => 'File:' + t).join('|'))}`);
  const photos = [];
  for (const t of titles) {
    const pg = Object.values(r?.query?.pages ?? {}).find((x) => x.title.replace(/^File:/, '') === t.replace(/_/g, ' '));
    const ii = pg?.imageinfo?.[0];
    if (!ii) continue;
    const m = ii.extmetadata ?? {};
    const ph = {
      file: pg.title, thumb: ii.thumburl, full: ii.url, page: ii.descriptionurl, width: ii.width, height: ii.height, mime: ii.mime,
      author: strip(m.Artist?.value) || 'Auteur non indiqué', license: m.LicenseShortName?.value ?? null, licenseUrl: m.LicenseUrl?.value ?? null,
      description: strip(m.ImageDescription?.value).slice(0, 220), date: strip(m.DateTimeOriginal?.value).slice(0, 20),
      attributionRequired: m.AttributionRequired?.value !== 'false',
      basis: w.images.has(t) ? `Image principale (P18) de l'élément Wikidata ${p.imageQid ?? p.qid}` : `Fichier classé dans Category:${w.cat} sur Wikimedia Commons`,
    };
    if (ph.license && OK_LICENSE.test(ph.license) && ph.width >= 1000 && ph.width >= ph.height * 0.9 && concordant(id, p, ph)) photos.push(ph);
  }
  p.photos = photos.slice(0, 5);
  p.commonsCategory ??= w.cat;
  console.log(`${id} : ${p.photos.length} photo(s)`);
}
await writeFile('src/data/generated.json', JSON.stringify(data, null, 1));
console.log('OK');
