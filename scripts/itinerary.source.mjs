// Source documentée de l'itinéraire : chaque lieu porte l'origine de ses coordonnées.
// - qid : élément Wikidata (coordonnées P625, photo P18, catégorie Commons P373)
// - osm : objet OpenStreetMap utilisé quand il est plus précis (parking, refuge, hôtel)
// - coords : [lat, lon] retenues ; coordSource dit d'où elles viennent.
// Les coordonnées ont été relevées le 2026-10-31 via la requête SPARQL Wikidata et l'API Overpass.

export const VERIFIED_ON = '2026-10-31';

export const places = {
  kef: { name: 'Aéroport de Keflavík', qid: 'Q139921', coords: [63.985, -22.605556], coordSource: 'Wikidata Q139921 (P625)' },
  geysir: { name: 'Geysir (Haukadalur)', qid: 'Q216846', coords: [64.313834, -20.299494], coordSource: 'Wikidata Q216846 (P625)' },
  gullfoss: { name: 'Gullfoss', qid: 'Q38519', coords: [64.326111, -20.121111], coordSource: 'Wikidata Q38519 (P625)' },
  highlandbase: { name: 'Kerlingarfjöll – Highland Base (Ásgarður)', qid: 'Q1739281', osm: 'way/38515213', coords: [64.68383, -19.30348], coordSource: 'OpenStreetMap way/38515213 (camping Kerlingarfjöll)', website: 'https://highlandbase.is/' },
  hveradalir: { name: 'Hveradalir (Kerlingarfjöll)', qid: 'Q27005172', coords: [64.633333, -19.283333], coordSource: 'Wikidata Q27005172 (P625) – précision faible (arrondie)', lowPrecision: true },
  hveravellir: { name: 'Hveravellir', qid: 'Q1130741', osm: 'way/68207856', coords: [64.86661, -19.5534], coordSource: 'OpenStreetMap way/68207856 (refuge Hveravellir)', website: 'https://hveravellir.is/' },
  blonduos: { name: 'Blönduós', qid: 'Q887147', coords: [65.666667, -20.3], coordSource: 'Wikidata Q887147 (P625)' },
  akureyri: { name: 'Akureyri', qid: 'Q29042', coords: [65.68353, -18.0878], coordSource: 'Wikidata Q29042 (P625)' },
  godafoss: { name: 'Goðafoss', qid: 'Q1137629', coords: [65.68313, -17.550377], coordSource: 'Wikidata Q1137629 (P625)' },
  fossholl: { name: 'Fosshóll (Hótel Goðafoss)', osm: 'node/1915620189', coords: [65.68532, -17.53906], coordSource: 'OpenStreetMap node/1915620189', website: 'https://hotel-godafoss.is/' },
  skutustadagigar: { name: 'Skútustaðagígar (pseudo-cratères)', qid: 'Q16677092', imageQid: 'Q97502860', coords: [65.5709, -17.0349], coordSource: 'Wikidata Q16677092 (P625)' },
  reykjahlid: { name: 'Reykjahlíð (Mývatn)', qid: 'Q1026867', coords: [65.643611, -16.908611], coordSource: 'Wikidata Q1026867 (P625)' },
  grjotagja: { name: 'Grjótagjá', qid: 'Q966241', coords: [65.62716, -16.88168], coordSource: 'Wikidata Q966241 (P625) – 2 coordonnées contradictoires sur Wikidata ; celle retenue est cohérente avec la rive est du Mývatn', conflict: 'Wikidata contient aussi 65.558,-16.881 (≈ 7,6 km plus au sud) : à valider.' },
  hverfjall: { name: 'Hverfjall', qid: 'Q1639571', coords: [65.604469, -16.871942], coordSource: 'Wikidata Q1639571 (P625)' },
  dimmuborgir: { name: 'Dimmuborgir', qid: 'Q1000285', coords: [65.590278, -16.899444], coordSource: 'Wikidata Q1000285 (P625)' },
  namafjall: { name: 'Námafjall – Hverir', qid: 'Q940545', coords: [65.636197, -16.823359], coordSource: 'Wikidata Q940545 (P625, sommet du Námafjall ; Hverir est au pied est)' },
  viti: { name: 'Víti (Krafla)', qid: 'Q14552532', osm: 'way/236287695', coords: [65.71768, -16.75755], coordSource: 'OpenStreetMap way/236287695 (parking proche du cratère, Wikidata Q14552532 : 65.7171,-16.7538)' },
  leirhnjukur: { name: 'Leirhnjúkur', qid: 'Q2755688', coords: [65.720833, -16.792778], coordSource: 'Wikidata Q2755688 (P625)', poiOnly: true },
  dettifoss: { name: 'Dettifoss (rive ouest)', qid: 'Q210280', osm: 'node/2993648665', coords: [65.8199, -16.4115], coordSource: 'OpenStreetMap node/2993648665 (parking rive ouest) ; chute : Wikidata Q210280', conflict: 'Wikidata donne deux coordonnées pour la chute (65.8143,-16.3846 et 65.8219,-16.3882).' },
  selfoss: { name: 'Selfoss (chute)', qid: 'Q1429734', coords: [65.804905, -16.386376], coordSource: 'Wikidata Q1429734 (P625)', poiOnly: true },
  hafragilsfoss: { name: 'Hafragilsfoss', qid: 'Q1568140', coords: [65.832058, -16.399651], coordSource: 'Wikidata Q1568140 (P625)', poiOnly: true },
  asbyrgi: { name: 'Ásbyrgi (Gljúfrastofa)', qid: 'Q252506', osm: 'way/365852924', coords: [66.02851, -16.48716], coordSource: 'OpenStreetMap way/365852924 (centre d’accueil Gljúfrastofa)', website: 'https://www.vatnajokulsthjodgardur.is/en/areas/jokulsargljufur/gljufrastofa' },
  hljodaklettar: { name: 'Hljóðaklettar (Vesturdalur)', qid: 'Q3785987', osm: 'way/1170871522', coords: [65.94078, -16.5482], coordSource: 'OpenStreetMap way/1170871522 (parking Vesturdalur) ; site : Wikidata Q3785987' },
  husavik: { name: 'Húsavík', qid: 'Q219417', coords: [66.043889, -17.341667], coordSource: 'Wikidata Q219417 (P625)' },
  aldeyjarfoss: { name: 'Aldeyjarfoss', qid: 'Q1827108', coords: [65.366433, -17.336525], coordSource: 'Wikidata Q1827108 (P625)' },
  nyidalur: { name: 'Nýidalur (refuge FÍ)', qid: 'Q2007179', osm: 'node/1243149915', coords: [64.73505, -18.07294], coordSource: 'OpenStreetMap node/1243149915 (refuge)', conflict: 'Wikidata Q2007179 place Nýidalur à 64.7075,-18.0211 (vallée, ≈ 3,7 km).' },
  hrauneyjar: { name: 'Hrauneyjar – Highland Center', osm: 'way/80445315', coords: [64.19665, -19.2848], coordSource: 'OpenStreetMap way/80445315', website: 'https://www.thehighlandcenter.is/' },
  landmannalaugar: { name: 'Landmannalaugar (parking P1)', qid: 'Q950447', osm: 'way/436503639', coords: [63.99503, -19.0597], coordSource: 'OpenStreetMap way/436503639 (parking P1, passerelle piétonne vers le refuge selon FÍ)', website: 'https://www.ust.is/english/visiting-iceland/protected-areas/south/fjallabak-nature-reserve/landmannalaugar/reservations/' },
  brennisteinsalda: { name: 'Brennisteinsalda', qid: 'Q280822', coords: [63.980833, -19.145833], coordSource: 'Wikidata Q280822 (P625)', poiOnly: true },
  blahnukur: { name: 'Bláhnúkur', qid: 'Q886940', coords: [63.9768, -19.0681], coordSource: 'Wikidata Q886940 (P625)', poiOnly: true },
  laugahraun: { name: 'Laugahraun', qid: 'Q16420003', coords: [63.9891, -19.0749], coordSource: 'Wikidata Q16420003 (P625)', poiOnly: true },
  ljotipollur: { name: 'Ljótipollur', qid: 'Q653324', coords: [64.03532, -18.998222], coordSource: 'Wikidata Q653324 (P625)', poiOnly: true },
  eldgja: { name: 'Eldgjá – Ófærufoss', qid: 'Q388641', coords: [63.966624, -18.609127], coordSource: 'Wikidata Q388641 (P625)' },
  ofaerufoss: { name: 'Ófærufoss', qid: 'Q292937', coords: [63.964228, -18.617412], coordSource: 'Wikidata Q292937 (P625)', poiOnly: true },
  klaustur: { name: 'Kirkjubæjarklaustur', qid: 'Q1010183', coords: [63.766667, -18.066667], coordSource: 'Wikidata Q1010183 (P625, arrondie)' },
  systrafoss: { name: 'Systrafoss', qid: 'Q279439', coords: [63.787650, -18.060538], coordSource: 'Wikidata Q279439 (P625)', poiOnly: true },
  kirkjugolf: { name: 'Kirkjugólf', qid: 'Q3197399', coords: [63.795385, -18.046417], coordSource: 'Wikidata Q3197399 (P625)', poiOnly: true },
  fagrifoss: { name: 'Fagrifoss', qid: 'Q1380441', coords: [63.868206, -18.246022], coordSource: 'Wikidata Q1380441 (P625)' },
  laki: { name: 'Laki (parking)', qid: 'Q16653094', imageQid: 'Q203726', osm: 'way/966512123', coords: [64.06268, -18.2445], coordSource: 'OpenStreetMap way/966512123 (parking au pied du Laki) ; mont Laki : Wikidata Q16653094' },
  borgarnes: { name: 'Borgarnes', qid: 'Q276537', coords: null, coordSource: 'Wikidata Q276537 (P625)' },
  hella: { name: 'Hella', isLabel: 'Hella', coords: null, coordSource: 'Wikidata (libellé islandais « Hella », pays Islande, P625)' },
  selfossTown: { name: 'Selfoss (ville)', qid: 'Q192898', coords: [63.932169, -21.000228], coordSource: 'Wikidata Q192898 (P625)' },
};

// Points de passage techniques (nœuds OSM situés sur la piste F26) : ils forcent le calcul
// à suivre la F26 au lieu de pistes parallèles (ex. Kvíslavegur). Ce ne sont pas des arrêts.
export const viaPoints = {
  f26_north: { coords: [65.0076766, -17.9588377], source: 'OpenStreetMap node/436391087 (sur une voie ref=F26)' },
  f26_south1: { coords: [64.6788565, -18.2130817], source: 'OpenStreetMap node/613791740 (sur une voie ref=F26)' },
  f26_south2: { coords: [64.54713, -18.41549], source: 'OpenStreetMap node/613782388 (sur une voie ref=F26)' },
};

// route : suite ordonnée de lieux / points via utilisés pour le calcul OSRM.
// stops : lieux affichés (arrêts) ; night : hébergement du soir.
export const days = [
  { n: 1, date: '2027-06-25', from: 'kef', to: 'geysir', route: ['kef', 'geysir'], night: 'geysir', title: 'Arrivée et route vers Haukadalur' },
  { n: 2, date: '2027-06-26', from: 'geysir', to: 'highlandbase', route: ['geysir', 'gullfoss', 'highlandbase'], night: 'highlandbase', title: 'Kjölur (route 35) jusqu’à Kerlingarfjöll' },
  { n: 3, date: '2027-06-27', from: 'highlandbase', to: 'hveravellir', route: ['highlandbase', 'hveradalir', 'hveravellir'], night: 'hveravellir', title: 'Hveradalir puis Hveravellir' },
  { n: 4, date: '2027-06-28', from: 'hveravellir', to: 'akureyri', route: ['hveravellir', 'blonduos', 'akureyri'], night: 'akureyri', title: 'Fin de Kjölur, vers Akureyri' },
  { n: 5, date: '2027-06-29', from: 'akureyri', to: 'reykjahlid', route: ['akureyri', 'godafoss', 'skutustadagigar', 'reykjahlid'], night: 'reykjahlid', title: 'Goðafoss et arrivée au Mývatn' },
  { n: 6, date: '2027-06-30', from: 'reykjahlid', to: 'reykjahlid', route: ['reykjahlid', 'grjotagja', 'hverfjall', 'dimmuborgir', 'namafjall', 'reykjahlid'], night: 'reykjahlid', title: 'Tour du Mývatn' },
  { n: 7, date: '2027-07-01', from: 'reykjahlid', to: 'asbyrgi', route: ['reykjahlid', 'viti', 'dettifoss', 'asbyrgi'], extraStops: ['leirhnjukur', 'selfoss', 'hafragilsfoss'], night: 'asbyrgi', title: 'Krafla, Dettifoss et Ásbyrgi' },
  { n: 8, date: '2027-07-02', from: 'asbyrgi', to: 'husavik', route: ['asbyrgi', 'hljodaklettar', 'husavik'], night: 'husavik', title: 'Hljóðaklettar puis Húsavík' },
  { n: 9, date: '2027-07-03', from: 'husavik', to: 'husavik', route: [], night: 'husavik', title: 'Húsavík – journée libre / tampon', bufferDay: true },
  { n: 10, date: '2027-07-04', from: 'husavik', to: 'fossholl', route: ['husavik', 'fossholl'], night: 'fossholl', title: 'Vers Goðafoss, veille de la F26', bufferDay: true },
  { n: 11, date: '2027-07-05', from: 'fossholl', to: 'hrauneyjar', route: ['fossholl', 'aldeyjarfoss', 'f26_north', 'nyidalur', 'f26_south1', 'f26_south2', 'hrauneyjar'], night: 'hrauneyjar', title: 'Sprengisandur (F26) du nord au sud', critical: true },
  { n: 12, date: '2027-07-06', from: 'hrauneyjar', to: 'landmannalaugar', route: ['hrauneyjar', 'landmannalaugar'], extraStops: ['laugahraun', 'brennisteinsalda', 'blahnukur'], night: 'landmannalaugar', title: 'Landmannalaugar par la F208 nord' },
  { n: 13, date: '2027-07-07', from: 'landmannalaugar', to: 'klaustur', route: ['landmannalaugar', 'eldgja', 'klaustur'], extraStops: ['ofaerufoss'], night: 'klaustur', title: 'F208 sud par Eldgjá jusqu’à Kirkjubæjarklaustur', critical: true },
  { n: 14, date: '2027-07-08', from: 'klaustur', to: 'klaustur', route: ['klaustur', 'fagrifoss', 'laki', 'klaustur'], night: 'klaustur', title: 'Laki et Lakagígar (F206)', critical: true },
  { n: 15, date: '2027-07-09', from: 'klaustur', to: 'kef', route: ['klaustur', 'kef'], extraStops: ['systrafoss', 'kirkjugolf'], night: null, title: 'Retour vers Keflavík' },
];

// Variantes calculées avec la même méthode.
export const alternatives = [
  { id: 'B-kjolur', replaces: 11, title: 'F26 fermée : retour au sud par Kjölur (route 35)', route: ['fossholl', 'akureyri', 'hveravellir', 'gullfoss', 'hrauneyjar'] },
  { id: 'B-ring', replaces: 11, title: 'F26 fermée : retour au sud par la route 1 (ouest)', route: ['fossholl', 'akureyri', 'blonduos', 'borgarnes', 'selfossTown', 'hrauneyjar'] },
  { id: 'C-f208north', replaces: 13, title: 'F208 sud impraticable : retour par Sigalda et la route 1', route: ['landmannalaugar', 'hrauneyjar', 'hella', 'klaustur'] },
];
