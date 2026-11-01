// Registre des sources. « consulted » = page réellement ouverte et lue le jour indiqué.
// « excerptOnly » = seul un extrait de moteur de recherche a été lu : l'information reste « non vérifiée ».
export type SourceKind = 'officiel' | 'cartographie' | 'secondaire';

export interface Source {
  id: string;
  title: string;
  org: string;
  url: string;
  kind: SourceKind;
  consulted: string; // date de consultation réelle (AAAA-MM-JJ)
  excerptOnly?: boolean;
  supports: string;
}

const D = '2026-10-31';

export const SOURCES: Record<string, Source> = {
  vegagerdin_opening: {
    id: 'vegagerdin_opening', title: 'Opening of mountain roads', org: 'Vegagerðin (Administration islandaise des routes)',
    url: 'https://www.vegagerdin.is/en/the-transportation-system/the-road-system/roads/opening-of-mountain-roads', kind: 'officiel', consulted: D,
    supports: 'Dates d’ouverture historiques 2021–2025 des pistes (35, F26, F208, F206, F225), moyenne, plus précoce, plus tardive.',
  },
  umferdin: {
    id: 'umferdin', title: 'Umferðin – état des routes en temps réel', org: 'Vegagerðin', url: 'https://umferdin.is/en', kind: 'officiel', consulted: D,
    supports: 'Lien cité par Safetravel pour vérifier l’ouverture des pistes F. À consulter avant chaque journée.',
  },
  safetravel_highland: {
    id: 'safetravel_highland', title: 'Highland driving', org: 'Safetravel.is (ICE-SAR / Landsbjörg)', url: 'https://safetravel.is/driving/summer/highland-driving/', kind: 'officiel', consulted: D,
    supports: 'Conseils de franchissement des gués ; « aucune assurance ne couvre les dommages lors d’un passage de rivière » ; tous les 4x4 ne conviennent pas à toutes les pistes F.',
  },
  vedur: {
    id: 'vedur', title: 'Prévisions météo et hydrologie', org: 'Veðurstofa Íslands (Office météorologique islandais)', url: 'https://en.vedur.is/', kind: 'officiel', consulted: D,
    supports: 'Météo, vent, précipitations (influence directe sur le niveau des gués).',
  },
  ust_kerlingarfjoll: {
    id: 'ust_kerlingarfjoll', title: 'Kerlingarfjöll – Access and services', org: 'Umhverfisstofnun (Agence islandaise de l’environnement)',
    url: 'https://ust.is/english/visiting-iceland/protected-areas/south/kerlingarfjoll/access-and-services/', kind: 'officiel', consulted: D,
    supports: 'Accès par Kjalvegur puis F347 ; « praticable pour tous les 4x4 et véhicules plus grands, sans gué » ; pas de carburant sur Kjölur, station la plus proche à Geysir ; source chaude à ~1,1 km d’Ásgarður.',
  },
  ust_kerlingarfjoll_trails: {
    id: 'ust_kerlingarfjoll_trails', title: 'Kerlingarfjöll – trail guide (PDF)', org: 'Umhverfisstofnun', url: 'https://ust.is/library/sida/Nattura/Kerlingarfjoll%20-%20trail%20guide.pdf', kind: 'officiel', consulted: D, excerptOnly: true,
    supports: 'Sentiers de Hveradalir (lu uniquement via un extrait de recherche : à vérifier).',
  },
  ust_hveravellir_trails: {
    id: 'ust_hveravellir_trails', title: 'Hveravellir in Kjölur – Hiking trails', org: 'Umhverfisstofnun', url: 'https://ust.is/english/visiting-iceland/protected-areas/north-west/hveravellir-in-kjolur/hiking-trails', kind: 'officiel', consulted: D,
    supports: 'Sentiers et durées autour de Hveravellir (pas de distances en km sur la page).',
  },
  vjp_lakagigar: {
    id: 'vjp_lakagigar', title: 'Lakagígar', org: 'Vatnajökulsþjóðgarður (Parc national du Vatnajökull)', url: 'https://www.vatnajokulsthjodgardur.is/en/areas/lakagigar', kind: 'officiel', consulted: D,
    supports: 'Accès F206/F207 en 4x4 uniquement ; « quatre gués non pontés qui peuvent grossir par temps de pluie » ; sentiers L1–L6 ; poste de rangers au Laki.',
  },
  vjp_eldgja: {
    id: 'vjp_eldgja', title: 'Eldgjá', org: 'Vatnajökulsþjóðgarður', url: 'https://www.vatnajokulsthjodgardur.is/en/areas/eldgja', kind: 'officiel', consulted: D,
    supports: 'Sentiers E1–E3 ; possibilité de se garer au sud de la Strangakvísl et de traverser à pied par une passerelle.',
  },
  vjp_hljodaklettar: {
    id: 'vjp_hljodaklettar', title: 'Hljóðaklettar', org: 'Vatnajökulsþjóðgarður', url: 'https://www.vatnajokulsthjodgardur.is/en/areas/jokulsargljufur/hljodaklettar', kind: 'officiel', consulted: D,
    supports: 'Sentiers V1–V7 ; Vesturdalur à ~15 km au sud d’Ásbyrgi par route revêtue.',
  },
  vjp_asbyrgi: {
    id: 'vjp_asbyrgi', title: 'Ásbyrgi', org: 'Vatnajökulsþjóðgarður', url: 'https://www.vatnajokulsthjodgardur.is/en/areas/asbyrgi', kind: 'officiel', consulted: D,
    supports: 'Sentiers Á1–Á10 ; camping ; centre d’accueil Gljúfrastofa.',
  },
  vjp_dettifoss_s2: {
    id: 'vjp_dettifoss_s2', title: 'Dettifoss og Selfoss (sentier)', org: 'Vatnajökulsþjóðgarður', url: 'https://www.vatnajokulsthjodgardur.is/en/s2-dettifoss-og-selfoss', kind: 'officiel', consulted: D,
    supports: 'Sentier Dettifoss–Selfoss : 2,5 km, 1 h, facile, départ parking ouest ; prudence sur le sentier de Hafragil (raide, chutes de pierres).',
  },
  fi_landmannalaugar: {
    id: 'fi_landmannalaugar', title: 'Landmannalaugar – hiking trails', org: 'Ferðafélag Íslands (Association islandaise de randonnée)', url: 'https://www.fi.is/en/hiking-trails/landmannalaugar', kind: 'officiel', consulted: D,
    supports: 'Sentiers (Laugahraun, Brennisteinsalda, Bláhnúkur, Ljótipollur, Skallahringur) ; accès nord F26/F208 « le plus facile, moins de gués » ; F208 sud « plusieurs gués » ; parking P1 sans gué ; réservation de parking du 20 juin au 13 septembre.',
  },
  ust_landmannalaugar_reservations: {
    id: 'ust_landmannalaugar_reservations', title: 'Landmannalaugar – reservations', org: 'Umhverfisstofnun',
    url: 'https://www.ust.is/english/visiting-iceland/protected-areas/south/fjallabak-nature-reserve/landmannalaugar/reservations/', kind: 'officiel', consulted: D, excerptOnly: true,
    supports: 'Lien relevé sur l’objet OpenStreetMap du parking ; page non ouverte : à vérifier.',
  },
  osm: {
    id: 'osm', title: 'OpenStreetMap', org: 'Contributeurs OpenStreetMap (ODbL)', url: 'https://www.openstreetmap.org/', kind: 'cartographie', consulted: D,
    supports: 'Tracés routiers (via OSRM), numéros de route, points de gué cartographiés (ford=*), coordonnées de refuges et parkings.',
  },
  osrm: {
    id: 'osrm', title: 'OSRM – serveur de démonstration', org: 'Project OSRM', url: 'https://router.project-osrm.org/', kind: 'cartographie', consulted: D,
    supports: 'Calcul des distances et durées sur le réseau OpenStreetMap (profil voiture, vitesses théoriques).',
  },
  wikidata: {
    id: 'wikidata', title: 'Wikidata', org: 'Wikimedia Foundation', url: 'https://www.wikidata.org/', kind: 'cartographie', consulted: D,
    supports: 'Coordonnées (P625), image principale (P18), catégorie Commons (P373).',
  },
  commons: {
    id: 'commons', title: 'Wikimedia Commons', org: 'Wikimedia Foundation', url: 'https://commons.wikimedia.org/', kind: 'cartographie', consulted: D,
    supports: 'Photographies sous licence libre, auteur et licence de chaque fichier.',
  },
  // Sources secondaires lues mais NON suffisantes pour valider une information de sécurité
  sec_f26_hagakvisl: {
    id: 'sec_f26_hagakvisl', title: 'Guides de voyage et loueurs (plusieurs, non datés)', org: 'Sources secondaires', url: 'https://www.gocampers.is/iceland-driving/f-roads/sprengisandur-route/', kind: 'secondaire', consulted: D, excerptOnly: true,
    supports: 'Mentionnent la Hagakvísl près de Nýidalur comme principal gué de la F26 — non confirmé par une source officielle.',
  },
  sec_f208_count: {
    id: 'sec_f208_count', title: 'Récits et guides F208 (iceland-dream.com, etc.)', org: 'Sources secondaires', url: 'https://www.iceland-dream.com/guide/highlands/landmannalaugar/f208-mountainroad', kind: 'secondaire', consulted: D, excerptOnly: true,
    supports: 'Nombre de gués de la F208 sud très variable selon les sources (de 3 « importants » à une quinzaine) — contradiction non résolue.',
  },
};
