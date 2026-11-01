import { DAYS, PLACES, ALTERNATIVES, META } from '../data';
import { DAY_CONTENT } from '../data/content';
import { useStore, useDayStops } from '../store';
import { fmtDate, fmtDur, fmtKm, roadLabel } from '../lib';

// Version imprimable : « Imprimer » → « Enregistrer au format PDF » dans la boîte de dialogue du navigateur.
export default function Programme() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10 print:max-w-none print:p-0">
      <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-basalt-600">Choisissez « Enregistrer au format PDF » comme imprimante.</p>
        <button className="btn-primary" onClick={() => window.print()}>Exporter en PDF</button>
      </div>
      <h1 className="text-4xl">Islande 2027 – Programme</h1>
      <p className="mt-1 text-sm text-basalt-600">25 juin – 9 juillet 2027 · données calculées le {new Date(META.generatedAt).toLocaleDateString('fr-FR')} · distances/durées : OSRM sur OpenStreetMap (calculs, pas des données officielles).</p>
      <div className="mt-6 space-y-4">{DAYS.map((d) => <DayBlock key={d.n} n={d.n} />)}</div>
      <section className="card mt-6 p-4 text-sm">
        <h2 className="font-display text-xl">Plans de repli</h2>
        <ul className="mt-2 space-y-1">{ALTERNATIVES.map((a) => <li key={a.id}><strong>{a.id}</strong> (remplace le jour {a.replaces}) – {a.title} : {a.route ? `${fmtKm(a.route.distanceKm)}, ≈ ${fmtDur(a.route.durationMin)}` : 'À vérifier'}</li>)}</ul>
      </section>
      <p className="mt-6 text-xs text-basalt-500">Vérifier chaque matin : umferdin.is (routes), safetravel.is (sécurité), vedur.is (météo). Les dates d’ouverture des pistes sont historiques et indicatives.</p>
    </main>
  );
}

function DayBlock({ n }: { n: number }) {
  const d = DAYS.find((x) => x.n === n)!;
  const c = DAY_CONTENT.find((x) => x.n === n)!;
  const { state } = useStore();
  const { stops, edited, customRoute } = useDayStops(n);
  const route = customRoute ?? (edited ? null : d.route);
  const note = state.notes[`day-${n}`];
  const booking = state.bookings[n];
  return (
    <section className="card p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-xl">Jour {n} – {d.title}</h2>
        <span className="text-sm capitalize text-basalt-500">{fmtDate(d.date)}</span>
      </div>
      <p className="mt-1 text-sm">{c.summary}</p>
      <div className="mt-2 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
        <div><strong>Trajet :</strong> {d.waypoints.length || edited ? (route ? `${fmtKm(route.distanceKm)} · ≈ ${fmtDur(route.durationMin)}${route.fKm ? ` · ${fmtKm(route.fKm)} de piste F` : ''}` : 'À vérifier') : 'aucun'}</div>
        <div><strong>Difficulté :</strong> {c.difficulty.level}</div>
        {route && <div className="sm:col-span-2"><strong>Routes :</strong> {route.refs.map((r) => roadLabel(r.ref)).join(', ')}</div>}
        <div className="sm:col-span-2"><strong>Arrêts :</strong> {stops.map((s) => s.name).join(' → ')}</div>
        <div className="sm:col-span-2"><strong>Nuit :</strong> {d.night ? PLACES[d.night]?.name : '—'}{booking?.name ? ` · ${booking.name}` : ''}{booking?.status === 'reserve' ? ' (réservé)' : d.night ? ' (à réserver)' : ''}</div>
        {c.fords.length > 0 && <div className="sm:col-span-2"><strong>Gués :</strong> {c.fords.map((f) => `${f.road} : ${f.statement}`).join(' ')}{d.fords?.length ? ` OSM : ${d.fords.length} point(s).` : ''}</div>}
        {c.mustCheck.length > 0 && <div className="sm:col-span-2 text-red-700"><strong>À vérifier :</strong> {c.mustCheck.join(' ; ')}</div>}
        {note && <div className="sm:col-span-2 whitespace-pre-wrap"><strong>Notes :</strong> {note}</div>}
      </div>
    </section>
  );
}
