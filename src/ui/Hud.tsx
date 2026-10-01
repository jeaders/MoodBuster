import { useEffect, useRef, type ReactNode } from 'react';
import { FILM_BY_ID, MOOD_BY_ID, MOODS } from '../data/films';
import { CINEMA, CLERK, GOND, GONDOLAS, KIOSK, ROOM, CINEMA_SEATS } from '../lib/layout';
import { press, rt, stick, useGame } from '../lib/state';
import { thumb } from './common';
import { FilmCover } from './useTmdb';

/* ------------------------------------------------------------------ */
export function Crosshair() {
  const focus = useGame((s) => s.focus);
  const view = useGame((s) => s.view);
  const seatedSeatId = useGame((s) => s.seatedSeatId);
  const on = !!focus;
  if (view === 'tp' || seatedSeatId) return null;
  return (
    <div className="pointer-events-none absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
      <div
        className={`rounded-full border-2 transition-all duration-150 ${
          on ? 'h-6 w-6 border-[#ffd84a] bg-yellow-400/20' : 'h-2.5 w-2.5 border-white/70'
        }`}
      />
      <div className="absolute left-1/2 top-1/2 h-[3px] w-[3px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/90" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
export function Prompt() {
  const focus = useGame((s) => s.focus);
  const touch = useGame((s) => s.touch);
  const openFilm = useGame((s) => s.openFilm);
  const panel = useGame((s) => s.panel);
  const seatedSeatId = useGame((s) => s.seatedSeatId);
  if (!focus || openFilm || panel || seatedSeatId) return null;

  if (focus.kind === 'kiosk') {
    return (
      <div className="pointer-events-none absolute bottom-28 left-1/2 z-20 -translate-x-1/2">
        <div className="bb-panel bb-pop flex items-center gap-3 rounded-xl px-4 py-2.5">
          <span className="text-2xl animate-bounce">🎬</span>
          <div>
            <div className="bb-title text-lg leading-none text-[#f5c518]">MOOD-O-MATIC</div>
            <div className="text-[11px] text-white/70">Scegli il film in base all&apos;umore</div>
          </div>
          <kbd className="ml-2 rounded bg-[#f5c518] px-2.5 py-1 text-[11px] font-black text-black">
            {touch ? 'TOCCA' : 'E'}
          </kbd>
        </div>
      </div>
    );
  }

  if (focus.kind === 'clerk') {
    return (
      <div className="pointer-events-none absolute bottom-28 left-1/2 z-20 -translate-x-1/2">
        <div className="bb-panel bb-pop flex items-center gap-3 rounded-xl px-4 py-2.5 border-[#39e6a0]/60">
          <span className="text-2xl">🧑‍💼</span>
          <div>
            <div className="bb-title text-lg leading-none text-[#39e6a0]">CLAUDIO IL COMMESSO</div>
            <div className="text-[11px] text-white/70">Chiedi un consiglio o fai due chiacchiere</div>
          </div>
          <kbd className="ml-2 rounded bg-[#39e6a0] px-2.5 py-1 text-[11px] font-black text-black">
            {touch ? 'TOCCA' : 'E'}
          </kbd>
        </div>
      </div>
    );
  }

  if (focus.kind === 'seat') {
    const seat = CINEMA_SEATS.find((s) => s.id === focus.seatId);
    if (!seat) return null;
    return (
      <div className="pointer-events-none absolute bottom-28 left-1/2 z-20 -translate-x-1/2">
        <div className="bb-panel bb-pop flex items-center gap-3 rounded-xl px-4 py-2.5 border-red-500/60 bg-red-950/80">
          <span className="text-2xl">💺</span>
          <div>
            <div className="bb-title text-base leading-none text-red-400">POLTRONCINA CINEMA</div>
            <div className="text-[11px] text-white/80">{seat.rowName} • Posto {seat.seatNum}</div>
          </div>
          <kbd className="ml-2 rounded bg-red-500 px-2.5 py-1 text-[11px] font-black text-white">
            {touch ? 'SIEDI' : 'E'}
          </kbd>
        </div>
      </div>
    );
  }

  if (focus.kind === 'film') {
    const f = FILM_BY_ID[focus.filmId];
    if (!f) return null;
    const m = MOOD_BY_ID[f.mood];
    return (
      <div className="pointer-events-none absolute bottom-28 left-1/2 z-20 -translate-x-1/2">
        <div className="bb-panel bb-pop flex max-w-[86vw] items-center gap-3 rounded-xl px-3 py-2.5">
          <img src={thumb(f)} alt="" className="h-14 w-10 rounded object-cover ring-1 ring-white/25" />
          <div className="min-w-0">
            <div className="bb-title truncate text-lg leading-tight text-white">{f.t.toUpperCase()}</div>
            <div className="flex items-center gap-2 text-[11px] text-white/65">
              <span style={{ color: m.colore }}>
                {m.emoji} {m.nome}
              </span>
              <span>•</span>
              <span>{f.y}</span>
              <span>•</span>
              <span>★ {f.r.toFixed(1)}</span>
            </div>
          </div>
          <kbd className="ml-1 shrink-0 rounded bg-[#f5c518] px-2.5 py-1 text-[11px] font-black text-black">
            {touch ? 'TOCCA' : 'E'}
          </kbd>
        </div>
      </div>
    );
  }

  return null;
}

/* ------------------------------------------------------------------ */
export function TopBar() {
  const setPanel = useGame((s) => s.setPanel);
  const serata = useGame((s) => s.serata);
  const moodFilter = useGame((s) => s.moodFilter);
  const view = useGame((s) => s.view);
  const toggleView = useGame((s) => s.toggleView);
  const flashlight = useGame((s) => s.flashlight);
  const toggleFlashlight = useGame((s) => s.toggleFlashlight);
  const soundEnabled = useGame((s) => s.soundEnabled);
  const toggleSound = useGame((s) => s.toggleSound);
  const musicEnabled = useGame((s) => s.musicEnabled);
  const toggleMusic = useGame((s) => s.toggleMusic);
  const seatedSeatId = useGame((s) => s.seatedSeatId);
  const m = moodFilter ? MOOD_BY_ID[moodFilter] : null;

  if (seatedSeatId) return null;

  const Btn = ({
    children,
    onClick,
    accent,
    active,
    title,
  }: {
    children: ReactNode;
    onClick: () => void;
    accent?: boolean;
    active?: boolean;
    title?: string;
  }) => (
    <button
      title={title}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={onClick}
      className={`pointer-events-auto rounded-lg px-2.5 py-1.5 text-[11px] font-bold tracking-wide transition active:scale-95 ${
        accent
          ? 'bg-[#f5c518] text-black hover:bg-[#ffd84a] shadow-lg shadow-yellow-500/20'
          : active
            ? 'bg-[#39e6a0] text-black'
            : 'bb-chip text-white/85 hover:border-white/40'
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex flex-wrap items-start justify-between gap-2 p-2.5 sm:p-3">
      <div className="flex flex-col items-start gap-1.5">
        <div className="bb-chip flex items-center gap-2 rounded-lg px-2.5 py-1.5">
          <div className="bb-title rounded bg-[#f5c518] px-1.5 text-[14px] leading-5 text-[#0b1f5c]">MOODBUSTER</div>
          <span className="hidden text-[10px] tracking-[0.2em] text-white/60 sm:inline">VIDEO & CINEMA</span>
        </div>
        {m && (
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => useGame.getState().setMoodFilter(null)}
            className="pointer-events-auto flex items-center gap-1.5 rounded-lg px-2 py-1 text-[10px] font-bold text-black shadow"
            style={{ background: m.colore }}
          >
            {m.emoji} {m.nome} <span className="opacity-70">✕</span>
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-end gap-1.5">
        <Btn onClick={() => setPanel('mood')} accent>
          🎬 MOOD
        </Btn>
        <Btn onClick={() => setPanel('freecinema')} active title="25+ film interi gratis su YouTube">
          📺 CINEMA GRATIS
        </Btn>
        <Btn onClick={() => setPanel('quiz')}>
          ❤️ QUIZ
        </Btn>
        <Btn onClick={() => setPanel('claudio')}>
          🧑‍💼 COMMESSO
        </Btn>
        <Btn onClick={() => setPanel('search')}>🔎 CERCA</Btn>
        <Btn onClick={() => setPanel('serata')}>
          🍿 SERATA {serata.length > 0 && `(${serata.length})`}
        </Btn>
        <Btn onClick={() => setPanel('custom')}>➕ AGGIUNGI</Btn>
        <Btn onClick={toggleFlashlight} active={flashlight} title="Torcia notturna (Tasto L)">
          🔦 {flashlight ? 'ON' : 'OFF'}
        </Btn>
        <Btn onClick={toggleMusic} active={musicEnabled} title="Musica lo-fi synthwave">
          🎵 {musicEnabled ? 'MUSICA' : 'NO MUSIC'}
        </Btn>
        <Btn onClick={toggleSound} title="Effetti sonori">
          {soundEnabled ? '🔊' : '🔇'}
        </Btn>
        <Btn onClick={toggleView} title="Cambia visuale">
          {view === 'fp' ? '👁 1ª' : '🧍 3ª'}
        </Btn>
        <Btn onClick={() => setPanel('help')}>?</Btn>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
export function Minimap() {
  const ref = useRef<HTMLCanvasElement>(null);
  const seatedSeatId = useGame((s) => s.seatedSeatId);
  useEffect(() => {
    const cv = ref.current!;
    const ctx = cv.getContext('2d')!;
    const W = cv.width;
    const H = cv.height;

    const minX = -ROOM.hx;
    const maxX = CINEMA.x + CINEMA.hx;
    const spanX = maxX - minX;
    const minZ = -ROOM.hz;
    const maxZ = ROOM.hz;
    const spanZ = maxZ - minZ;

    const mx = (x: number) => ((x - minX) / spanX) * W;
    const mz = (z: number) => ((z - minZ) / spanZ) * H;

    let raf = 0;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = 'rgba(8,14,32,0.88)';
      ctx.fillRect(0, 0, W, H);

      ctx.fillStyle = '#420b12';
      ctx.fillRect(mx(ROOM.hx), mz(CINEMA.z - CINEMA.hz), ((CINEMA.hx * 2) / spanX) * W, ((CINEMA.hz * 2) / spanZ) * H);
      
      ctx.fillStyle = '#ffd84a';
      ctx.fillRect(mx(CINEMA.screenX - 0.4), mz(CINEMA.screenZ - 3), 3, (6 / spanZ) * H);

      for (const g of GONDOLAS) {
        ctx.fillStyle = MOOD_BY_ID[g.mood].colore;
        ctx.globalAlpha = 0.9;
        ctx.fillRect(
          mx(g.x - GOND.len / 2),
          mz(g.z - GOND.depth / 2),
          (GOND.len / spanX) * W,
          Math.max(3, (GOND.depth / spanZ) * H),
        );
      }
      ctx.globalAlpha = 1;

      ctx.fillStyle = '#203a7a';
      ctx.fillRect(mx(-17.4), mz(10.2), (6.8 / spanX) * W, (2 / spanZ) * H);
      ctx.fillStyle = '#39e6a0';
      ctx.beginPath();
      ctx.arc(mx(CLERK.x), mz(CLERK.z), 3.5, 0, 7);
      ctx.fill();

      ctx.fillStyle = '#8a1d28';
      ctx.fillRect(mx(-15), mz(-ROOM.hz), (30 / spanX) * W, 3);

      ctx.fillStyle = '#9d6bff';
      ctx.beginPath();
      ctx.arc(mx(KIOSK.x), mz(KIOSK.z), 4, 0, 7);
      ctx.fill();

      const wp = useGame.getState().waypoint;
      if (wp) {
        ctx.fillStyle = '#39e6a0';
        ctx.beginPath();
        ctx.arc(mx(wp.x), mz(wp.z), 4.5, 0, 7);
        ctx.fill();
        ctx.strokeStyle = 'rgba(57,230,160,0.6)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(mx(wp.x), mz(wp.z), 7 + Math.sin(performance.now() / 200) * 2, 0, 7);
        ctx.stroke();
      }

      const px = mx(rt.x);
      const pz = mz(rt.z);
      const fx = -Math.sin(rt.yaw);
      const fz = -Math.cos(rt.yaw);
      ctx.fillStyle = '#ffd84a';
      ctx.beginPath();
      ctx.moveTo(px + fx * 6, pz + fz * 6);
      ctx.lineTo(px - fz * 4 - fx * 3, pz + fx * 4 - fz * 3);
      ctx.lineTo(px + fz * 4 - fx * 3, pz - fx * 4 - fz * 3);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = 'rgba(245,197,24,0.45)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(1, 1, W - 2, H - 2);
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  if (seatedSeatId) return null;

  return (
    <div className="pointer-events-none absolute bottom-3 right-3 z-20 hidden sm:block">
      <div className="relative">
        <canvas ref={ref} width={180} height={130} className="rounded-lg shadow-2xl" />
        <div className="absolute top-1 left-1.5 text-[8px] font-black tracking-wider text-yellow-400/80">MAPPA</div>
        <div className="absolute top-1 right-1.5 text-[8px] font-black text-red-400/90">SALA 1 🎬</div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
export function Compass() {
  const wp = useGame((s) => s.waypoint);
  const seatedSeatId = useGame((s) => s.seatedSeatId);
  const ref = useRef<HTMLDivElement>(null);
  const dref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!wp) return;
    let raf = 0;
    const tick = () => {
      const vx = wp.x - rt.x;
      const vz = wp.z - rt.z;
      const len = Math.hypot(vx, vz) || 1;
      const fx = -Math.sin(rt.yaw);
      const fz = -Math.cos(rt.yaw);
      const rx = Math.cos(rt.yaw);
      const rz = -Math.sin(rt.yaw);
      const c = (vx * fx + vz * fz) / len;
      const s = (vx * rx + vz * rz) / len;
      if (ref.current) ref.current.style.transform = `rotate(${Math.atan2(s, c)}rad)`;
      if (dref.current) dref.current.textContent = `${len.toFixed(0)} m`;
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [wp]);
  if (!wp || seatedSeatId) return null;
  return (
    <div className="pointer-events-none absolute left-1/2 top-16 z-20 -translate-x-1/2">
      <div className="flex items-center gap-2 rounded-full border border-[#39e6a0]/60 bg-[#04241a]/90 px-3 py-1.5 shadow-lg">
        <div ref={ref} className="text-[#39e6a0]">
          ▲
        </div>
        <div className="text-[11px] font-bold text-[#9ff5d0]">
          {wp.label} · <span ref={dref}>–</span>
        </div>
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => useGame.getState().setWaypoint(null)}
          className="pointer-events-auto ml-1 text-[11px] text-white/50 hover:text-white"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
export function Joystick() {
  const touch = useGame((s) => s.touch);
  const seatedSeatId = useGame((s) => s.seatedSeatId);
  const knob = useRef<HTMLDivElement>(null);
  const base = useRef<HTMLDivElement>(null);
  const id = useRef<number | null>(null);

  useEffect(() => {
    if (!touch || seatedSeatId) return;
    const el = base.current!;
    const R = 46;
    const set = (dx: number, dy: number) => {
      const l = Math.hypot(dx, dy);
      const k = l > R ? R / l : 1;
      const x = dx * k;
      const y = dy * k;
      if (knob.current) knob.current.style.transform = `translate(${x}px, ${y}px)`;
      stick.x = x / R;
      stick.y = -y / R;
      stick.active = true;
    };
    const down = (e: PointerEvent) => {
      e.stopPropagation();
      id.current = e.pointerId;
      el.setPointerCapture(e.pointerId);
      const r = el.getBoundingClientRect();
      set(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2));
    };
    const move = (e: PointerEvent) => {
      if (id.current !== e.pointerId) return;
      e.stopPropagation();
      const r = el.getBoundingClientRect();
      set(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2));
    };
    const up = (e: PointerEvent) => {
      if (id.current !== e.pointerId) return;
      id.current = null;
      stick.x = 0;
      stick.y = 0;
      stick.active = false;
      if (knob.current) knob.current.style.transform = 'translate(0px,0px)';
    };
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    return () => {
      el.removeEventListener('pointerdown', down);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', up);
    };
  }, [touch, seatedSeatId]);

  if (!touch || seatedSeatId) return null;
  return (
    <div
      ref={base}
      className="pointer-events-auto absolute bottom-6 left-5 z-30 flex h-32 w-32 items-center justify-center rounded-full border-2 border-white/25 bg-black/40 backdrop-blur-sm"
      style={{ touchAction: 'none' }}
    >
      <div ref={knob} className="h-14 w-14 rounded-full border-2 border-[#f5c518]/80 bg-[#f5c518]/40 shadow-inner" />
      <div className="pointer-events-none absolute -top-6 text-[10px] font-bold tracking-widest text-white/60">MUOVI</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
export function TouchButtons() {
  const touch = useGame((s) => s.touch);
  const focus = useGame((s) => s.focus);
  const view = useGame((s) => s.view);
  const flashlight = useGame((s) => s.flashlight);
  const held = useGame((s) => s.held);
  const seatedSeatId = useGame((s) => s.seatedSeatId);

  if (!touch || seatedSeatId) return null;
  return (
    <div className="pointer-events-none absolute bottom-6 right-4 z-30 flex flex-col items-end gap-2.5">
      <div className="flex gap-2">
        {held && (
          <button
            onPointerDown={(e) => {
              e.stopPropagation();
              useGame.getState().dropHeld();
            }}
            className="pointer-events-auto h-12 w-12 rounded-full border-2 border-red-400/70 bg-red-500/30 text-lg shadow-lg"
            title="Lascia la cassetta"
          >
            📼
          </button>
        )}
        <button
          onPointerDown={(e) => {
            e.stopPropagation();
            useGame.getState().toggleFlashlight();
          }}
          className={`pointer-events-auto h-12 w-12 rounded-full border-2 text-base transition ${
            flashlight ? 'border-yellow-400 bg-yellow-400/40 text-yellow-300' : 'border-white/25 bg-black/50 text-white/60'
          }`}
        >
          💡
        </button>
        <button
          onPointerDown={(e) => {
            e.stopPropagation();
            useGame.getState().toggleView();
          }}
          className="pointer-events-auto h-12 w-12 rounded-full border-2 border-white/25 bg-black/50 text-base"
        >
          {view === 'fp' ? '🧍' : '👁'}
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          onPointerDown={(e) => {
            e.stopPropagation();
            press.jump = true;
          }}
          className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full border-2 border-white/30 bg-black/50 text-xs font-black text-white/80 active:bg-white/20"
        >
          SALTA
        </button>

        <button
          onPointerDown={(e) => {
            e.stopPropagation();
            press.interact = true;
          }}
          className={`pointer-events-auto flex h-20 w-20 items-center justify-center rounded-full border-4 text-xs font-black tracking-wider shadow-2xl transition active:scale-95 ${
            focus
              ? focus.kind === 'seat'
                ? 'border-red-500 bg-red-600/90 text-white shadow-red-500/30'
                : 'border-[#f5c518] bg-[#f5c518] text-black shadow-yellow-500/30'
              : 'border-white/25 bg-black/50 text-white/60'
          }`}
        >
          {focus ? (focus.kind === 'clerk' ? 'PARLA' : focus.kind === 'seat' ? 'SIEDI' : 'APRI') : 'AZIONE'}
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
export function HeldIndicator() {
  const held = useGame((s) => s.held);
  const touch = useGame((s) => s.touch);
  const seatedSeatId = useGame((s) => s.seatedSeatId);
  if (!held || seatedSeatId) return null;
  const f = FILM_BY_ID[held];
  if (!f) return null;
  return (
    <div className={`absolute z-30 ${touch ? 'bottom-48 left-4' : 'bottom-3 left-1/2 -translate-x-1/2 md:left-auto md:right-56 md:translate-x-0'}`}>
      <div className="bb-panel flex items-center gap-2.5 rounded-xl px-3 py-2 shadow-2xl">
        <FilmCover tmdbId={f.tmdbId} fallback={thumb(f)} className="h-14 w-10 rounded object-cover ring-1 ring-white/25" />
        <div className="min-w-0">
          <div className="text-[9px] uppercase tracking-widest text-[#f5c518]">In mano</div>
          <div className="bb-title max-w-32 truncate text-sm leading-tight text-white">{f.t.toUpperCase()}</div>
        </div>
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => useGame.getState().dropHeld()}
          className="pointer-events-auto ml-1 rounded-lg bg-red-500/80 px-2.5 py-1.5 text-[10px] font-black text-white hover:bg-red-500 active:scale-95"
          title="Rimetti la cassetta a posto (tasto X)"
        >
          LASCIAMO
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
export function Toast() {
  const toast = useGame((s) => s.toast);
  if (!toast) return null;
  return (
    <div className="pointer-events-none absolute bottom-44 left-1/2 z-30 -translate-x-1/2">
      <div className="bb-pop rounded-xl border border-[#f5c518]/60 bg-[#141004]/95 px-5 py-2.5 text-sm font-bold text-[#ffe08a] shadow-2xl">
        {toast}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
export function MoodLegend() {
  const setPanel = useGame((s) => s.setPanel);
  const touch = useGame((s) => s.touch);
  const seatedSeatId = useGame((s) => s.seatedSeatId);
  if (touch || seatedSeatId) return null;
  return (
    <div className="pointer-events-none absolute bottom-3 left-3 z-20 hidden md:block">
      <div className="bb-chip rounded-lg p-2.5 shadow-xl bg-black/50 backdrop-blur-sm">
        <div className="mb-1.5 px-1 text-[9px] tracking-[0.2em] text-white/50">REPARTI PER MOOD</div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1">
          {MOODS.map((m) => (
            <button
              key={m.id}
              onClick={() => {
                useGame.getState().setMoodFilter(m.id);
                setPanel('mood');
              }}
              className="pointer-events-auto flex items-center gap-1.5 text-left text-[10px] text-white/70 hover:text-white"
            >
              <span className="h-2 w-2 rounded-sm" style={{ background: m.colore }} />
              {m.nome}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
