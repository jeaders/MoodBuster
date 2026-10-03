import { FILMS_BY_MOOD, FILMS, MOODS, type MoodId } from '../data/films';

export const ROOM = { hx: 22, hz: 19, h: 4.3 };
export const GOND = { len: 8.4, depth: 1.5, height: 2.2 };
export const BOX = { w: 0.33, h: 0.5, d: 0.15 };

export const CINEMA = {
  x: 32,
  z: -6,
  hx: 9.5,
  hz: 10,
  h: 5.5,
  screenX: 41.2,
  screenZ: -6,
  projectorX: 23.5,
  projectorZ: -6,
};

export const CLERK = { x: -17.2, z: 13.2, yaw: 0 };
export const KIOSK = { x: 0, z: 15.2 };
export const SPAWN = { x: 3, z: 17.5, yaw: 0.12 };

/** Rettangoli percorribili (unione). Il passaggio negozio→sala avviene solo dalla PORTA. */
export const SHOP_RECT = { x0: -ROOM.hx, x1: ROOM.hx, z0: -ROOM.hz, z1: ROOM.hz };
export const CINEMA_RECT = {
  x0: ROOM.hx - 0.4,
  x1: CINEMA.x + CINEMA.hx,
  z0: CINEMA.z - CINEMA.hz,
  z1: CINEMA.z + CINEMA.hz,
};
/** Corridoio d'ingresso alla Sala 1 sulla parete est. */
export const DOOR_RECT = { x0: ROOM.hx - 1.1, x1: ROOM.hx + 2.2, z0: -8.8, z1: -3.2 };

export const SHELF_TOPS = [0.52, 1.14, 1.76];
const PER_SHELF = 16;
const SPACING = 0.47;

export type Gondola = { id: number; mood: MoodId; x: number; z: number };

export const GONDOLAS: Gondola[] = [];
{
  const cols = [-11.5, 0, 11.5];
  const rows = [-13.5, -8, -2.5, 3];
  let i = 0;
  for (const z of rows) {
    for (const x of cols) {
      if (i >= MOODS.length) break;
      GONDOLAS.push({ id: i, mood: MOODS[i].id, x, z });
      i++;
    }
  }
}

// SEDILI DELLA SALA CINEMA (3 file × 8 poltrone)
export type CinemaSeat = {
  id: string;
  x: number;
  z: number;
  rowName: string;
  rowLetter: 'A' | 'B' | 'C';
  seatNum: number;
};

export const CINEMA_SEATS: CinemaSeat[] = [];
{
  const rows: Array<{ z: number; letter: 'A' | 'B' | 'C'; name: string }> = [
    { z: -9.4, letter: 'A', name: 'Fila A (dietro)' },
    { z: -6.4, letter: 'B', name: 'Fila B (centrale)' },
    { z: -3.4, letter: 'C', name: 'Fila C (avanti)' },
  ];
  for (const r of rows) {
    for (let seatNum = 1; seatNum <= 8; seatNum++) {
      const x = 24.5 + (seatNum - 1) * 1.3;
      CINEMA_SEATS.push({
        id: `seat_${r.letter}_${seatNum}`,
        x,
        z: r.z,
        rowName: r.name,
        rowLetter: r.letter,
        seatNum,
      });
    }
  }
}

/** Sedile centrale della sala — perfetto per "proietta e siediti". */
export const CENTER_SEAT_ID = 'seat_B_4';

export type Slot = {
  idx: number;
  filmId: string;
  mood: MoodId;
  x: number;
  y: number;
  z: number;
  nx: number;
  nz: number;
};

function rnd(n: number) {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
}

export let SLOTS: Slot[] = [];
export let SLOTS_BY_FILM: Record<string, Slot[]> = {};

function buildSlots() {
  SLOTS = [];
  SLOTS_BY_FILM = {};
  let idx = 0;
  for (const g of GONDOLAS) {
    const films = FILMS_BY_MOOD[g.mood];
    if (!films || !films.length) continue;

    const n = films.length;
    let cursor = 0;
    let order = films.map((_, i) => i);
    const reshuffle = (round: number) => {
      order = films.map((_, i) => i);
      for (let i = order.length - 1; i > 0; i--) {
        const j = Math.floor(rnd(g.id * 311 + round * 97 + i) * (i + 1));
        [order[i], order[j]] = [order[j], order[i]];
      }
    };
    reshuffle(0);
    let round = 0;
    const nextFilm = () => {
      if (cursor >= n) {
        cursor = 0;
        round++;
        reshuffle(round);
      }
      return films[order[cursor++]];
    };

    for (let face = 0; face < 2; face++) {
      const nz = face === 0 ? 1 : -1;
      for (let s = 0; s < SHELF_TOPS.length; s++) {
        for (let k = 0; k < PER_SHELF; k++) {
          const seed = g.id * 977 + face * 131 + s * 53 + k;
          if (rnd(seed) < 0.14) continue;
          const x = g.x + (k - (PER_SHELF - 1) / 2) * SPACING;
          const z = g.z + nz * 0.52;
          const f = nextFilm();
          const slot: Slot = {
            idx: idx++,
            filmId: f.id,
            mood: g.mood,
            x,
            y: SHELF_TOPS[s] + BOX.h / 2,
            z,
            nx: 0,
            nz,
          };
          SLOTS.push(slot);
          (SLOTS_BY_FILM[f.id] ||= []).push(slot);
        }
      }
    }
  }

  const top = [...FILMS].sort((a, b) => b.r - a.r).slice(0, 30);
  const wallTops = [0.72, 1.34, 1.96];
  for (let s = 0; s < wallTops.length; s++) {
    for (let k = 0; k < 32; k++) {
      const seed = 9000 + s * 71 + k;
      if (rnd(seed) < 0.08) continue;
      const x = (k - 31 / 2) * SPACING;
      const f = top[(k + s * 7) % top.length];
      const slot: Slot = {
        idx: idx++,
        filmId: f.id,
        mood: f.mood,
        x,
        y: wallTops[s] + BOX.h / 2,
        z: -ROOM.hz + 0.62,
        nx: 0,
        nz: 1,
      };
      SLOTS.push(slot);
      (SLOTS_BY_FILM[f.id] ||= []).push(slot);
    }
  }

  // scaffale novità (parete est, vicino al cinema) — film più recenti
  const newReleases = [...FILMS].sort((a, b) => b.y - a.y).slice(0, 20);
  const noveltyX = ROOM.hx - 0.62;
  for (let k = 0; k < Math.min(newReleases.length, 20); k++) {
    const f = newReleases[k];
    const x = noveltyX;
    const z = (k - 10) * SPACING;
    const slot: Slot = {
      idx: idx++,
      filmId: f.id,
      mood: f.mood,
      x,
      y: SHELF_TOPS[1] + BOX.h / 2,
      z,
      nx: 0,
      nz: 1,
    };
    SLOTS.push(slot);
    (SLOTS_BY_FILM[f.id] ||= []).push(slot);
  }
}

buildSlots();

export function recomputeSlots() {
  buildSlots();
}

export type Box2 = { x0: number; x1: number; z0: number; z1: number };

export const COLLIDERS: Box2[] = [
  ...GONDOLAS.map((g) => ({
    x0: g.x - GOND.len / 2 - 0.1,
    x1: g.x + GOND.len / 2 + 0.1,
    z0: g.z - GOND.depth / 2,
    z1: g.z + GOND.depth / 2,
  })),
  { x0: -20.4, x1: -13.6, z0: 12.2, z1: 14.2 },
  { x0: -1.45, x1: 1.45, z0: 14.0, z1: 16.5 },
  { x0: -ROOM.hx, x1: ROOM.hx, z0: -ROOM.hz, z1: -ROOM.hz + 0.95 },
  { x0: 15.2, x1: 19.8, z0: 13.4, z1: 15.2 },
];

type Rect = { x0: number; x1: number; z0: number; z1: number };

function inRect(x: number, z: number, r: number, rc: Rect) {
  return x > rc.x0 + r && x < rc.x1 - r && z > rc.z0 + r && z < rc.z1 - r;
}

export function collide(x: number, z: number, r = 0.42) {
  const walkable =
    inRect(x, z, r, SHOP_RECT) ||
    inRect(x, z, r, CINEMA_RECT) ||
    (x > DOOR_RECT.x0 + 0.2 && x < DOOR_RECT.x1 - 0.2 && z > DOOR_RECT.z0 + r && z < DOOR_RECT.z1 + r);
  if (!walkable) return true;
  for (const c of COLLIDERS) {
    if (x > c.x0 - r && x < c.x1 + r && z > c.z0 - r && z < c.z1 + r) return true;
  }
  return false;
}

export function clampRoom(x: number, z: number, r = 0.45) {
  if (x > ROOM.hx - 0.2) {
    return {
      x: Math.max(ROOM.hx - 0.2, Math.min(CINEMA_RECT.x1 - r, x)),
      z: Math.max(CINEMA.z - CINEMA.hz + r, Math.min(CINEMA.z + CINEMA.hz - r, z)),
    };
  }
  return {
    x: Math.max(-ROOM.hx + r, Math.min(ROOM.hx - r, x)),
    z: Math.max(-ROOM.hz + r, Math.min(ROOM.hz - r, z)),
  };
}

export function nearestSlotOf(filmId: string, fromX: number, fromZ: number) {
  const list = SLOTS_BY_FILM[filmId];
  if (!list || !list.length) return null;
  let best = list[0];
  let bd = Infinity;
  for (const s of list) {
    const d = (s.x - fromX) ** 2 + (s.z - fromZ) ** 2;
    if (d < bd) {
      bd = d;
      best = s;
    }
  }
  return best;
}

export function gondolaOf(mood: MoodId) {
  return GONDOLAS.find((g) => g.mood === mood)!;
}
