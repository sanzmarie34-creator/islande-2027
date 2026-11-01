import { createContext, useContext, useEffect, useReducer, type ReactNode } from 'react';
import type { LatLon, Route } from './data';
import { DAYS, PLACES } from './data';

// Arrêt d'une journée : soit un lieu documenté (placeId), soit un lieu ajouté par l'utilisateur.
export interface Stop { key: string; placeId?: string; name: string; coords: LatLon | null; source: string; custom?: boolean }
export interface Booking { status: 'a_reserver' | 'reserve' | 'annule'; name: string; price: string; ref: string; note: string }
export interface BudgetLine { id: string; cat: string; label: string; amount: string }

export interface State {
  version: 1;
  stops: Record<number, Stop[]>; // seulement les journées modifiées
  customRoutes: Record<number, Route | null>; // tracés recalculés par l'utilisateur
  notes: Record<string, string>; // 'global' ou 'day-N'
  bookings: Record<number, Booking>;
  budget: BudgetLine[];
  checklist: Record<string, boolean>;
  extraChecklist: { cat: string; label: string }[];
}

const KEY = 'islande2027:v1';
const initial: State = { version: 1, stops: {}, customRoutes: {}, notes: {}, bookings: {}, budget: [], checklist: {}, extraChecklist: [] };

function load(): State {
  try {
    const s = localStorage.getItem(KEY);
    if (s) return { ...initial, ...JSON.parse(s) };
  } catch { /* stockage indisponible : on repart de l'état initial */ }
  return initial;
}

type Action =
  | { type: 'setStops'; day: number; stops: Stop[] }
  | { type: 'resetDay'; day: number }
  | { type: 'setCustomRoute'; day: number; route: Route | null }
  | { type: 'setNote'; key: string; text: string }
  | { type: 'setBooking'; day: number; booking: Booking }
  | { type: 'setBudget'; lines: BudgetLine[] }
  | { type: 'toggleCheck'; key: string }
  | { type: 'addCheck'; cat: string; label: string }
  | { type: 'import'; state: State };

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case 'setStops': return { ...s, stops: { ...s.stops, [a.day]: a.stops }, customRoutes: { ...s.customRoutes, [a.day]: null } };
    case 'resetDay': {
      const stops = { ...s.stops }; delete stops[a.day];
      const customRoutes = { ...s.customRoutes }; delete customRoutes[a.day];
      return { ...s, stops, customRoutes };
    }
    case 'setCustomRoute': return { ...s, customRoutes: { ...s.customRoutes, [a.day]: a.route } };
    case 'setNote': return { ...s, notes: { ...s.notes, [a.key]: a.text } };
    case 'setBooking': return { ...s, bookings: { ...s.bookings, [a.day]: a.booking } };
    case 'setBudget': return { ...s, budget: a.lines };
    case 'toggleCheck': return { ...s, checklist: { ...s.checklist, [a.key]: !s.checklist[a.key] } };
    case 'addCheck': return { ...s, extraChecklist: [...s.extraChecklist, { cat: a.cat, label: a.label }] };
    case 'import': return { ...initial, ...a.state };
  }
}

const Ctx = createContext<{ state: State; dispatch: (a: Action) => void } | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, load);
  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* quota ou mode privé */ }
  }, [state]);
  return <Ctx.Provider value={{ state, dispatch }}>{children}</Ctx.Provider>;
}

export function useStore() {
  const c = useContext(Ctx);
  if (!c) throw new Error('StoreProvider manquant');
  return c;
}

const VISITED_FROM: Record<string, string> = {
  leirhnjukur: 'viti', selfoss: 'dettifoss', hafragilsfoss: 'dettifoss', ofaerufoss: 'eldgja',
  laugahraun: 'landmannalaugar', brennisteinsalda: 'landmannalaugar', blahnukur: 'landmannalaugar',
  systrafoss: 'klaustur', kirkjugolf: 'klaustur',
};

// Arrêts par défaut d'une journée : étapes de calcul (hors points techniques) + arrêts complémentaires.
export function defaultStops(n: number): Stop[] {
  const d = DAYS.find((x) => x.n === n)!;
  // Les étapes gardent leurs répétitions (journées en boucle : retour au point de départ) ;
  // chaque point d'intérêt à pied est placé après l'étape d'où on le visite.
  const ids = d.waypoints.filter((id) => PLACES[id]);
  for (const id of d.extraStops.filter((x) => !ids.includes(x)).reverse()) {
    const at = ids.indexOf(VISITED_FROM[id]);
    if (at >= 0) ids.splice(at + 1, 0, id); else ids.splice(Math.max(ids.length - 1, 0), 0, id);
  }
  return ids.map((id, i) => ({
    key: `${id}-${i}`, placeId: id, name: PLACES[id].name, coords: PLACES[id].coords, source: PLACES[id].coordSource,
  }));
}

export function useDayStops(n: number) {
  const { state } = useStore();
  const edited = state.stops[n];
  return { stops: edited ?? defaultStops(n), edited: !!edited, customRoute: state.customRoutes[n] };
}
