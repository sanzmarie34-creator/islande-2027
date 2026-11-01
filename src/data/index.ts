import generated from './generated.json';

export type LatLon = [number, number];

export interface Photo {
  file: string; thumb: string; full: string; page: string; width: number; height: number;
  author: string; license: string; licenseUrl: string | null; description: string; date: string; basis: string;
}
export interface Place {
  name: string; qid?: string; osm?: string; coords: LatLon | null; coordSource: string;
  conflict?: string; lowPrecision?: boolean; poiOnly?: boolean; website?: string;
  wikidata: string | null; osmUrl: string | null; frwiki: string | null; commonsCategory: string | null; photos: Photo[];
}
export interface RefKm { ref: string; km: number; isF?: boolean }
export interface Leg { from: string; to: string; distanceKm: number; durationMin: number; refs: RefKm[] }
export interface Route {
  segments: { isF: boolean; coords: LatLon[] }[];
  distanceKm: number; durationMin: number; fKm: number; refs: RefKm[]; legs: Leg[];
  snaps: { id: string; snapM: number; road: string }[]; computedAt: string;
}
export interface Ford { osmId: string; coords: LatLon; tags: Record<string, string>; distM: number; alongKm: number }
interface Raw {
  generatedAt: string; verifiedOn: string; method: Record<string, string>;
  places: Record<string, Place>; viaPoints: Record<string, { coords: LatLon; source: string; via: true }>;
  // route : objet calculé par OSRM (null si échec) ; fords : null = requête échouée → « À vérifier »
  days: { n: number; date: string; from: string; to: string; title: string; night: string | null; bufferDay?: boolean; critical?: boolean; waypoints: string[]; extraStops?: string[]; route: Route | null; fords: Ford[] | null }[];
  alternatives: { id: string; replaces: number; title: string; waypoints: string[]; route: Route | null; fords: Ford[] | null }[];
}

const raw = generated as unknown as Raw;

export const META = { generatedAt: raw.generatedAt, verifiedOn: raw.verifiedOn, method: raw.method };
export const PLACES = raw.places;
export const VIA = raw.viaPoints;

export interface DayData {
  n: number; date: string; from: string; to: string; title: string; night: string | null;
  bufferDay?: boolean; critical?: boolean;
  waypoints: string[]; extraStops: string[]; route: Route | null; fords: Ford[] | null;
}
export interface AltData { id: string; replaces: number; title: string; waypoints: string[]; route: Route | null; fords: Ford[] | null }

export const DAYS: DayData[] = raw.days.map((d) => ({
  n: d.n, date: d.date, from: d.from, to: d.to, title: d.title, night: d.night, bufferDay: d.bufferDay, critical: d.critical,
  waypoints: d.waypoints, extraStops: d.extraStops ?? [], route: d.route ?? null, fords: d.fords ?? null,
}));
export const ALTERNATIVES: AltData[] = raw.alternatives.map((a) => ({
  id: a.id, replaces: a.replaces, title: a.title, waypoints: a.waypoints, route: a.route ?? null, fords: a.fords ?? null,
}));

export function placeOrVia(id: string): { name: string; coords: LatLon | null; via?: boolean } {
  if (PLACES[id]) return PLACES[id];
  if (VIA[id]) return { name: 'Point de passage F26', coords: VIA[id].coords, via: true };
  return { name: id, coords: null };
}
