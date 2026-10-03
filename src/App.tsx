import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import Scene from './three/Scene';
import Player from './three/Player';
import { Compass, Crosshair, HeldIndicator, Joystick, Minimap, MoodLegend, Prompt, Toast, TopBar, TouchButtons } from './ui/Hud';
import {
  ClaudioPanel,
  CustomFilmPanel,
  FilmModal,
  HelpPanel,
  Intro,
  MoodPanel,
  NowPlayingPanel,
  QuizPanel,
  SearchPanel,
  SerataPanel,
} from './ui/Panels';
import { CinemaOverlay } from './ui/CinemaOverlay';
import { FreeCinemaPanel } from './ui/FreeCinemaPanel';
import { keys, look, press, tapReq, uiOpen, useGame } from './lib/state';
import { mergeYouTubeTitles } from './data/freeMovies';

export default function App() {
  const phase = useGame((s) => s.phase);
  const panel = useGame((s) => s.panel);
  const openFilm = useGame((s) => s.openFilm);
  const setTouch = useGame((s) => s.setTouch);
  const [mounted, setMounted] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ id: number; x: number; y: number; t: number; moved: number } | null>(null);

  /* ------- mount differito ------- */
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 40);
    return () => clearTimeout(t);
  }, []);

  /* ------- carica i film YouTube al startup ------- */
  useEffect(() => {
    mergeYouTubeTitles().then(({ added, skipped }) => {
      console.log('[App] YouTube merge complete:', { added, skipped });
    }).catch((e) => console.warn('[App] YouTube merge failed:', e));
  }, []);

  /* ------- rilevamento touch ------- */
  useEffect(() => {
    const coarse = window.matchMedia?.('(pointer: coarse)').matches || 'ontouchstart' in window;
    if (coarse) setTouch(true);
  }, [setTouch]);

  /* ------- tastiera ------- */
  useEffect(() => {
    const isField = (t: EventTarget | null) =>
      t instanceof HTMLElement && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA');

    const down = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      const g = useGame.getState();

      if (k === 'escape') {
        g.setPanel(null);
        g.setOpenFilm(null);
        return;
      }

      if (isField(e.target)) return;
      if (uiOpen()) return;

      keys.add(k);

      if (k === ' ' || k === 'spacebar') {
        press.jump = true;
        e.preventDefault();
      }
      if (k === 'e' || k === 'enter') {
        press.interact = true;
        e.preventDefault();
      }
      if (k === 'v') g.toggleView();
      if (k === 'l') g.toggleFlashlight();
      if (k === 'x') {
        g.dropHeld();
        e.preventDefault();
      }
      if (k === 'f' || k === '/') {
        g.setPanel('search');
        e.preventDefault();
      }
      if (k === 'm') g.setPanel('mood');
      if (k === 'b') g.setPanel('serata');
      if (k.startsWith('arrow')) e.preventDefault();
    };

    const up = (e: KeyboardEvent) => keys.delete(e.key.toLowerCase());
    const blur = () => keys.clear();

    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    window.addEventListener('blur', blur);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      window.removeEventListener('blur', blur);
    };
  }, []);

  /* ------- mouse look con pointer lock ------- */
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (document.pointerLockElement) {
        look.dx += e.movementX;
        look.dy += e.movementY;
      }
    };
    const onDownDoc = () => {
      if (document.pointerLockElement && !uiOpen()) press.interact = true;
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mousedown', onDownDoc);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mousedown', onDownDoc);
    };
  }, []);

  /* ------- chiudi il lock quando si apre un pannello ------- */
  useEffect(() => {
    if ((panel || openFilm || phase !== 'play') && document.pointerLockElement) document.exitPointerLock();
  }, [panel, openFilm, phase]);

  const blocked = phase !== 'play' || !!panel || !!openFilm;

  /* ------- layer input su schermo ------- */
  const onDown = (e: React.PointerEvent) => {
    if (blocked) return;
    if (e.pointerType === 'mouse') {
      const cv = wrapRef.current?.querySelector('canvas');
      if (cv && !document.pointerLockElement) {
        (cv as HTMLCanvasElement).requestPointerLock?.();
        return;
      }
      press.interact = true;
      return;
    }
    useGame.getState().setTouch(true);
    drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, t: performance.now(), moved: 0 };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    d.x = e.clientX;
    d.y = e.clientY;
    d.moved += Math.abs(dx) + Math.abs(dy);
    look.dx += dx * 2.2;
    look.dy += dy * 2.0;
  };

  const onUp = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    // Tap corto = selezione diretta nel punto toccato (mobile / tablet)
    if (e.pointerType !== 'mouse' && performance.now() - d.t < 320 && d.moved < 14) {
      tapReq.x = e.clientX;
      tapReq.y = e.clientY;
      tapReq.active = true;
    }
    drag.current = null;
  };

  return (
    <div ref={wrapRef} className="relative h-full w-full overflow-hidden bg-[#06080f] select-none">
      {mounted && (
        <Canvas
          dpr={[1, 2]}
          gl={{ antialias: true, powerPreference: 'high-performance' }}
          camera={{ fov: 70, near: 0.08, far: 180, position: [0, 1.6, 14.4] }}
          onCreated={({ scene, gl }) => {
            scene.background = new THREE.Color('#0b1120');
            gl.setClearColor('#0b1120');
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.toneMappingExposure = 1.15;
          }}
        >
          <Scene />
          <Player />
        </Canvas>
      )}

      {!mounted && (
        <div className="absolute inset-0 grid place-items-center text-xs tracking-[0.3em] text-white/40">
          CARICAMENTO VIDEOTECA 3D…
        </div>
      )}

      {/* Layer per input e pointer lock */}
      <div
        className="absolute inset-0 z-10"
        style={{ pointerEvents: blocked ? 'none' : 'auto', touchAction: 'none' }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      />

      {phase === 'play' && (
        <>
          <TopBar />
          <Crosshair />
          <Prompt />
          <Compass />
          <Minimap />
          <MoodLegend />
          <Joystick />
          <TouchButtons />
          <HeldIndicator />
          <CinemaOverlay />
          <Toast />
          <HintBar />
        </>
      )}

      {phase === 'intro' && <Intro />}
      {panel === 'mood' && <MoodPanel />}
      {panel === 'freecinema' && <FreeCinemaPanel />}
      {panel === 'nowplaying' && <NowPlayingPanel />}
      {panel === 'quiz' && <QuizPanel />}
      {panel === 'claudio' && <ClaudioPanel />}
      {panel === 'search' && <SearchPanel />}
      {panel === 'serata' && <SerataPanel />}
      {panel === 'custom' && <CustomFilmPanel />}
      {panel === 'help' && <HelpPanel />}
      <FilmModal />
    </div>
  );
}

function HintBar() {
  const touch = useGame((s) => s.touch);
  const [show, setShow] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setShow(false), 8000);
    return () => clearTimeout(t);
  }, []);
  if (!show || touch) return null;
  return (
    <div className="pointer-events-none absolute bottom-6 left-1/2 z-20 -translate-x-1/2">
      <div className="bb-chip bb-blink rounded-full px-4 py-2 text-[11px] text-white/80 shadow-lg">
        Clicca per bloccare il mouse · ↑↓ cammina · Spazio salta · <b className="text-[#f5c518]">E</b> interagisci · <b className="text-[#39e6a0]">L</b> torcia
      </div>
    </div>
  );
}
