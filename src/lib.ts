import type { LatLon, Route, RefKm } from './data';

export const fmtKm = (km: number | null | undefined) => (km == null ? 'À vérifier' : `${km.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} km`);
export function fmtDur(min: number | null | undefined) {
  if (min == null) return 'À vérifier';
  const h = Math.floor(min / 60), m = min % 60;
  return h ? `${h} h ${String(m).padStart(2, '0')}` : `${m} min`;
}
export const fmtDate = (iso: string) => new Date(iso + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

// Lien Google Maps (URL publique documentée, sans clé). Google peut proposer un autre itinéraire
// que celui calculé ici, en particulier sur les pistes F : le lien est marqué « non fiable » dans ce cas.
export function gmapsUrl(points: LatLon[]) {
  if (points.length < 2) return null;
  const f = ([a, b]: LatLon) => `${a},${b}`;
  const u = new URL('https://www.google.com/maps/dir/');
  u.searchParams.set('api', '1');
  u.searchParams.set('origin', f(points[0]));
  u.searchParams.set('destination', f(points[points.length - 1]));
  if (points.length > 2) u.searchParams.set('waypoints', points.slice(1, -1).map(f).join('|'));
  u.searchParams.set('travelmode', 'driving');
  return u.toString();
}

// Recalcul d'un tracé depuis le navigateur (même méthode que le script de collecte).
export async function osrmRoute(points: LatLon[]): Promise<Route> {
  const url = `https://router.project-osrm.org/route/v1/driving/${points.map(([la, lo]) => `${lo},${la}`).join(';')}?overview=full&geometries=geojson&steps=true&continue_straight=false`;
  const r = await fetch(url);
  if (!r.ok) throw new Error('Service de calcul indisponible (HTTP ' + r.status + ')');
  const j = await r.json();
  if (j.code !== 'Ok') throw new Error('Aucun itinéraire routier trouvé entre ces points');
  const rt = j.routes[0];
  const byRef: Record<string, number> = {};
  const segments: Route['segments'] = [];
  for (const leg of rt.legs) for (const s of leg.steps) {
    const ref = s.ref || '';
    byRef[ref] = (byRef[ref] ?? 0) + s.distance;
    const isF = /^F\d/.test(ref);
    const pts: LatLon[] = s.geometry.coordinates.map(([lo, la]: number[]) => [la, lo]);
    const last = segments[segments.length - 1];
    if (last && last.isF === isF) last.coords.push(...pts.slice(1)); else segments.push({ isF, coords: pts });
  }
  const refs: RefKm[] = Object.entries(byRef).filter(([, d]) => d > 200).sort((a, b) => b[1] - a[1]).map(([ref, d]) => ({ ref, km: +(d / 1000).toFixed(1), isF: /^F\d/.test(ref) }));
  return {
    segments, refs,
    distanceKm: +(rt.distance / 1000).toFixed(1), durationMin: Math.round(rt.duration / 60),
    fKm: +refs.filter((x) => x.isF).reduce((a, x) => a + x.km, 0).toFixed(1),
    legs: [], snaps: j.waypoints.map((w: { distance: number; name: string }, i: number) => ({ id: String(i), snapM: Math.round(w.distance), road: w.name })),
    computedAt: new Date().toISOString(),
  };
}

// Recherche de lieu (Nominatim / OpenStreetMap). Politique d'usage : 1 requête par seconde maximum.
export async function searchPlace(q: string) {
  const u = `https://nominatim.openstreetmap.org/search?format=jsonv2&countrycodes=is&limit=6&accept-language=fr&q=${encodeURIComponent(q)}`;
  const r = await fetch(u);
  if (!r.ok) throw new Error('Recherche indisponible');
  return (await r.json()) as { place_id: number; display_name: string; lat: string; lon: string; osm_type: string; osm_id: number; type: string }[];
}

export const roadLabel = (ref: string) => (ref ? (/^\d/.test(ref) ? `Route ${ref}` : ref) : 'Voie sans numéro');
