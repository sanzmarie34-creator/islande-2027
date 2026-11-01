import { Link, useNavigate } from 'react-router-dom';
import TripMap, { F_COLOR, ROAD_COLOR, type MapMarker } from '../components/TripMap';
import { Stat, Credit } from '../components/ui';
import { DAYS, PLACES, ALTERNATIVES, META, type Photo } from '../data';
import { DAY_CONTENT } from '../data/content';
import { useStore } from '../store';
import { fmtDate, fmtDur, fmtKm } from '../lib';

export function dayPhotos(n: number): { p: Photo; place: string }[] {
  const d = DAYS.find((x) => x.n === n)!;
  const ids = [...new Set([...d.waypoints, ...d.extraStops, d.to])].filter((id) => PLACES[id]);
  // La destination en premier quand elle a des photos, sinon l'ordre de la journée
  const ordered = [...ids.filter((id) => id !== d.from), d.from];
  return ordered.flatMap((id) => PLACES[id].photos.map((p) => ({ p, place: PLACES[id].name })));
}

export default function Home() {
  const nav = useNavigate();
  const { state } = useStore();
  const routes = DAYS.map((d) => ({ n: d.n, route: state.customRoutes[d.n] ?? d.route }));
  const computed = routes.filter((r) => r.route);
  const missing = DAYS.filter((d) => d.waypoints.length && !(state.customRoutes[d.n] ?? d.route)).map((d) => d.n);
  const totalKm = computed.reduce((a, r) => a + r.route!.distanceKm, 0);
  const fKm = computed.reduce((a, r) => a + r.route!.fKm, 0);
  const fordDays = DAYS.filter((d) => d.fords === null && d.waypoints.length);
  const osmFords = DAYS.reduce((a, d) => a + (d.fords?.length ?? 0), 0);
  const nights = DAYS.filter((d) => d.night).length;

  // Un repère par lieu de nuit, avec les numéros des jours concernés (ex. « 5-6 »)
  const byNight = new Map<string, number[]>();
  for (const d of DAYS) if (d.night && PLACES[d.night]?.coords) byNight.set(d.night, [...(byNight.get(d.night) ?? []), d.n]);
  const markers: MapMarker[] = [...byNight].map(([id, ns]) => ({
    coords: PLACES[id].coords!, label: ns.length > 1 ? `${ns[0]}-${ns[ns.length - 1]}` : String(ns[0]),
    title: `Nuit${ns.length > 1 ? 's' : ''} J${ns.join(', J')} : ${PLACES[id].name}`, kind: 'night', onClick: () => nav(`/jour/${ns[0]}`),
  }));
  const kef = PLACES.kef;
  if (kef?.coords) markers.unshift({ coords: kef.coords, label: '✈', title: kef.name, kind: 'stop' });

  const hero = PLACES.landmannalaugar?.photos[0] ?? PLACES.highlandbase?.photos[0];

  return (
    <main>
      <section className="relative isolate overflow-hidden bg-basalt-950 text-white">
        {hero && <img src={hero.thumb} alt="Landmannalaugar" className="absolute inset-0 -z-10 h-full w-full object-cover opacity-55" />}
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-basalt-950/30 via-basalt-950/40 to-basalt-950" />
        <div className="mx-auto max-w-6xl px-4 pb-14 pt-20 md:pb-20 md:pt-32">
          <p className="text-sm uppercase tracking-[0.25em] text-glacier-200">25 juin – 9 juillet 2027 · 15 jours</p>
          <h1 className="mt-3 max-w-3xl text-4xl leading-tight md:text-6xl">Les Hautes Terres, du Kjölur au Laki</h1>
          <p className="mt-4 max-w-2xl text-basalt-200">Kjölur, Kerlingarfjöll et Hveravellir, le Nord autour du Mývatn, le Sprengisandur par la F26 si elle est ouverte, Landmannalaugar et la chaîne de cratères du Laki.</p>
          {hero && <p className="mt-8 text-[11px] text-basalt-300">Photo : <Credit p={hero} /></p>}
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4">
        <section className="relative z-10 -mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat label="Distance totale" status="calcule" value={fmtKm(+totalKm.toFixed(0))} hint={missing.length ? `Incomplet : jour(s) ${missing.join(', ')} non calculé(s).` : 'Somme des tracés OSRM / OpenStreetMap (plan A).'} />
          <Stat label="Sur pistes F" status="calcule" value={fmtKm(+fKm.toFixed(0))} hint="Tronçons dont le numéro OSM commence par F (la route 35 n’en fait pas partie)." />
          <Stat label="Gués" status={fordDays.length ? 'a_verifier' : 'calcule'} value={<>{osmFords} <span className="text-sm text-basalt-500">points OSM</span></>}
            hint={<>Points cartographiés dans OpenStreetMap, non exhaustifs. Seul chiffre officiel : 4 gués sur F206/F207 (Laki).{fordDays.length ? ` Requête échouée pour J${fordDays.map((d) => d.n).join(', J')}.` : ''}</>} />
          <Stat label="Nuits" value={nights} hint={`${new Set(DAYS.map((d) => d.night).filter(Boolean)).size} lieux d’hébergement différents.`} />
        </section>

        <section className="mt-10">
          <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
            <h2 className="section-title">Le tracé</h2>
            <div className="flex flex-wrap gap-4 text-xs text-basalt-600">
              <span className="flex items-center gap-1.5"><span className="h-1 w-6 rounded" style={{ background: ROAD_COLOR }} />Route classique</span>
              <span className="flex items-center gap-1.5"><span className="h-1 w-6 rounded border-t-2 border-dashed" style={{ borderColor: F_COLOR }} />Piste F</span>
              <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-basalt-900" />Nuit (n° du jour)</span>
            </div>
          </div>
          <div className="card overflow-hidden p-1">
            <TripMap routes={computed.map((r) => ({ id: r.n, route: r.route! }))} markers={markers} height="min(70vh, 620px)" onRouteClick={(id) => nav(`/jour/${id}`)} />
          </div>
          <p className="mt-2 text-xs text-basalt-500">Tracés calculés le {new Date(META.generatedAt).toLocaleDateString('fr-FR')} par OSRM sur les données OpenStreetMap. Aucun trait n’est tracé là où le calcul a échoué. Cliquez sur un tracé ou une nuit pour ouvrir la journée.</p>
        </section>

        <section className="mt-12">
          <h2 className="section-title mb-4">Les quinze journées</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {DAYS.map((d) => {
              const c = DAY_CONTENT.find((x) => x.n === d.n)!;
              const r = state.customRoutes[d.n] ?? d.route;
              const ph = dayPhotos(d.n)[0];
              return (
                <Link key={d.n} to={`/jour/${d.n}`} className="card group overflow-hidden text-basalt-900 no-underline">
                  <div className="relative aspect-[16/9] bg-basalt-200">
                    {ph && <img src={ph.p.thumb} alt={ph.place} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />}
                    <div className="absolute left-3 top-3 rounded-full bg-basalt-950/80 px-2.5 py-1 text-xs font-semibold text-white">Jour {d.n}</div>
                    {d.critical && <div className="absolute right-3 top-3 rounded-full bg-lava-500 px-2.5 py-1 text-xs font-semibold text-white">Piste F – vigilance</div>}
                    {d.bufferDay && <div className="absolute right-3 top-3 rounded-full bg-moss-600 px-2.5 py-1 text-xs font-semibold text-white">Jour tampon</div>}
                  </div>
                  <div className="p-4">
                    <div className="text-xs capitalize text-basalt-500">{fmtDate(d.date)}</div>
                    <h3 className="mt-0.5 text-lg leading-snug">{d.title}</h3>
                    <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-basalt-600">
                      {d.waypoints.length ? (<>
                        <span>{r ? fmtKm(r.distanceKm) : 'Distance : à vérifier'}</span>
                        <span>{r ? `≈ ${fmtDur(r.durationMin)} (OSRM)` : ''}</span>
                        {r && r.fKm > 0 && <span className="text-lava-600">{fmtKm(r.fKm)} de piste F</span>}
                      </>) : <span>Pas de trajet prévu</span>}
                      <span>Difficulté : {c.difficulty.level}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="mt-12 card p-5">
          <h2 className="section-title">Plans de repli</h2>
          <p className="mt-2 text-sm text-basalt-700">Sur 2021–2025, la F26 n’était ouverte au 5 juillet que 2 années sur 5 (Vegagerðin) : les variantes B remplacent le jour 11. La variante C remplace le jour 13 si la F208 sud est impraticable. Toutes sont calculées avec la même méthode.</p>
          <ul className="mt-3 space-y-2 text-sm">
            {ALTERNATIVES.map((a) => (
              <li key={a.id} className="flex flex-wrap items-baseline justify-between gap-2 border-t border-basalt-100 pt-2">
                <span><strong>{a.id}</strong> – {a.title}</span>
                <span className="text-basalt-600">{a.route ? `${fmtKm(a.route.distanceKm)} · ≈ ${fmtDur(a.route.durationMin)} (OSRM)` : 'À vérifier'}</span>
              </li>
            ))}
          </ul>
          <Link to="/securite" className="mt-3 inline-block text-sm">Voir le détail des pistes, gués et ouvertures →</Link>
        </section>
      </div>
    </main>
  );
}
