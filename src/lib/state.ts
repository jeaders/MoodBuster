import { create } from 'zustand';
import type { MoodId } from '../data/films';
import { SPAWN } from './layout';
import { audio } from './audio';

export const rt = {
  x: SPAWN.x,
  y: 0,
  vy: 0,
  isGrounded: true,
  z: SPAWN.z,
  yaw: SPAWN.yaw,
  pitch: 0,
  bob: 0,
  speed: 0,
  view: 'fp' as 'fp' | 'tp',
  lastStepDist: 0,
};

export const keys = new Set<string>();
export const stick = { x: 0, y: 0, active: false };
export const look = { dx: 0, dy: 0 };
export const press = { interact: false, jump: false };
export const focusMark = { active: false, x: 0, y: 0, z: 0, nz: 1 };
export const tapReq = { active: false, x: 0, y: 0 };

export type Focus =
  | { kind: 'film'; filmId: string }
  | { kind: 'kiosk' }
  | { kind: 'clerk' }
  | { kind: 'seat'; seatId: string }
  | null;

export type Waypoint = { x: number; z: number; label: string; filmId: string | null } | null;

export type PanelType = 'search' | 'serata' | 'mood' | 'help' | 'claudio' | 'quiz' | 'custom' | 'nowplaying' | 'api' | 'freecinema' | null;

type S = {
  phase: 'intro' | 'play';
  start: () => void;
  focus: Focus;
  setFocus: (f: Focus) => void;
  openFilm: string | null;
  setOpenFilm: (id: string | null) => void;
  panel: PanelType;
  setPanel: (p: PanelType) => void;
  serata: string[];
  toggleSerata: (id: string) => void;
  clearSerata: () => void;
  held: string | null;
  setHeld: (id: string | null) => void;
  dropHeld: () => void;
  waypoint: Waypoint;
  setWaypoint: (w: Waypoint) => void;
  moodFilter: MoodId | null;
  setMoodFilter: (m: MoodId | null) => void;
  toast: string | null;
  setToast: (t: string | null) => void;
  view: 'fp' | 'tp';
  toggleView: () => void;
  touch: boolean;
  setTouch: (t: boolean) => void;
  flashlight: boolean;
  toggleFlashlight: () => void;
  soundEnabled: boolean;
  toggleSound: () => void;
  musicEnabled: boolean;
  toggleMusic: () => void;
  hasApiKey: boolean;
  setHasApiKey: (v: boolean) => void;
  
  // STATO SEDIA E CINEMA
  seatedSeatId: string | null;
  setSeatedSeatId: (seatId: string | null) => void;
  seatFilmId: string | null;
  setSeatFilmId: (filmId: string | null) => void;
  // Tracciamento film/cartoni visti (per sezione "Più Visti")
  views: Record<string, number>;
  recordView: (filmId: string) => void;
  // Versione scaffali: incrementata quando si aggiungono film dinamici
  slotVersion: number;
  bumpSlots: () => void;
};

export const useGame = create<S>((set, get) => ({
  phase: 'intro',
  start: () => {
    audio.blip(520);
    set({ phase: 'play' });
  },
  focus: null,
  setFocus: (f) => set({ focus: f }),
  openFilm: null,
  setOpenFilm: (id) => {
    if (id) audio.vhsClick();
    set({ openFilm: id });
  },
  panel: null,
  setPanel: (p) => {
    if (p) audio.blip(600);
    set({ panel: p });
  },
  serata: [],
  toggleSerata: (id) => {
    const s = get().serata;
    audio.vhsClick();
    if (s.includes(id)) set({ serata: s.filter((x) => x !== id) });
    else set({ serata: [...s, id], held: id });
  },
  clearSereta: () => {
    audio.blip(380);
    set({ serata: [], held: null });
  },
  held: null,
  setHeld: (id) => {
    if (id) audio.vhsClick();
    set({ held: id });
  },
  dropHeld: () => {
    const cur = get().held;
    if (!cur) return;
    audio.blip(300);
    set({ held: null });
    flash('Cassetta rimessa a posto 📼');
  },
  waypoint: null,
  setWaypoint: (w) => {
    if (w) audio.fanfare();
    set({ waypoint: w });
  },
  moodFilter: null,
  setMoodFilter: (m) => {
    audio.blip(720);
    set({ moodFilter: m });
  },
  toast: null,
  setToast: (t) => set({ toast: t }),
  view: 'fp',
  toggleView: () => {
    audio.blip(600);
    const v = get().view === 'fp' ? 'tp' : 'fp';
    rt.view = v;
    set({ view: v });
  },
  touch: false,
  setTouch: (t) => set({ touch: t }),
  flashlight: false,
  toggleFlashlight: () => {
    audio.blip(880);
    set((state) => ({ flashlight: !state.flashlight }));
  },
  soundEnabled: true,
  toggleSound: () => {
    const next = !get().soundEnabled;
    audio.enabled = next;
    set({ soundEnabled: next });
  },
  musicEnabled: false,
  toggleMusic: () => {
    const isNow = audio.toggleMusic();
    set({ musicEnabled: isNow });
  },
  // La chiave TMDB è gestita lato server dal proxy Netlify
  hasApiKey: true,
  setHasApiKey: (v) => set({ hasApiKey: v }),

  // IMPLEMENTAZIONE SEDIA E CINEMA
  seatedSeatId: null,
  setSeatedSeatId: (seatId) => {
    audio.seatCreak();
    if (seatId) {
      const heldFilm = get().held;
      set({ seatedSeatId: seatId, seatFilmId: heldFilm || 'f0' });
      flash('Ti sei seduto comodamente in Sala 1 🎬');
    } else {
      set({ seatedSeatId: null });
      flash('Ti sei alzato in piedi 🚶');
    }
  },
  seatFilmId: null,
  setSeatFilmId: (filmId) => set({ seatFilmId: filmId }),
  views: loadViews(),
  recordView: (filmId) => {
    const views = { ...get().views };
    views[filmId] = (views[filmId] || 0) + 1;
    saveViews(views);
    set({ views });
  },
  slotVersion: 0,
  bumpSlots: () => set((s) => ({ slotVersion: s.slotVersion + 1 })),
}));

let toastTimer: number | undefined;
export function flash(msg: string) {
  useGame.getState().setToast(msg);
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => useGame.getState().setToast(null), 2800);
}

const VIEWS_KEY = 'moodbuster_views';

export function loadViews(): Record<string, number> {
  try {
    const s = localStorage.getItem(VIEWS_KEY);
    if (s) {
      const obj = JSON.parse(s);
      if (typeof obj === 'object' && obj !== null) return obj as Record<string, number>;
    }
  } catch {
    // ignore
  }
  return {};
}

export function saveViews(views: Record<string, number>) {
  try {
    localStorage.setItem(VIEWS_KEY, JSON.stringify(views));
  } catch {
    // ignore
  }
}

export const uiOpen = () => {
  const s = useGame.getState();
  return s.phase !== 'play' || !!s.panel || !!s.openFilm;
};
