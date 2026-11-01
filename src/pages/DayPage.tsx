import { Link, useParams } from 'react-router-dom';
import { useState } from 'react';
import TripMap, { type MapMarker } from '../components/TripMap';
import { Badge, Gallery, SourceList, SourceRef, Credit } from '../components/ui';
import { DAYS, PLACES, ALTERNATIVES, META, type LatLon } from '../data';
import { DAY_CONTENT } from '../data/content';
import { useStore, useDayStops, type Stop } from '../store';
import { fmtDate, fmtDur, fmtKm, gmapsUrl, osrmRoute, roadLabel, searchPlace } from '../lib';
import { dayPhotos } from './Home';

export default function DayPage() {
  const n = Number(useParams().n);
  const d = DAYS.find((x) => x.n === n);
  const { state, dispatch } = useStore();
  const { stops, edited, customRoute } = useDayStops(n);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  if (!d) return <main className="mx-auto max-w-6xl px-4 py-16">Journée introuvable.</main>;
  const c = DAY_CONTENT.find((x) => x.n === n)!;

  const route = customRoute ?? (edited ? null : d.route);
  const photos = dayPhotos(n);
  const hero = photos[0];
  const from = PLACES[d.from], to = PLACES[d.to];
  const routable = stops.filter((s) => s.coords && !(s.placeId && PLACES[s.placeId]?.poiOnly));
  const hasF = (route?.fKm ?? 0) > 0;
  const gm = gmapsUrl(routable.map((s) => s.coords!) as LatLon[]);
  const alts = ALTERNATIVES.filter((a) => a.replaces === n);

  const markers: MapMarker[] = stops.filter((s) => s.coords).map((s, i) => ({
    coords: s.coords!, label: String(i + 1), title: s.name,
    kind: s.placeId && PLACES[s.placeId]?.poiOnly ? 'poi' : s.placeId === d.night ? 'night' : 'stop',
  }));

  const setStops = (s: Stop[]) => dispatch({ type: 'setStops', day: n, stops: s });
  const move = (i: number, dir: -1 | 1) => {
    const s = [...stops]; const j = i + dir;
    if (j < 0 || j >= s.length) return;
    [s[i], s[j]] = [s[j], s[i]]; setStops(s);
  };
  async function recompute() {
    setBusy(true); setErr(null);
    try {
      if (routable.length < 2) throw new Error('Il faut au moins deux arrêts routables.');
      dispatch({ type: 'setCustomRoute', day: n, route: await osrmRoute(routable.map((s) => s.coords!) as LatLon[]) });
    } catch (e) { setErr((e as Error).message); }
    setBusy(false);
  }

  return (
    <main>
      <section className="relative isolate overflow-hidden bg-basalt-950 text-white">
        {hero && <img src={hero.p.thumb} alt={hero.place} className="absolute inset-0 -z-10 h-full w-full object-cover opacity-50" />}
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-basalt-950/20 to-basalt-950/95" />
        <div className="mx-auto max-w-6xl px-4 pb-10 pt-16 md:pt-28">
          <div className="no-print flex gap-2 text-sm">
            {n > 1 && <Link to={`/jour/${n - 1}`} className="text-glacier-200">← Jour {n - 1}</Link>}
            <span className="flex-1" />
            {n < 15 && <Link to={`/jour/${n + 1}`} className="text-glacier-200">Jour {n + 1} →</Link>}
          </div>
          <p className="mt-6 text-sm uppercase tracking-[0.2em] text-glacier-200">Jour {n} · <span className="capitalize">{fmtDate(d.date)}</span></p>
          <h1 className="mt-2 text-3xl leading-tight md:text-5xl">{d.title}</h1>
          <p className="mt-3 text-basalt-200">{from?.name} → {to?.name}</p>
          {hero && <p className="mt-6 text-[11px] text-basalt-300">Photo ({hero.place}) : <Credit p={hero.p} /></p>}
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-8 px-4 py-8">
        {d.critical && (
          <div className="rounded-2xl border border-lava-500/40 bg-lava-500/10 p-4 text-sm text-basalt-800">
            <strong>Journée sur piste F.</strong> Ouverture et niveau des gués à vérifier le jour même sur <a href="https://umferdin.is/en" target="_blank" rel="noreferrer">umferdin.is</a>, <a href="https://safetravel.is" target="_blank" rel="noreferrer">safetravel.is</a> et <a href="https://en.vedur.is" target="_blank" rel="noreferrer">vedur.is</a>. Les dates d’ouverture indiquées sont historiques.
          </div>
        )}

        <p className="max-w-3xl text-lg leading-relaxed text-basalt-800">{c.summary}</p>

        <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Fact label="Distance" value={d.waypoints.length || edited ? (route ? fmtKm(route.distanceKm) : 'À vérifier') : 'Aucun trajet'} badge={route ? 'calcule' : d.waypoints.length || edited ? 'a_verifier' : undefined} />
          <Fact label="Conduite (hors visites)" value={route ? `≈ ${fmtDur(route.durationMin)}` : '—'} badge={route ? 'calcule' : undefined}
            hint={hasF ? 'Vitesses théoriques OSRM : sur piste F, la durée réelle est probablement nettement supérieure (non chiffrée).' : 'Estimation OSRM, sans pauses.'} />
          <Fact label="Pistes F" value={route ? fmtKm(route.fKm) : '—'} badge={route ? 'calcule' : undefined} />
          <Fact label="Difficulté" value={c.difficulty.level} hint={`Appréciation : ${c.difficulty.basis}`} />
        </section>

        {route && (
          <section className="card p-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-basalt-500">Routes empruntées <span className="font-normal normal-case">(numéros OpenStreetMap, tronçons &gt; 200 m)</span></h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {route.refs.map((r) => (
                <span key={r.ref || 'x'} className={`rounded-full px-3 py-1 text-sm ring-1 ${r.isF ? 'bg-lava-500/10 text-lava-600 ring-lava-500/40' : 'bg-glacier-50 text-glacier-800 ring-glacier-200'}`}>{roadLabel(r.ref)} · {fmtKm(r.km)}</span>
              ))}
            </div>
          </section>
        )}

        <section className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <div className="card overflow-hidden p-1">
            <TripMap routes={route ? [{ id: n, route }] : []} markers={markers} fords={customRoute || edited ? [] : d.fords ?? []} height={460} />
          </div>
          <div className="card p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl">Arrêts</h2>
              {edited && <button className="text-xs text-red-700 underline" onClick={() => dispatch({ type: 'resetDay', day: n })}>Rétablir le programme</button>}
            </div>
            <ol className="mt-3 space-y-1.5">
              {stops.map((s, i) => (
                <li key={s.key} className="flex items-center gap-2 rounded-lg bg-basalt-50 px-2 py-1.5 text-sm">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-glacier-500 text-xs font-semibold text-white">{i + 1}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate">{s.name}</span>
                    {s.placeId && PLACES[s.placeId]?.poiOnly && <span className="block text-[11px] text-basalt-500">Visite à pied / point d’intérêt (hors calcul routier)</span>}
                    {s.custom && <span className="block text-[11px] text-basalt-500">Ajouté · {s.source}</span>}
                  </span>
                  <span className="no-print flex shrink-0 gap-0.5">
                    <IconBtn label="Monter" onClick={() => move(i, -1)}>↑</IconBtn>
                    <IconBtn label="Descendre" onClick={() => move(i, 1)}>↓</IconBtn>
                    <IconBtn label="Supprimer" onClick={() => setStops(stops.filter((_, j) => j !== i))}>✕</IconBtn>
                  </span>
                </li>
              ))}
            </ol>
            <AddStop onAdd={(s) => setStops([...stops.slice(0, -1), s, ...stops.slice(-1)])} />
            {edited && !customRoute && (
              <div className="mt-3 rounded-lg bg-amber-50 p-3 text-xs text-amber-900">
                Programme modifié : le tracé n’est plus affiché tant qu’il n’a pas été recalculé (aucune ligne droite n’est dessinée entre les arrêts).
                {n === 11 && ' Attention : le recalcul n’utilise pas les points techniques qui forcent la F26 ; vérifier le tracé obtenu.'}
              </div>
            )}
            {edited && (
              <button className="btn-primary no-print mt-3" disabled={busy} onClick={recompute}>{busy ? 'Calcul…' : 'Recalculer le tracé (OSRM)'}</button>
            )}
            {err && <p className="mt-2 text-xs text-red-700">{err}</p>}
            {customRoute && <p className="mt-2 text-xs text-basalt-500">Tracé recalculé le {new Date(customRoute.computedAt).toLocaleString('fr-FR')} (OSRM/OSM). Les gués ne sont pas recalculés.</p>}
            {gm && (
              <div className="mt-4 border-t border-basalt-100 pt-3 text-sm">
                <a href={gm} target="_blank" rel="noreferrer">Ouvrir dans Google Maps ↗</a>
                <p className="mt-1 text-xs text-basalt-500">{hasF ? 'Non fiable sur cette journée : Google Maps peut ne pas connaître ou éviter les pistes F et proposer un autre itinéraire.' : 'Itinéraire sur routes classiques : Google Maps devrait proposer un tracé comparable (non garanti).'}</p>
              </div>
            )}
          </div>
        </section>

        {(c.fords.length > 0 || (d.fords && d.fords.length > 0) || (d.fords === null && d.waypoints.length > 0)) && (
          <section className="card p-5">
            <h2 className="font-display text-2xl">Gués</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {c.fords.map((f, i) => (
                <li key={i} className="flex flex-wrap items-start gap-2"><Badge status={f.status} /><span className="font-medium">{f.road}</span><span className="flex-1 text-basalt-700">{f.statement}</span><SourceRef id={f.source} /></li>
              ))}
            </ul>
            <h3 className="mt-5 text-sm font-semibold uppercase tracking-wide text-basalt-500">Points de gué cartographiés dans OpenStreetMap sur le tracé</h3>
            {d.fords === null ? (
              <p className="mt-2 text-sm"><Badge status="a_verifier" /> La requête OpenStreetMap a échoué : information non vérifiée.</p>
            ) : d.fords.length === 0 ? (
              <p className="mt-2 text-sm text-basalt-600">Aucun point de gué cartographié à moins de 20 m du tracé. Cela ne prouve pas l’absence de gué.</p>
            ) : (
              <div className="mt-2 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-xs text-basalt-500"><tr><th className="py-1 pr-3">#</th><th className="pr-3">Position sur le trajet</th><th className="pr-3">Nom OSM</th><th className="pr-3">Coordonnées</th><th>Objet OSM</th></tr></thead>
                  <tbody>
                    {d.fords.map((f, i) => (
                      <tr key={f.osmId} className="border-t border-basalt-100">
                        <td className="py-1 pr-3">{i + 1}</td><td className="pr-3">km ≈ {f.alongKm}</td><td className="pr-3">{f.tags.name ?? '—'}</td>
                        <td className="pr-3 font-mono text-xs">{f.coords[0].toFixed(4)}, {f.coords[1].toFixed(4)}</td>
                        <td><a href={`https://www.openstreetmap.org/${f.osmId}`} target="_blank" rel="noreferrer">{f.osmId}</a></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="mt-2 text-xs text-basalt-500">Données communautaires : peuvent inclure de petits ruisseaux, omettre des gués, et ne disent rien de la profondeur. Difficulté habituelle : non documentée par une source officielle consultée.</p>
              </div>
            )}
          </section>
        )}

        {alts.length > 0 && (
          <section className="card p-5">
            <h2 className="font-display text-2xl">Plan de repli</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {alts.map((a) => (
                <li key={a.id}><strong>{a.id}</strong> – {a.title} : {a.route ? `${fmtKm(a.route.distanceKm)}, ≈ ${fmtDur(a.route.durationMin)} (OSRM), dont ${fmtKm(a.route.fKm)} de piste F` : 'À vérifier'}.</li>
              ))}
            </ul>
            {n === 11 && <p className="mt-2 text-xs text-basalt-500">Ces variantes sont longues : prévoir de partir dès le jour 10 (jour tampon) si la fermeture de la F26 est connue à l’avance.</p>}
          </section>
        )}

        <section className="card p-5">
          <h2 className="font-display text-2xl">Randonnées</h2>
          {c.hikes.length === 0 ? <p className="mt-2 text-sm text-basalt-600">Aucune randonnée documentée pour cette journée.</p> : (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs text-basalt-500"><tr><th className="py-1 pr-3">Sentier</th><th className="pr-3">Distance</th><th className="pr-3">Durée</th><th className="pr-3">Difficulté</th><th>Source</th></tr></thead>
                <tbody>
                  {c.hikes.map((h) => (
                    <tr key={h.name} className="border-t border-basalt-100 align-top">
                      <td className="py-1.5 pr-3">{h.name}{h.note && <div className="text-xs text-basalt-500">{h.note}</div>}</td>
                      <td className="pr-3">{h.km ?? 'À vérifier'}</td><td className="pr-3">{h.duration ?? 'À vérifier'}</td><td className="pr-3">{h.difficulty ?? 'À vérifier'}</td>
                      <td><div className="flex flex-col items-start gap-1"><Badge status={h.status} /><SourceRef id={h.source} /></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section>
          <h2 className="section-title mb-3">Galerie</h2>
          <Gallery photos={photos} />
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="card p-5">
            <h2 className="font-display text-2xl">Hébergement</h2>
            {c.lodging.length === 0 ? <p className="mt-2 text-sm text-basalt-600">Pas de nuit (retour).</p> : c.lodging.map((l) => (
              <div key={l.name} className="mt-3 text-sm">
                <div className="font-medium">{l.url ? <a href={l.url} target="_blank" rel="noreferrer">{l.name} ↗</a> : l.name}</div>
                <div className="text-xs text-basalt-500">Source : {l.source}{l.note ? ` · ${l.note}` : ''}</div>
              </div>
            ))}
            <Link to="/hebergements" className="no-print mt-3 inline-block text-sm">Suivi des réservations →</Link>
          </div>
          <div className="card p-5">
            <h2 className="font-display text-2xl">Conseils pratiques</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-basalt-700">{c.tips.map((t) => <li key={t}>{t}</li>)}</ul>
            {c.mustCheck.length > 0 && (<>
              <h3 className="mt-4 text-sm font-semibold text-red-700">À vérifier avant le départ</h3>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-basalt-700">{c.mustCheck.map((t) => <li key={t}>{t}</li>)}</ul>
            </>)}
          </div>
        </section>

        <section className="card p-5">
          <h2 className="font-display text-2xl">Mes notes</h2>
          <textarea className="input mt-3 min-h-[120px]" placeholder="Notes personnelles pour cette journée (enregistrées sur cet appareil)…"
            value={state.notes[`day-${n}`] ?? ''} onChange={(e) => dispatch({ type: 'setNote', key: `day-${n}`, text: e.target.value })} />
        </section>

        <section id="sources" className="card p-5">
          <h2 className="font-display text-2xl">Sources et vérifications</h2>
          <SourceList ids={c.sources} />
          <h3 className="mt-5 text-sm font-semibold uppercase tracking-wide text-basalt-500">Coordonnées des lieux</h3>
          <ul className="mt-2 space-y-1 text-xs text-basalt-700">
            {stops.filter((s) => s.placeId).map((s) => {
              const p = PLACES[s.placeId!];
              return (
                <li key={s.key}>
                  <strong>{p.name}</strong> : {p.coords ? `${p.coords[0].toFixed(5)}, ${p.coords[1].toFixed(5)}` : 'À vérifier'} — {p.coordSource}
                  {p.wikidata && <> · <a href={p.wikidata} target="_blank" rel="noreferrer">Wikidata</a></>}
                  {p.osmUrl && <> · <a href={p.osmUrl} target="_blank" rel="noreferrer">OSM</a></>}
                  {p.frwiki && <> · <a href={p.frwiki} target="_blank" rel="noreferrer">Wikipédia</a></>}
                  {p.conflict && <div className="text-amber-800">⚠ Contradiction : {p.conflict}</div>}
                </li>
              );
            })}
          </ul>
          {route && route.snaps.some((s) => s.snapM > 500) && (
            <p className="mt-3 text-xs text-amber-800">⚠ Au moins un point a été rattaché à une route située à plus de 500 m : {route.snaps.filter((s) => s.snapM > 500).map((s) => `${PLACES[s.id]?.name ?? s.id} (${s.snapM} m)`).join(', ')}.</p>
          )}
          <p className="mt-3 text-xs text-basalt-500">Données calculées le {new Date(META.generatedAt).toLocaleString('fr-FR')}. Méthode : {META.method.routing}.</p>
        </section>
      </div>
    </main>
  );
}

function Fact({ label, value, hint, badge }: { label: string; value: string; hint?: string; badge?: 'calcule' | 'a_verifier' }) {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between gap-1 text-xs uppercase tracking-wide text-basalt-500"><span>{label}</span>{badge && <Badge status={badge} />}</div>
      <div className="mt-1 font-display text-xl">{value}</div>
      {hint && <div className="mt-1 text-[11px] leading-snug text-basalt-500">{hint}</div>}
    </div>
  );
}

function IconBtn({ children, label, onClick }: { children: string; label: string; onClick: () => void }) {
  return <button aria-label={label} title={label} onClick={onClick} className="h-7 w-7 rounded-md text-basalt-500 hover:bg-white hover:text-basalt-900">{children}</button>;
}

function AddStop({ onAdd }: { onAdd: (s: Stop) => void }) {
  const [q, setQ] = useState('');
  const [res, setRes] = useState<Awaited<ReturnType<typeof searchPlace>>>([]);
  const [msg, setMsg] = useState<string | null>(null);
  async function go(e: React.FormEvent) {
    e.preventDefault();
    if (q.trim().length < 3) return;
    setMsg('Recherche…');
    try { const r = await searchPlace(q.trim()); setRes(r); setMsg(r.length ? null : 'Aucun résultat en Islande.'); } catch (er) { setMsg((er as Error).message); }
  }
  return (
    <div className="no-print mt-4 border-t border-basalt-100 pt-3">
      <form onSubmit={go} className="flex gap-2">
        <input className="input" placeholder="Ajouter un lieu (recherche OpenStreetMap)" value={q} onChange={(e) => setQ(e.target.value)} />
        <button className="btn-ghost shrink-0" type="submit">Chercher</button>
      </form>
      {msg && <p className="mt-1 text-xs text-basalt-500">{msg}</p>}
      <ul className="mt-2 space-y-1">
        {res.map((r) => (
          <li key={r.place_id}>
            <button className="w-full rounded-md px-2 py-1 text-left text-xs hover:bg-glacier-50" onClick={() => {
              onAdd({ key: `osm-${r.osm_type}-${r.osm_id}-${Date.now()}`, name: r.display_name.split(',')[0], coords: [+r.lat, +r.lon], source: `Nominatim / OSM ${r.osm_type}/${r.osm_id}`, custom: true });
              setRes([]); setQ('');
            }}>{r.display_name}</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
