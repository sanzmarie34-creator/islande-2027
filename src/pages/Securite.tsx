import { Link } from 'react-router-dom';
import { DAYS } from '../data';
import { DAY_CONTENT, OPENINGS, OPENING_YEARS } from '../data/content';
import { Badge, SourceRef } from '../components/ui';
import { fmtDate, fmtKm } from '../lib';

// Jour du voyage où chaque tronçon est emprunté (plan A)
const USED_ON: Record<string, string> = {
  'Kjalvegur – Gullfoss → Hveravellir': '26–27 juin',
  'Kjalvegur – Hveravellir → Blönduvirkjun': '28 juin',
  'Sprengisandur – Nýidalur → Bárðardalur': '5 juillet',
  'Sprengisandur – Hrauneyjar → Nýidalur': '5 juillet',
  'Fjallabaksleið nyrðri – Sigalda → Landmannalaugar': '6 juillet',
  'Fjallabaksleið nyrðri – Landmannalaugar → Eldgjá': '7 juillet',
  'Fjallabaksleið nyrðri – Eldgjá → Skaftártunga': '7 juillet',
  Lakagígar: '8 juillet',
};

export default function Securite() {
  const fDays = DAYS.filter((d) => (d.route?.fKm ?? 0) > 0 || d.critical);
  return (
    <main className="mx-auto max-w-6xl space-y-8 px-4 py-10">
      <header>
        <h1 className="text-4xl">Pistes, gués et sécurité</h1>
        <p className="mt-3 max-w-3xl text-basalt-700">Les dates d’ouverture ci-dessous sont <strong>historiques</strong> (2021–2025). Celles de 2027 ne seront connues qu’au moment de l’ouverture, décidée chaque année après inspection. Le niveau d’un gué peut changer en quelques heures.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <a className="btn-primary no-underline" href="https://umferdin.is/en" target="_blank" rel="noreferrer">umferdin.is – état des routes</a>
          <a className="btn-ghost no-underline" href="https://safetravel.is" target="_blank" rel="noreferrer">safetravel.is</a>
          <a className="btn-ghost no-underline" href="https://en.vedur.is" target="_blank" rel="noreferrer">vedur.is – météo</a>
        </div>
      </header>

      <section className="card p-5">
        <div className="flex flex-wrap items-center gap-2"><h2 className="font-display text-2xl">Ouvertures historiques</h2><Badge status="officiel" /><SourceRef id="vegagerdin_opening" /></div>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-xs text-basalt-500">
              <tr><th className="py-1 pr-2">Route</th><th className="pr-2">Tronçon</th>{OPENING_YEARS.map((y) => <th key={y} className="pr-2">{y}</th>)}<th className="pr-2">Moy.</th><th className="pr-2">Plus tardive</th><th>Notre passage</th></tr>
            </thead>
            <tbody>
              {OPENINGS.map((o) => (
                <tr key={o.name} className="border-t border-basalt-100 align-top">
                  <td className={`py-1.5 pr-2 font-semibold ${o.road.startsWith('F') ? 'text-lava-600' : ''}`}>{o.road}</td>
                  <td className="pr-2">{o.name}{o.anomaly && <div className="text-xs text-amber-800">⚠ {o.anomaly}</div>}</td>
                  {o.years.map((y, i) => <td key={i} className="pr-2 font-mono text-xs">{y}</td>)}
                  <td className="pr-2 font-mono text-xs">{o.avg}</td><td className="pr-2 font-mono text-xs">{o.latest}</td>
                  <td className="text-xs">{USED_ON[o.name] ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-basalt-700"><strong>Lecture :</strong> au 5 juillet, la F26 était ouverte en 2023 et 2025 seulement. Les autres pistes du programme étaient ouvertes à nos dates de passage lors des cinq années (la F208 Landmannalaugar → Eldgjá a ouvert le 6 juillet en 2022, la veille de notre passage).</p>
      </section>

      <section className="space-y-4">
        <h2 className="section-title">Journées sur pistes</h2>
        {fDays.map((d) => {
          const c = DAY_CONTENT.find((x) => x.n === d.n)!;
          return (
            <div key={d.n} className="card p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <Link to={`/jour/${d.n}`} className="font-display text-xl text-basalt-900">Jour {d.n} – {d.title}</Link>
                <span className="text-sm capitalize text-basalt-500">{fmtDate(d.date)} · {d.route ? `${fmtKm(d.route.fKm)} de piste F` : 'À vérifier'}</span>
              </div>
              <ul className="mt-3 space-y-2 text-sm">
                {c.fords.map((f, i) => <li key={i} className="flex flex-wrap items-start gap-2"><Badge status={f.status} /><span className="font-medium">{f.road}</span><span className="flex-1">{f.statement}</span><SourceRef id={f.source} /></li>)}
                <li className="flex flex-wrap items-start gap-2"><Badge status={d.fords === null ? 'a_verifier' : 'calcule'} /><span className="font-medium">OpenStreetMap</span>
                  <span className="flex-1">{d.fords === null ? 'Requête échouée : non vérifié.' : `${d.fords.length} point(s) de gué cartographié(s) sur le tracé (non exhaustif, sans difficulté).`}</span></li>
              </ul>
            </div>
          );
        })}
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="card p-5">
          <div className="flex flex-wrap items-center gap-2"><h2 className="font-display text-2xl">Franchir un gué</h2><Badge status="officiel" /><SourceRef id="safetravel_highland" /></div>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-basalt-700">
            <li>En cas de doute, ne pas traverser : faire demi-tour ou attendre d’autres véhicules.</li>
            <li>Repérer le passage avant d’entrer dans l’eau ; rouler très lentement, en première courte (4x4 « low »).</li>
            <li>Ne pas changer de vitesse dans l’eau.</li>
            <li>Traverser dans le sens du courant (vers l’aval).</li>
            <li>Se méfier des gros rochers invisibles sous la surface.</li>
            <li>Tous les 4x4 ne conviennent pas à toutes les pistes F.</li>
          </ul>
        </div>
        <div className="card p-5">
          <h2 className="font-display text-2xl">Véhicule et location</h2>
          <ul className="mt-3 space-y-2 text-sm text-basalt-700">
            <li className="flex gap-2"><Badge status="officiel" /><span>« Aucune assurance ne couvre les dommages d’un véhicule lors d’un passage de rivière » (Safetravel).</span></li>
            <li className="flex gap-2"><Badge status="officiel" /><span>Laki (F206/F207) : 4x4 obligatoire (Parc national du Vatnajökull).</span></li>
            <li className="flex gap-2"><Badge status="a_verifier" /><span>Restrictions propres à chaque loueur (route 35, F26, F208 sud, F206) : non vérifiées. À lire dans le contrat avant de réserver le véhicule.</span></li>
            <li className="flex gap-2"><Badge status="a_verifier" /><span>Gabarit de véhicule recommandé pour la F26 et la F208 sud : aucune source officielle consultée ne le précise.</span></li>
          </ul>
        </div>
      </section>
    </main>
  );
}
