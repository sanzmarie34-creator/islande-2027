import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

const LINKS = [
  { to: '/', label: 'Itinéraire' },
  { to: '/securite', label: 'Pistes & gués' },
  { to: '/hebergements', label: 'Hébergements' },
  { to: '/budget', label: 'Budget' },
  { to: '/checklist', label: 'Checklist' },
  { to: '/notes', label: 'Notes' },
  { to: '/sources', label: 'Sources' },
  { to: '/programme', label: 'Export PDF' },
];

export default function Layout() {
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  useEffect(() => { setOpen(false); window.scrollTo(0, 0); }, [loc.pathname]);
  return (
    <div className="min-h-screen">
      <header className="no-print sticky top-0 z-[1000] border-b border-white/10 bg-basalt-950/90 text-white backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <NavLink to="/" className="font-display text-lg text-white no-underline">Ísland <span className="text-glacier-300">2027</span></NavLink>
          <nav className="hidden gap-1 lg:flex">
            {LINKS.map((l) => (
              <NavLink key={l.to} to={l.to} end className={({ isActive }) => `rounded-full px-3 py-1.5 text-sm no-underline ${isActive ? 'bg-white/15 text-white' : 'text-basalt-200 hover:text-white'}`}>{l.label}</NavLink>
            ))}
          </nav>
          <button className="rounded-full px-3 py-1.5 text-sm ring-1 ring-white/30 lg:hidden" onClick={() => setOpen(!open)} aria-expanded={open}>Menu</button>
        </div>
        {open && (
          <nav className="grid grid-cols-2 gap-1 px-4 pb-4 lg:hidden">
            {LINKS.map((l) => (
              <NavLink key={l.to} to={l.to} end className={({ isActive }) => `rounded-lg px-3 py-2 text-sm no-underline ${isActive ? 'bg-white/15 text-white' : 'text-basalt-200'}`}>{l.label}</NavLink>
            ))}
          </nav>
        )}
      </header>
      <Outlet />
      <footer className="no-print mt-16 border-t border-basalt-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-8 text-xs leading-relaxed text-basalt-500">
          Carnet personnel. Cartes © contributeurs OpenStreetMap. Photographies : Wikimedia Commons, auteurs et licences indiqués sur chaque image.
          Les dates d’ouverture des pistes sont historiques et <strong>indicatives</strong> : vérifier <a href="https://umferdin.is/en" target="_blank" rel="noreferrer">umferdin.is</a>, <a href="https://safetravel.is" target="_blank" rel="noreferrer">safetravel.is</a> et <a href="https://en.vedur.is" target="_blank" rel="noreferrer">vedur.is</a> avant chaque journée.
        </div>
      </footer>
    </div>
  );
}
