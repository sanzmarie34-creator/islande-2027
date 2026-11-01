// Contrôle de concordance photo ↔ lieu.
// Une catégorie Commons contient souvent des fichiers hors sujet (bus, hôtel, autre lac…).
// Règle : on garde l'image principale Wikidata (P18), sinon seulement les fichiers dont le nom
// contient le nom du lieu. Usage autonome : node scripts/photo-filter.mjs
import { readFile, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  .replace(/ð/g, 'd').replace(/þ/g, 'th').replace(/æ/g, 'ae').replace(/ø/g, 'o');

// Mots-clés quand le nom affiché ne convient pas
const MATCH = {
  kef: ['keflavik'],
  highlandbase: ['kerlingarfjoll'],
  skutustadagigar: ['skutustadagigar', 'pseudo crater'],
  namafjall: ['namafjall', 'hverir'],
  laki: ['laki'],
  ofaerufoss: ['ofaerufoss'],
  eldgja: ['eldgja'],
  asbyrgi: ['asbyrgi'],
  selfossTown: ['selfoss'],
};

export function keywords(id, place) {
  return MATCH[id] ?? [norm(place.name.split(/ \(| – /)[0])];
}

export function concordant(id, place, photo) {
  if (photo.basis?.startsWith('Image principale')) return true;
  const f = norm(photo.file);
  return keywords(id, place).some((k) => f.includes(k));
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const data = JSON.parse(await readFile('src/data/generated.json', 'utf8'));
  for (const [id, p] of Object.entries(data.places)) {
    const before = p.photos.length;
    const dropped = p.photos.filter((ph) => !concordant(id, p, ph));
    p.photos = p.photos.filter((ph) => concordant(id, p, ph));
    if (dropped.length) console.log(`${id} : ${before} → ${p.photos.length} (écartées : ${dropped.map((d) => d.file.slice(5, 45)).join(' | ')})`);
  }
  await writeFile('src/data/generated.json', JSON.stringify(data, null, 1));
  console.log('OK');
}
