# Islande 2027 – Carnet de route

Site personnel (React + TypeScript + Tailwind CSS + Leaflet/OpenStreetMap) pour préparer le road trip du 25 juin au 9 juillet 2027.

## Lancer le site

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # version statique dans dist/
```

## Mise en ligne (GitHub Pages)

Le site publié est la branche `gh-pages`, qui contient la version construite (`dist/`).
Pour publier une modification : `npm run deploy` (construit le site et l'envoie sur `gh-pages`), puis `git add -A`, `git commit -m "..."`, `git push` pour sauvegarder le code source. Le site est à jour 1 à 2 minutes plus tard.

## Architecture

```
scripts/
  itinerary.source.mjs   ← fichier de données documentées : lieux, coordonnées + origine, journées, variantes
  build-data.mjs         ← collecte reproductible : Wikidata, OSRM, Overpass (gués OSM), Wikimedia Commons
  retry-fords.mjs        ← relance les requêtes de gués échouées (Overpass est souvent saturé)
src/data/
  generated.json         ← résultat de la collecte (tracés, distances, gués, photos + licences, dates)
  content.ts             ← textes, randonnées, gués officiels, ouvertures de pistes — chaque ligne a sa source
  sources.ts             ← registre des sources (URL, organisme, date de consultation, ce qu’elles prouvent)
src/store.tsx            ← modifications de l’utilisateur, sauvegardées dans le navigateur (localStorage)
src/pages/               ← accueil, journées, pistes & gués, hébergements, budget, checklist, notes, sources, export PDF
```

Pour mettre les données à jour : modifier `scripts/itinerary.source.mjs`, puis `node scripts/build-data.mjs` (puis `node scripts/retry-fords.mjs` si des gués sont restés « À vérifier »).

## Règles de fiabilité appliquées

- Distances et durées : OSRM sur OpenStreetMap, jamais à vol d’oiseau. Affichées comme **« Calculé »**, pas comme officielles.
- Aucune ligne droite : si le calcul échoue, aucun tracé n’est dessiné.
- Gués : chiffre officiel uniquement s’il existe (Laki : 4 gués, Parc national du Vatnajökull). Sinon, liste des points `ford=*` d’OSM sur le tracé, présentée comme non exhaustive.
- Ouvertures de pistes : tableau historique 2021–2025 de Vegagerðin, présenté comme indicatif.
- Photos : Wikimedia Commons uniquement, licences libres, auteur et licence affichés.

## Google Maps : configuration externe (facultative)

Le site fonctionne **sans clé** : les boutons « Ouvrir dans Google Maps » utilisent les URL publiques de Google Maps, qui ne demandent aucune configuration.

L’API **Google Maps Routes** permettrait de comparer nos distances avec celles de Google sur les routes revêtues. Elle n’est **pas** intégrée dans cette version, car :
1. elle exige un compte Google Cloud avec facturation activée ;
2. une clé utilisée depuis le navigateur est visible par tous ;
3. Google ne connaît pas toujours les pistes F et peut proposer un autre itinéraire.

Si vous voulez l’ajouter plus tard :
1. Aller sur https://console.cloud.google.com/ et créer un projet.
2. Activer la facturation (une carte bancaire est demandée par Google ; vous devez le faire vous-même).
3. Dans « API et services », activer **Routes API**.
4. Créer une clé API dans « Identifiants », puis la **restreindre** : à la seule Routes API, et (si elle est appelée depuis le site) à l’adresse de votre site.
5. Mettre la clé dans un fichier `.env.local` (jamais dans le code ni dans git) : `VITE_GOOGLE_MAPS_KEY=...`.
6. Définir un plafond de dépenses / des alertes budgétaires dans la console Google Cloud.

## Sauvegarde

Les modifications (ordre des arrêts, notes, réservations, budget, checklist) sont enregistrées dans le navigateur de l’appareil utilisé. Page **Notes → Exporter** pour faire une copie ou les transférer sur un téléphone.
