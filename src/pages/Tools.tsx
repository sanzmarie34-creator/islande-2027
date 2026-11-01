import { Link } from 'react-router-dom';
import { useRef, useState } from 'react';
import { DAYS, PLACES } from '../data';
import { DAY_CONTENT, DEFAULT_CHECKLIST } from '../data/content';
import { SOURCES } from '../data/sources';
import { SourceList } from '../components/ui';
import { useStore, type Booking, type BudgetLine, type State } from '../store';
import { fmtDate } from '../lib';

const EMPTY_BOOKING: Booking = { status: 'a_reserver', name: '', price: '', ref: '', note: '' };

export function Hebergements() {
  const { state, dispatch } = useStore();
  const nights = DAYS.filter((d) => d.night);
  const done = nights.filter((d) => state.bookings[d.n]?.status === 'reserve').length;
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-4xl">Hébergements à réserver</h1>
      <p className="mt-2 text-basalt-600">{done} / {nights.length} nuits réservées. Les prix ne sont pas pré-remplis : aucun tarif 2027 n’a été vérifié.</p>
      <div className="mt-6 space-y-3">
        {nights.map((d) => {
          const b = state.bookings[d.n] ?? EMPTY_BOOKING;
          const set = (patch: Partial<Booking>) => dispatch({ type: 'setBooking', day: d.n, booking: { ...b, ...patch } });
          const sug = DAY_CONTENT.find((c) => c.n === d.n)!.lodging;
          return (
            <div key={d.n} className="card grid gap-3 p-4 md:grid-cols-[180px_1fr_1fr]">
              <div>
                <Link to={`/jour/${d.n}`} className="font-semibold">Nuit du jour {d.n}</Link>
                <div className="text-xs capitalize text-basalt-500">{fmtDate(d.date)}</div>
                <div className="mt-1 text-sm">{PLACES[d.night!]?.name}</div>
                <select className="input mt-2" value={b.status} onChange={(e) => set({ status: e.target.value as Booking['status'] })}>
                  <option value="a_reserver">À réserver</option><option value="reserve">Réservé</option><option value="annule">Annulé</option>
                </select>
              </div>
              <div className="text-sm">
                <div className="text-xs uppercase tracking-wide text-basalt-500">Suggestions</div>
                {sug.map((l) => <div key={l.name} className="mt-1">{l.url ? <a href={l.url} target="_blank" rel="noreferrer">{l.name} ↗</a> : l.name}<span className="text-xs text-basalt-500"> · {l.source}</span></div>)}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input className="input col-span-2" placeholder="Établissement réservé" value={b.name} onChange={(e) => set({ name: e.target.value })} />
                <input className="input" placeholder="Prix (€)" inputMode="decimal" value={b.price} onChange={(e) => set({ price: e.target.value })} />
                <input className="input" placeholder="N° de réservation" value={b.ref} onChange={(e) => set({ ref: e.target.value })} />
                <input className="input col-span-2" placeholder="Note (annulation, horaires…)" value={b.note} onChange={(e) => set({ note: e.target.value })} />
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}

const CATS = ['Vols', 'Location 4x4', 'Carburant', 'Hébergement', 'Repas', 'Activités', 'Assurances', 'Divers'];

export function Budget() {
  const { state, dispatch } = useStore();
  const lines = state.budget;
  const set = (l: BudgetLine[]) => dispatch({ type: 'setBudget', lines: l });
  const num = (s: string) => { const v = parseFloat(s.replace(',', '.')); return isNaN(v) ? 0 : v; };
  const lodging = Object.values(state.bookings).filter((b) => b.status === 'reserve').reduce((a, b) => a + num(b.price), 0);
  const total = lines.reduce((a, l) => a + num(l.amount), 0) + lodging;
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-4xl">Budget prévisionnel</h1>
      <p className="mt-2 text-basalt-600">Montants saisis par vous : aucun prix n’est estimé à votre place. Les hébergements marqués « Réservé » sont ajoutés automatiquement.</p>
      <div className="card mt-6 p-4">
        {CATS.map((cat) => (
          <div key={cat} className="border-b border-basalt-100 py-3 last:border-0">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">{cat}</h2>
              <button className="text-sm" onClick={() => set([...lines, { id: crypto.randomUUID(), cat, label: '', amount: '' }])}>+ Ajouter</button>
            </div>
            {cat === 'Hébergement' && <div className="mt-1 text-sm text-basalt-600">Réservations confirmées : {lodging.toLocaleString('fr-FR')} €</div>}
            {lines.filter((l) => l.cat === cat).map((l) => (
              <div key={l.id} className="mt-2 flex gap-2">
                <input className="input" placeholder="Libellé" value={l.label} onChange={(e) => set(lines.map((x) => (x.id === l.id ? { ...x, label: e.target.value } : x)))} />
                <input className="input w-32" placeholder="€" inputMode="decimal" value={l.amount} onChange={(e) => set(lines.map((x) => (x.id === l.id ? { ...x, amount: e.target.value } : x)))} />
                <button className="px-2 text-basalt-500" aria-label="Supprimer" onClick={() => set(lines.filter((x) => x.id !== l.id))}>✕</button>
              </div>
            ))}
          </div>
        ))}
        <div className="flex justify-between pt-4 font-display text-2xl"><span>Total</span><span>{total.toLocaleString('fr-FR')} €</span></div>
      </div>
    </main>
  );
}

export function Checklist() {
  const { state, dispatch } = useStore();
  const [label, setLabel] = useState('');
  const [cat, setCat] = useState(DEFAULT_CHECKLIST[0].cat);
  const groups = DEFAULT_CHECKLIST.map((g) => ({ cat: g.cat, items: [...g.items, ...state.extraChecklist.filter((x) => x.cat === g.cat).map((x) => x.label)] }));
  const all = groups.flatMap((g) => g.items.map((i) => `${g.cat}/${i}`));
  const done = all.filter((k) => state.checklist[k]).length;
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-4xl">Checklist</h1>
      <p className="mt-2 text-basalt-600">{done} / {all.length} éléments prêts.</p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {groups.map((g) => (
          <div key={g.cat} className="card p-4">
            <h2 className="font-display text-xl">{g.cat}</h2>
            <ul className="mt-2 space-y-1">
              {g.items.map((i) => {
                const k = `${g.cat}/${i}`;
                return <li key={k}><label className="flex cursor-pointer items-center gap-2 text-sm"><input type="checkbox" className="h-4 w-4 accent-moss-600" checked={!!state.checklist[k]} onChange={() => dispatch({ type: 'toggleCheck', key: k })} /><span className={state.checklist[k] ? 'text-basalt-400 line-through' : ''}>{i}</span></label></li>;
              })}
            </ul>
          </div>
        ))}
      </div>
      <form className="card mt-4 flex flex-wrap gap-2 p-4" onSubmit={(e) => { e.preventDefault(); if (label.trim()) { dispatch({ type: 'addCheck', cat, label: label.trim() }); setLabel(''); } }}>
        <select className="input w-auto" value={cat} onChange={(e) => setCat(e.target.value)}>{DEFAULT_CHECKLIST.map((g) => <option key={g.cat}>{g.cat}</option>)}</select>
        <input className="input flex-1" placeholder="Nouvel élément" value={label} onChange={(e) => setLabel(e.target.value)} />
        <button className="btn-primary">Ajouter</button>
      </form>
    </main>
  );
}

export function Notes() {
  const { state, dispatch } = useStore();
  const file = useRef<HTMLInputElement>(null);
  function exportJson() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = `islande-2027-sauvegarde-${new Date().toISOString().slice(0, 10)}.json`; a.click();
  }
  async function importJson(f: File) {
    try { dispatch({ type: 'import', state: JSON.parse(await f.text()) as State }); alert('Sauvegarde importée.'); } catch { alert('Fichier invalide.'); }
  }
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-4xl">Notes</h1>
      <textarea className="input mt-6 min-h-[260px]" placeholder="Notes générales du voyage…" value={state.notes.global ?? ''} onChange={(e) => dispatch({ type: 'setNote', key: 'global', text: e.target.value })} />
      <h2 className="mt-8 font-display text-2xl">Notes par journée</h2>
      <ul className="mt-2 space-y-2 text-sm">
        {DAYS.filter((d) => state.notes[`day-${d.n}`]).map((d) => <li key={d.n} className="card p-3"><Link to={`/jour/${d.n}`}>Jour {d.n}</Link><p className="whitespace-pre-wrap text-basalt-700">{state.notes[`day-${d.n}`]}</p></li>)}
        {!DAYS.some((d) => state.notes[`day-${d.n}`]) && <li className="text-basalt-500">Aucune note de journée pour l’instant.</li>}
      </ul>
      <div className="card mt-8 p-4">
        <h2 className="font-display text-xl">Sauvegarde</h2>
        <p className="mt-1 text-sm text-basalt-600">Vos modifications sont enregistrées automatiquement dans ce navigateur. Pour les retrouver sur un autre appareil (téléphone), exportez puis importez ce fichier.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button className="btn-primary" onClick={exportJson}>Exporter (.json)</button>
          <button className="btn-ghost" onClick={() => file.current?.click()}>Importer…</button>
          <input ref={file} type="file" accept="application/json" className="hidden" onChange={(e) => e.target.files?.[0] && importJson(e.target.files[0])} />
        </div>
      </div>
    </main>
  );
}

export function Sources() {
  const all = Object.keys(SOURCES);
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-4xl">Sources et vérifications</h1>
      <div className="card mt-6 space-y-2 p-5 text-sm text-basalt-700">
        <h2 className="font-display text-xl text-basalt-900">Méthode</h2>
        <p><strong>Distances et durées</strong> : calculées par OSRM sur le réseau OpenStreetMap, jamais à vol d’oiseau. Ce sont des calculs, pas des données officielles ; les durées sur pistes F sont des vitesses théoriques probablement optimistes.</p>
        <p><strong>Pistes F</strong> : reconnues par le numéro de route OSM (préfixe « F »). Sur la F26, des points de passage situés sur la piste forcent le calcul à la suivre.</p>
        <p><strong>Gués</strong> : seul un organisme officiel donne un nombre (4 gués non pontés sur F206/F207, Parc national du Vatnajökull). Ailleurs, le site liste les points ford=* d’OpenStreetMap à moins de 20 m du tracé, sans prétendre à l’exhaustivité.</p>
        <p><strong>Photos</strong> : uniquement Wikimedia Commons, licences CC BY, CC BY-SA, CC0 ou domaine public ; image principale de l’élément Wikidata du lieu ou fichier classé dans la catégorie Commons du lieu.</p>
        <p><strong>Niveaux</strong> : « Source officielle » (page consultée), « Calculé », « Source secondaire » (insuffisante pour la sécurité), « À vérifier ».</p>
      </div>
      <div className="card mt-6 p-5"><SourceList ids={all} /></div>
      <div className="card mt-6 p-5 text-sm">
        <h2 className="font-display text-xl">Points restant à valider</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-basalt-700">
          {DAY_CONTENT.flatMap((c) => c.mustCheck.map((m) => <li key={c.n + m}>Jour {c.n} : {m}</li>))}
          {Object.values(PLACES).filter((p) => p.conflict).map((p) => <li key={p.name}>{p.name} : {p.conflict}</li>)}
        </ul>
      </div>
    </main>
  );
}
