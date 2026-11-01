// Contenu rédigé à partir des sources du registre (sources.ts).
// Règle : une valeur absente reste `null` et s'affiche « À vérifier ». Rien n'est extrapolé.
export type Status = 'officiel' | 'calcule' | 'secondaire' | 'a_verifier';

export interface Hike { name: string; km: string | null; duration: string | null; difficulty: string | null; source: string | null; status: Status; note?: string }
export interface FordInfo { road: string; statement: string; status: Status; source: string | null }
export interface Lodging { name: string; url?: string; source: string; note?: string }
export interface DayContent {
  n: number;
  summary: string;
  difficulty: { level: 'Facile' | 'Modérée' | 'Exigeante' | 'Très exigeante'; basis: string };
  fords: FordInfo[];
  hikes: Hike[];
  lodging: Lodging[];
  tips: string[];
  sources: string[];
  mustCheck: string[]; // informations sensibles à revérifier avant le départ
}

// Vegagerðin, page « Opening of mountain roads », consultée le 2026-10-31. Valeurs recopiées telles quelles.
export const OPENINGS = [
  { road: '35', name: 'Kjalvegur – Gullfoss → Hveravellir', years: ['11/06', '10/06', '01/06', '14/06', '30/05'], earliest: '30/05', latest: '14/06', avg: '01/06' },
  { road: '35', name: 'Kjalvegur – Hveravellir → Blönduvirkjun', years: ['09/06', '08/06', '01/06', '14/06', '26/05'], earliest: '01/06', latest: '14/06', avg: '06/06', anomaly: 'La page indique « plus précoce : 1 juin » alors que 2025 = 26 mai : incohérence de la source.' },
  { road: 'F26', name: 'Sprengisandur – Hrauneyjar → Nýidalur', years: ['09/07', '13/07', '21/06', '13/07', '03/07'], earliest: '21/06', latest: '13/07', avg: '06/07' },
  { road: 'F26', name: 'Sprengisandur – Nýidalur → Bárðardalur', years: ['09/07', '13/07', '21/06', '10/07', '03/07'], earliest: '21/06', latest: '13/07', avg: '06/07' },
  { road: 'F208', name: 'Fjallabaksleið nyrðri – Sigalda → Landmannalaugar', years: ['12/06', '23/06', '01/06', '12/06', '23/05'], earliest: '23/05', latest: '23/06', avg: '02/06' },
  { road: 'F208', name: 'Fjallabaksleið nyrðri – Landmannalaugar → Eldgjá', years: ['01/07', '06/07', '16/06', '25/06', '19/06'], earliest: '16/06', latest: '06/07', avg: '25/06' },
  { road: 'F208', name: 'Fjallabaksleið nyrðri – Eldgjá → Skaftártunga', years: ['10/06', '26/06', '01/06', '10/06', '19/06'], earliest: '01/06', latest: '26/06', avg: '13/05', anomaly: 'Moyenne publiée « 13 mai » incompatible avec les dates annuelles (toutes en juin) : probablement une coquille de la source.' },
  { road: 'F206', name: 'Lakagígar', years: ['25/06', '01/07', '12/06', '18/06', '12/06'], earliest: '12/06', latest: '01/07', avg: '20/06' },
  { road: 'F225', name: 'Landmannaleið (Dómadalur)', years: ['18/06', '24/06', '09/06', '18/06', '11/06'], earliest: '09/06', latest: '24/06', avg: '16/06' },
];
export const OPENING_YEARS = ['2021', '2022', '2023', '2024', '2025'];

export const DAY_CONTENT: DayContent[] = [
  {
    n: 1,
    summary: 'Arrivée à Keflavík, récupération du véhicule, route vers Haukadalur (Geysir). Faire le plein à Geysir : il n’y a pas de carburant sur Kjölur.',
    difficulty: { level: 'Facile', basis: 'Routes revêtues du réseau principal (tracé OSRM).' },
    fords: [],
    hikes: [],
    lodging: [{ name: 'Secteur Geysir / Haukadalur', source: 'À choisir', note: 'Aucun établissement vérifié à ce stade.' }],
    tips: ['Vérifier dans le contrat de location les routes autorisées (route 35 et pistes F) avant de partir de l’agence.', 'Carburant : station la plus proche de Kjölur à Geysir (Umhverfisstofnun).'],
    sources: ['ust_kerlingarfjoll', 'osrm'],
    mustCheck: ['Horaires du vol et heure de prise du véhicule', 'Conditions du loueur pour la route 35 et les pistes F'],
  },
  {
    n: 2,
    summary: 'Gullfoss puis la route 35 (Kjalvegur) vers le nord, et la F347 jusqu’à Kerlingarfjöll (Highland Base, Ásgarður).',
    difficulty: { level: 'Modérée', basis: 'Route de montagne 35 non classée F, puis piste F347 « praticable pour tous les 4x4 » (Umhverfisstofnun).' },
    fords: [
      { road: 'F347', statement: 'Aucun gué sur la route d’accès (Umhverfisstofnun).', status: 'officiel', source: 'ust_kerlingarfjoll' },
      { road: '35', statement: 'Présence de gués sur la 35 : non documentée par les sources consultées.', status: 'a_verifier', source: null },
    ],
    hikes: [{ name: 'Source chaude de l’Ásgarðsá', km: '1,1 km (aller)', duration: '≈ 15 min', difficulty: null, source: 'ust_kerlingarfjoll', status: 'officiel' }],
    lodging: [{ name: 'Highland Base Kerlingarfjöll', url: 'https://highlandbase.is/', source: 'OpenStreetMap / Umhverfisstofnun (service center Ásgarður)' }],
    tips: ['Ouverture historique de la 35 (Gullfoss → Hveravellir) entre le 30/05 et le 14/06 sur 2021–2025 (Vegagerðin).'],
    sources: ['vegagerdin_opening', 'ust_kerlingarfjoll', 'osrm'],
    mustCheck: ['Ouverture de la route 35 et de la F347 sur umferdin.is'],
  },
  {
    n: 3,
    summary: 'Matinée dans la zone géothermale de Hveradalir, puis retour sur la 35 jusqu’à Hveravellir (bassin chaud, sentiers).',
    difficulty: { level: 'Modérée', basis: 'Piste F347 et route 35 non revêtues.' },
    fords: [
      { road: 'F347', statement: 'Aucun gué sur la route d’accès depuis Kjalvegur (Umhverfisstofnun).', status: 'officiel', source: 'ust_kerlingarfjoll' },
      { road: 'OSM', statement: 'Un point de gué est pourtant cartographié sur le tracé calculé (voir tableau) : contradiction avec Umhverfisstofnun, à valider sur place.', status: 'a_verifier', source: 'osm' },
    ],
    hikes: [
      { name: 'Neðri-Hveradalir (boucle)', km: null, duration: null, difficulty: null, source: 'ust_kerlingarfjoll_trails', status: 'a_verifier', note: 'Extrait de recherche contradictoire (10 km / 1–2 h) : distance et durée à vérifier sur le guide PDF officiel.' },
      { name: 'Zone des sources chaudes de Hveravellir', km: null, duration: '15–30 min', difficulty: null, source: 'ust_hveravellir_trails', status: 'officiel' },
      { name: 'Eyvindarhellir et Eyvindarrétt', km: null, duration: '30–45 min', difficulty: null, source: 'ust_hveravellir_trails', status: 'officiel' },
      { name: 'Strýtur', km: null, duration: '3–4 h', difficulty: null, source: 'ust_hveravellir_trails', status: 'officiel' },
    ],
    lodging: [{ name: 'Hveravellir (refuges et camping)', url: 'https://hveravellir.is/', source: 'OpenStreetMap' }],
    tips: ['Rester sur les passerelles : le sol peut être instable au-dessus de l’eau bouillante (Umhverfisstofnun).'],
    sources: ['ust_kerlingarfjoll', 'ust_kerlingarfjoll_trails', 'ust_hveravellir_trails'],
    mustCheck: ['Distances officielles des sentiers de Hveradalir'],
  },
  {
    n: 4,
    summary: 'Fin de Kjölur vers le nord (Blöndulón), Blönduós puis la route 1 jusqu’à Akureyri.',
    difficulty: { level: 'Modérée', basis: 'Fin de la route 35 non revêtue, puis route 1.' },
    fords: [{ road: '35', statement: 'Non documenté par les sources consultées.', status: 'a_verifier', source: null }],
    hikes: [],
    lodging: [{ name: 'Akureyri', source: 'À choisir', note: 'Aucun établissement vérifié.' }],
    tips: ['Ouverture historique de Hveravellir → Blönduvirkjun entre fin mai et le 14/06 (Vegagerðin).'],
    sources: ['vegagerdin_opening', 'osrm'],
    mustCheck: [],
  },
  {
    n: 5,
    summary: 'Akureyri le matin, Goðafoss, puis les pseudo-cratères de Skútustaðir et l’arrivée à Reykjahlíð (Mývatn).',
    difficulty: { level: 'Facile', basis: 'Route 1 revêtue.' },
    fords: [], hikes: [],
    lodging: [{ name: 'Reykjahlíð / Mývatn', source: 'À choisir' }],
    tips: [], sources: ['osrm'], mustCheck: [],
  },
  {
    n: 6,
    summary: 'Tour de la rive est du Mývatn : Grjótagjá, Hverfjall, Dimmuborgir, puis Námafjall et le champ géothermal de Hverir.',
    difficulty: { level: 'Facile', basis: 'Routes revêtues et courtes pistes d’accès.' },
    fords: [],
    hikes: [{ name: 'Dimmuborgir – Kirkjuhringur', km: '1,8 à 2,9 km selon les sources', duration: null, difficulty: null, source: null, status: 'secondaire', note: 'Seules des sources secondaires ont été trouvées ; elles se contredisent.' }],
    lodging: [{ name: 'Reykjahlíð / Mývatn', source: 'À choisir' }],
    tips: ['Grjótagjá : Wikidata contient deux coordonnées contradictoires ; celle retenue est cohérente avec la rive est.'],
    sources: ['wikidata', 'osrm'],
    mustCheck: ['Règles d’accès / baignade à Grjótagjá'],
  },
  {
    n: 7,
    summary: 'Krafla (cratère Víti, Leirhnjúkur), puis Dettifoss par la rive ouest (route 862), Selfoss, et Ásbyrgi.',
    difficulty: { level: 'Facile', basis: 'Route 862 revêtue selon le tracé OSM (à confirmer).' },
    fords: [],
    hikes: [
      { name: 'Dettifoss et Selfoss', km: '2,5 km', duration: '1 h', difficulty: 'Facile', source: 'vjp_dettifoss_s2', status: 'officiel', note: 'Départ du parking à l’ouest de Dettifoss.' },
      { name: 'Hafragil (vers Hafragilsfoss)', km: null, duration: null, difficulty: 'Raide, risque de chutes de pierres', source: 'vjp_dettifoss_s2', status: 'officiel' },
      { name: 'Á1 Botnstjörn (Ásbyrgi)', km: '1 km', duration: '30 min', difficulty: 'Mobilité réduite', source: 'vjp_asbyrgi', status: 'officiel' },
      { name: 'Á2 Eyjan (Ásbyrgi)', km: '4,5 km', duration: '1,5–2 h', difficulty: 'Facile', source: 'vjp_asbyrgi', status: 'officiel' },
    ],
    lodging: [{ name: 'Camping d’Ásbyrgi ou hébergements des environs', source: 'Vatnajökulsþjóðgarður (camping)', note: 'Hébergement en dur : à rechercher.' }],
    tips: [],
    sources: ['vjp_dettifoss_s2', 'vjp_asbyrgi', 'osrm'],
    mustCheck: [],
  },
  {
    n: 8,
    summary: 'Vesturdalur et les orgues de Hljóðaklettar, puis la péninsule de Tjörnes jusqu’à Húsavík.',
    difficulty: { level: 'Facile', basis: 'Vesturdalur accessible par route revêtue (Vatnajökulsþjóðgarður).' },
    fords: [],
    hikes: [
      { name: 'V2 Hljóðaklettar – Tröllið', km: '1,2 km', duration: '30 min', difficulty: 'Facile', source: 'vjp_hljodaklettar', status: 'officiel' },
      { name: 'V3 Boucle de Hljóðaklettar', km: '3 km', duration: '1–1,5 h', difficulty: 'Exigeante', source: 'vjp_hljodaklettar', status: 'officiel' },
      { name: 'V4 Rauðhólar', km: '5 km', duration: '1,5–2 h', difficulty: 'Exigeante', source: 'vjp_hljodaklettar', status: 'officiel' },
    ],
    lodging: [{ name: 'Húsavík', source: 'À choisir' }],
    tips: [], sources: ['vjp_hljodaklettar', 'osrm'], mustCheck: [],
  },
  {
    n: 9,
    summary: 'Journée sans longue route à Húsavík (excursion d’observation des baleines possible). Elle sert aussi de tampon si l’ouverture de la F26 est tardive.',
    difficulty: { level: 'Facile', basis: 'Pas de trajet prévu.' },
    fords: [], hikes: [],
    lodging: [{ name: 'Húsavík', source: 'À choisir' }],
    tips: ['Consulter umferdin.is ce jour-là pour décider entre la F26 et le plan B.'],
    sources: ['umferdin', 'vegagerdin_opening'],
    mustCheck: ['Opérateurs d’observation des baleines (non vérifiés)'],
  },
  {
    n: 10,
    summary: 'Courte route vers Fosshóll (Goðafoss), point de départ de la F26 par le Bárðardalur.',
    difficulty: { level: 'Facile', basis: 'Routes revêtues.' },
    fords: [], hikes: [],
    lodging: [{ name: 'Hótel Goðafoss (Fosshóll)', url: 'https://hotel-godafoss.is/', source: 'OpenStreetMap' }],
    tips: ['Faire le plein complet : aucun service de carburant n’a été vérifié sur la F26.'],
    sources: ['osm'],
    mustCheck: ['Carburant disponible sur ou près de la F26'],
  },
  {
    n: 11,
    summary: 'Traversée du Sprengisandur par la F26, d’Aldeyjarfoss à Hrauneyjar via le refuge de Nýidalur. Journée la plus incertaine du voyage.',
    difficulty: { level: 'Très exigeante', basis: 'Longue piste F en totalité, gués cartographiés, aucun service vérifié sur le parcours.' },
    fords: [
      { road: 'F26', statement: 'Aucun nombre officiel de gués trouvé. Les points de gué cartographiés dans OpenStreetMap sont listés ci-dessous (données communautaires, non exhaustives, sans indication de difficulté).', status: 'a_verifier', source: 'osm' },
      { road: 'F26', statement: 'Plusieurs guides citent la Hagakvísl près de Nýidalur comme principal gué — information non vérifiée par une source officielle.', status: 'secondaire', source: 'sec_f26_hagakvisl' },
    ],
    hikes: [],
    lodging: [{ name: 'Hrauneyjar – Highland Center', url: 'https://www.thehighlandcenter.is/', source: 'OpenStreetMap' }],
    tips: [
      'Ouverture historique de la F26 : du 21/06 au 13/07 (moyenne 06/07) sur 2021–2025. Au 5 juillet, la piste n’était ouverte que 2 années sur 5 (2023, 2025).',
      'Le plan B (sans F26) est donc aussi probable que le plan A : voir les variantes calculées.',
      'Ne jamais franchir un gué en cas de doute ; attendre d’autres véhicules (Safetravel).',
    ],
    sources: ['vegagerdin_opening', 'safetravel_highland', 'osm', 'osrm', 'sec_f26_hagakvisl'],
    mustCheck: ['Ouverture de la F26 (umferdin.is)', 'Niveau des gués (refuge de Nýidalur)', 'Autorisation du loueur pour la F26', 'Carburant'],
  },
  {
    n: 12,
    summary: 'Hrauneyjar → Landmannalaugar par la F208 nord (Sigalda). Randonnée dans les rhyolites colorées l’après-midi.',
    difficulty: { level: 'Exigeante', basis: 'Piste F208 ; accès nord décrit comme « le plus facile, avec moins de gués » (FÍ).' },
    fords: [
      { road: 'F208 nord', statement: 'Accès « le plus facile, avec moins de gués » (FÍ). Nombre exact : à vérifier.', status: 'officiel', source: 'fi_landmannalaugar' },
      { road: 'Landmannalaugar', statement: 'Le parking P1 permet d’éviter le gué ; une passerelle piétonne rejoint le site (FÍ).', status: 'officiel', source: 'fi_landmannalaugar' },
    ],
    hikes: [
      { name: 'Boucle de Laugahraun', km: '4,8 km', duration: '1,5–2 h', difficulty: null, source: 'fi_landmannalaugar', status: 'officiel' },
      { name: 'Brennisteinsalda (prolongement de Laugahraun)', km: '3,4 km', duration: null, difficulty: null, source: 'fi_landmannalaugar', status: 'officiel' },
      { name: 'Bláhnúkur', km: null, duration: '4 h', difficulty: 'Exigeante', source: 'fi_landmannalaugar', status: 'officiel' },
      { name: 'Ljótipollur', km: '13 km', duration: '4–6 h', difficulty: null, source: 'fi_landmannalaugar', status: 'officiel' },
      { name: 'Skallahringur', km: '15,5 (unité non précisée)', duration: '6–8 h', difficulty: null, source: 'fi_landmannalaugar', status: 'officiel' },
    ],
    lodging: [{ name: 'Landmannalaugar – refuge FÍ / camping', source: 'Ferðafélag Íslands', note: 'Réservation indispensable (non vérifiée).' }],
    tips: [
      'Réservation du parking obligatoire du 20 juin au 13 septembre (FÍ).',
      'Contradiction à valider : OpenStreetMap numérote Sigalda → Landmannalaugar « 208 » (route ordinaire), alors que Vegagerðin publie ce tronçon dans ses pistes de montagne sous « F208 ». C’est pourquoi le compteur « piste F » de ce jour n’affiche que les derniers km (F224).',
    ],
    sources: ['fi_landmannalaugar', 'vegagerdin_opening', 'osm', 'osrm'],
    mustCheck: ['Réservation du parking', 'Réservation refuge / camping', 'Statut 208 / F208 du tronçon Sigalda → Landmannalaugar'],
  },
  {
    n: 13,
    summary: 'F208 sud de Landmannalaugar à Eldgjá (Ófærufoss), puis descente vers la route 1 et Kirkjubæjarklaustur.',
    difficulty: { level: 'Très exigeante', basis: 'F208 sud décrite comme « l’itinéraire le plus difficile, avec plusieurs gués » (FÍ).' },
    fords: [
      { road: 'F208 sud', statement: '« Plusieurs gués » (FÍ). Nombre exact non publié par une source officielle consultée.', status: 'officiel', source: 'fi_landmannalaugar' },
      { road: 'F208 sud', statement: 'Les sources secondaires se contredisent (de 3 gués importants à une quinzaine de passages).', status: 'secondaire', source: 'sec_f208_count' },
      { road: 'Eldgjá', statement: 'Possibilité de se garer au sud de la Strangakvísl et de traverser à pied par une passerelle.', status: 'officiel', source: 'vjp_eldgja' },
    ],
    hikes: [
      { name: 'E1 Eldgjá – Ófærufoss', km: '2,5 km', duration: '2,5 h', difficulty: 'Exigeante', source: 'vjp_eldgja', status: 'officiel' },
      { name: 'E2 Gjátindur', km: '7 km', duration: '3–4 h', difficulty: 'Exigeante', source: 'vjp_eldgja', status: 'officiel' },
    ],
    lodging: [{ name: 'Kirkjubæjarklaustur', source: 'À choisir' }],
    tips: ['Section Landmannalaugar → Eldgjá ouverte entre le 16/06 et le 06/07 sur 2021–2025 (Vegagerðin) : ouverte au 7 juillet les 5 années.', 'Variante C si les gués sont trop hauts : retour par Sigalda et la route 1.'],
    sources: ['fi_landmannalaugar', 'vjp_eldgja', 'vegagerdin_opening', 'sec_f208_count', 'osrm'],
    mustCheck: ['Ouverture F208 sud', 'Niveau des rivières après pluie', 'Autorisation du loueur'],
  },
  {
    n: 14,
    summary: 'Aller-retour à Laki et Lakagígar par la F206, avec arrêt à Fagrifoss.',
    difficulty: { level: 'Très exigeante', basis: 'Piste F206/F207 réservée aux 4x4, quatre gués non pontés (Vatnajökulsþjóðgarður).' },
    fords: [{ road: 'F206 / F207', statement: '« Quatre gués non pontés qui peuvent grossir par temps de pluie » (Vatnajökulsþjóðgarður). Se renseigner au centre d’accueil de Kirkjubæjarklaustur.', status: 'officiel', source: 'vjp_lakagigar' }],
    hikes: [
      { name: 'L1 Laki', km: '2 km', duration: '1–1,5 h', difficulty: 'Exigeante', source: 'vjp_lakagigar', status: 'officiel' },
      { name: 'L3 Tjarnargígur', km: '500 m', duration: '30 min', difficulty: 'Facile', source: 'vjp_lakagigar', status: 'officiel' },
      { name: 'L4 Tjarnagígur – Eldborgarfarvegur', km: '4,5 km', duration: '2 h', difficulty: 'Exigeante', source: 'vjp_lakagigar', status: 'officiel' },
      { name: 'L5 Lambavatn – Kambar', km: '11 km', duration: '4–5 h', difficulty: 'Exigeante', source: 'vjp_lakagigar', status: 'officiel' },
    ],
    lodging: [{ name: 'Kirkjubæjarklaustur', source: 'À choisir' }],
    tips: ['F206 ouverte entre le 12/06 et le 01/07 sur 2021–2025 (Vegagerðin).', 'Poste de rangers au Laki (Vatnajökulsþjóðgarður).'],
    sources: ['vjp_lakagigar', 'vegagerdin_opening', 'safetravel_highland', 'osrm'],
    mustCheck: ['Niveau des gués (centre d’accueil de Kirkjubæjarklaustur)', 'Autorisation du loueur pour la F206'],
  },
  {
    n: 15,
    summary: 'Retour vers Keflavík par la route 1 (côte sud, déjà connue : trajet de liaison). Systrafoss et Kirkjugólf avant de partir.',
    difficulty: { level: 'Facile', basis: 'Route 1 revêtue.' },
    fords: [], hikes: [], lodging: [],
    tips: ['Prévoir de la marge par rapport à l’heure du vol.'],
    sources: ['osrm'],
    mustCheck: ['Heure du vol retour'],
  },
];

export const DEFAULT_CHECKLIST = [
  { cat: 'Documents', items: ['Passeports', 'Permis de conduire', 'Contrat de location (clauses pistes F et gués)', 'Assurance voyage', 'Réservations imprimées'] },
  { cat: 'Sécurité', items: ['Plan de voyage déposé sur safetravel.is', 'Trousse de premiers secours', 'Lampe frontale', 'Batterie externe', 'Carte papier des Hautes Terres'] },
  { cat: 'Vêtements', items: ['Veste et pantalon imperméables', 'Couche polaire', 'Bonnet et gants', 'Chaussures de randonnée', 'Sandales pour les gués à pied', 'Maillots de bain', 'Masque de sommeil (jour polaire)'] },
  { cat: 'Voiture', items: ['Vérifier roue de secours et cric', 'Réserve d’eau et de nourriture', 'Sacs poubelle'] },
];
