import { useState, type ReactNode } from 'react';
import type { Status } from '../data/content';
import { SOURCES } from '../data/sources';
import type { Photo } from '../data';

const STATUS: Record<Status, { label: string; cls: string; title: string }> = {
  officiel: { label: 'Source officielle', cls: 'bg-moss-100 text-moss-800 ring-moss-300', title: 'Information publiée par un organisme officiel islandais, page consultée.' },
  calcule: { label: 'Calculé', cls: 'bg-glacier-100 text-glacier-800 ring-glacier-300', title: 'Calculé par OSRM sur les données OpenStreetMap : ce n’est pas une donnée officielle.' },
  secondaire: { label: 'Source secondaire', cls: 'bg-amber-50 text-amber-800 ring-amber-300', title: 'Guide, blog ou loueur : insuffisant pour valider une information de sécurité.' },
  a_verifier: { label: 'À vérifier', cls: 'bg-red-50 text-red-700 ring-red-300', title: 'Information non vérifiée ou indisponible.' },
};

export function Badge({ status }: { status: Status }) {
  const s = STATUS[status];
  return <span title={s.title} className={`inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ${s.cls}`}>{s.label}</span>;
}

export function Stat({ label, value, hint, status }: { label: string; value: ReactNode; hint?: ReactNode; status?: Status }) {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between gap-2 text-xs uppercase tracking-wide text-basalt-500">
        <span>{label}</span>
        {status && <Badge status={status} />}
      </div>
      <div className="mt-1 font-display text-2xl text-basalt-900">{value}</div>
      {hint && <div className="mt-1 text-xs leading-snug text-basalt-500">{hint}</div>}
    </div>
  );
}

export function SourceRef({ id }: { id: string | null }) {
  if (!id) return <Badge status="a_verifier" />;
  const s = SOURCES[id];
  if (!s) return <Badge status="a_verifier" />;
  return (
    <a href={s.url} target="_blank" rel="noreferrer" className="text-xs text-glacier-700 underline decoration-dotted" title={s.supports}>
      {s.org.split(' (')[0]}{s.excerptOnly ? ' (extrait, non vérifié)' : ''}
    </a>
  );
}

export function SourceList({ ids }: { ids: string[] }) {
  return (
    <ul className="space-y-3">
      {ids.map((id) => {
        const s = SOURCES[id];
        if (!s) return null;
        return (
          <li key={id} className="text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <a href={s.url} target="_blank" rel="noreferrer" className="font-medium">{s.title}</a>
              <Badge status={s.kind === 'officiel' && !s.excerptOnly ? 'officiel' : s.kind === 'cartographie' ? 'calcule' : s.excerptOnly ? 'a_verifier' : 'secondaire'} />
            </div>
            <div className="text-basalt-500">{s.org} · consulté le {new Date(s.consulted).toLocaleDateString('fr-FR')}{s.excerptOnly ? ' · extrait de recherche uniquement, page non ouverte' : ''}</div>
            <div className="text-basalt-700">{s.supports}</div>
          </li>
        );
      })}
    </ul>
  );
}

export function Credit({ p }: { p: Photo }) {
  return (
    <span>
      <a href={p.page} target="_blank" rel="noreferrer" className="text-inherit underline">{p.author}</a>
      {' · '}
      {p.licenseUrl ? <a href={p.licenseUrl} target="_blank" rel="noreferrer" className="text-inherit underline">{p.license}</a> : p.license}
      {' · Wikimedia Commons'}
    </span>
  );
}

export function Gallery({ photos, placeName }: { photos: { p: Photo; place: string }[]; placeName?: string }) {
  const [open, setOpen] = useState<number | null>(null);
  if (!photos.length) return <p className="text-sm text-basalt-500">Aucune photographie sous licence compatible trouvée{placeName ? ` pour ${placeName}` : ''}.</p>;
  const cur = open != null ? photos[open] : null;
  return (
    <>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
        {photos.map(({ p, place }, i) => (
          <button key={p.file} onClick={() => setOpen(i)} className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-basalt-100 text-left">
            <img src={p.thumb} alt={`${place} – ${p.description || p.file}`} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 text-xs text-white">{place}</span>
          </button>
        ))}
      </div>
      {cur && (
        <div className="fixed inset-0 z-[2000] flex flex-col bg-black/90 p-4" onClick={() => setOpen(null)}>
          <div className="flex justify-end"><button className="btn-ghost" onClick={() => setOpen(null)}>Fermer ✕</button></div>
          <img src={cur.p.thumb} alt={cur.place} className="mx-auto my-4 max-h-[75vh] max-w-full flex-1 object-contain" />
          <div className="mx-auto max-w-3xl text-center text-xs text-basalt-200" onClick={(e) => e.stopPropagation()}>
            <div className="mb-1 text-sm text-white">{cur.place}</div>
            {cur.p.description && <div className="mb-1">{cur.p.description}</div>}
            <Credit p={cur.p} />
            <div className="mt-1 text-basalt-400">Correspondance : {cur.p.basis}</div>
          </div>
        </div>
      )}
    </>
  );
}
