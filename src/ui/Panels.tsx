import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  FILMS, FILM_BY_ID, MOODS, MOOD_BY_ID, prezzo, saveCustomFilm,
  type Film, type MoodId,
} from '../data/films';
import { gondolaOf, nearestSlotOf } from '../lib/layout';
import { flash, rt, useGame } from '../lib/state';
import { audio } from '../lib/audio';
import { bigThumb, dur, thumb } from './common';
import { FilmCover, tmdbPosterUrl, useTmdbPosterPath } from './useTmdb';
import {
  fetchMovieDetail, fetchNowPlaying, fetchTrending, getApiKey, setApiKey as saveApiKey,
  posterUrl, getTrailerEmbedUrl, getItalianProviders,
  type TmdbMovie,
} from '../lib/tmdb';

/* ─── helpers ─────────────────────────────────────────────── */
function goTo(filmId: string, close = true) {
  const s = nearestSlotOf(filmId, rt.x, rt.z);
  const g = useGame.getState();
  if (!s) return;
  g.setWaypoint({ x: s.x + s.nx * 1.35, z: s.z + s.nz * 1.35, label: FILM_BY_ID[filmId]?.t || '', filmId });
  if (close) { g.setPanel(null); g.setOpenFilm(null); }
  flash('Segui la colonna verde 🎯');
}

function goToCinema(filmId?: string) {
  const g = useGame.getState();
  if (filmId) g.setHeld(filmId);
  g.setWaypoint({ x: 26, z: -6, label: 'Sala 1 • Cinema', filmId: null });
  g.setPanel(null); g.setOpenFilm(null);
  flash('Segui la colonna verde fino alla Sala 1 🎬');
}

function Shell({ children, title, sub, onClose, wide }: { children: ReactNode; title: string; sub?: string; onClose: () => void; wide?: boolean }) {
  return (
    <div className="pointer-events-auto absolute inset-0 z-40 flex items-center justify-center bg-black/80 p-2 sm:p-4 backdrop-blur-sm" onPointerDown={(e) => e.stopPropagation()}>
      <div className={`bb-panel bb-pop scan relative flex max-h-[94vh] w-full flex-col overflow-hidden rounded-2xl ${wide ? 'max-w-5xl' : 'max-w-2xl'}`}>
        <div className="flex items-center justify-between border-b border-white/10 px-4 sm:px-6 py-3.5 bg-gradient-to-r from-blue-950/40 to-transparent shrink-0">
          <div><h2 className="bb-title text-2xl sm:text-3xl leading-none text-[#f5c518]">{title}</h2>{sub && <p className="mt-1 text-[11px] text-white/60">{sub}</p>}</div>
          <button onClick={() => { audio.blip(400); onClose(); }} className="rounded-lg bg-white/10 px-3 py-1.5 text-sm text-white/80 hover:bg-white/25 active:scale-95">✕</button>
        </div>
        <div className="no-scrollbar overflow-y-auto px-4 sm:px-6 py-4">{children}</div>
      </div>
    </div>
  );
}

function Pill({ children, color }: { children: ReactNode; color?: string }) {
  return <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold" style={{ background: (color || '#fff') + '22', color: color || '#fff' }}>{children}</span>;
}

/* ─── Trailer Modal ───────────────────────────────────────── */
function TrailerModal({ embedUrl, onClose }: { embedUrl: string; onClose: () => void }) {
  return (
    <div className="pointer-events-auto fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4" onClick={onClose}>
      <div className="relative w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute -top-10 right-0 text-white/70 hover:text-white text-sm">✕ Chiudi</button>
        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
          <iframe src={embedUrl} className="absolute inset-0 w-full h-full rounded-xl" allow="autoplay; encrypted-media; fullscreen" allowFullScreen />
        </div>
      </div>
    </div>
  );
}

/* ─── Player trailer inline (autoplay) ───────────────────── */
function InlineTrailer({ film }: { film: Film }) {
  const [embed, setEmbed] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!film.tmdbId) {
      setLoading(false);
      return;
    }
    let alive = true;
    setLoading(true);
    fetchMovieDetail(film.tmdbId)
      .then((d) => {
        if (!alive) return;
        setEmbed(getTrailerEmbedUrl(d.videos?.results));
        setLoading(false);
      })
      .catch(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [film.tmdbId]);

  const ytSearch = `https://www.youtube.com/results?search_query=${encodeURIComponent(film.t + ' ' + film.y + ' trailer italiano ufficiale')}`;

  return (
    <div className="mb-4 overflow-hidden rounded-xl border border-white/15 bg-black shadow-2xl">
      <div className="flex items-center justify-between bg-red-600/90 px-3 py-1.5">
        <span className="font-mono text-[11px] font-black tracking-wider text-white">▶ TRAILER UFFICIALE</span>
        <span className="font-mono text-[10px] text-white/80">SP • HI-FI</span>
      </div>
      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
        {embed ? (
          <iframe
            src={embed}
            title={`Trailer ${film.t}`}
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-zinc-900 to-black text-center">
            <div className="text-3xl">{loading ? '⏳' : '🎬'}</div>
            <p className="px-4 text-xs text-white/60">
              {loading ? 'Cerco il trailer su TMDB…' : 'Trailer non disponibile per questo titolo.'}
            </p>
            {!loading && (
              <a href={ytSearch} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-black text-white hover:bg-red-500">
                ▶ Cerca su YouTube
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/** Poster grande del modal: usa l'immagine reale TMDB appena risolta, altrimenti quella procedurale. */
function ModalPoster({ tmdbId, fallback }: { tmdbId: number; fallback: string }) {
  const path = useTmdbPosterPath(tmdbId);
  const remote = tmdbPosterUrl(path, 'w500');
  const [src, setSrc] = useState(remote || fallback);
  useEffect(() => {
    if (remote) setSrc(remote);
  }, [remote]);
  return (
    <div className="relative">
      <img src={src} alt="" className="w-full rounded-lg object-cover shadow-2xl ring-2 ring-white/25" onError={() => setSrc(fallback)} />
      {remote && <span className="absolute bottom-1.5 right-1.5 rounded bg-black/75 px-1.5 py-0.5 text-[9px] font-bold text-emerald-300">LOCANDINA REALE</span>}
    </div>
  );
}

/* ─── TmdbInfoBlock: streaming + cast ────────────────────── */
function TmdbInfoBlock({ film }: { film: Film }) {
  const [data, setData] = useState<TmdbMovie | null>(null);
  const [loading, setLoading] = useState(false);
  const hasKey = useGame((s) => s.hasApiKey);

  useEffect(() => {
    if (!hasKey || !film.tmdbId) return;
    let cancelled = false;
    setLoading(true);
    fetchMovieDetail(film.tmdbId)
      .then((d) => {
        if (!cancelled) {
          setData(d);
          setLoading(false);
        }
      })
      .catch(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [film.tmdbId, hasKey]);

  if (!hasKey) return null;

  const providers = data ? getItalianProviders(data) : { flatrate: [] as string[], rent: [] as string[], link: null as string | null };

  return (
    <div className="mt-3 space-y-3">
      {loading && <div className="text-xs text-white/40 animate-pulse">Carico streaming e cast da TMDB…</div>}

      {providers.flatrate.length > 0 && (
        <div className="rounded-lg bg-emerald-950/30 border border-emerald-500/30 p-3">
          <div className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold mb-1">📺 Streaming incluso nell'abbonamento:</div>
          <div className="flex flex-wrap gap-1.5">
            {providers.flatrate.map((p) => (
              <span key={p} className="rounded-md bg-emerald-900/60 border border-emerald-400/40 px-2 py-0.5 text-[11px] font-semibold text-emerald-200">{p}</span>
            ))}
          </div>
          {providers.link && (
            <a href={providers.link} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-xs text-emerald-400 underline hover:text-emerald-300">
              Vedi su JustWatch →
            </a>
          )}
        </div>
      )}
      {providers.flatrate.length === 0 && providers.rent.length > 0 && (
        <div className="rounded-lg bg-blue-950/30 border border-blue-500/30 p-3">
          <div className="text-[10px] uppercase tracking-wider text-blue-400 font-bold mb-1">💎 Disponibile per noleggio/acquisto:</div>
          <div className="flex flex-wrap gap-1.5">
            {[...new Set(providers.rent)].map((p) => (
              <span key={p} className="rounded-md bg-blue-900/60 border border-blue-400/40 px-2 py-0.5 text-[11px] font-semibold text-blue-200">{p}</span>
            ))}
          </div>
        </div>
      )}

      {/* Cast info */}
      {data?.credits?.cast && data.credits.cast.length > 0 && (
        <div className="text-xs text-white/50">
          🎭 <b>Cast:</b> {data.credits.cast.slice(0, 5).map((c) => c.name).join(', ')}
        </div>
      )}
    </div>
  );
}

/* ─── Film Card (riusabile) ───────────────────────────────── */
function FilmCard({ film, onOpen }: { film: Film; onOpen: () => void }) {
  const m = MOOD_BY_ID[film.mood];
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-2.5 hover:border-white/20 transition">
      <FilmCover tmdbId={film.tmdbId} fallback={thumb(film)} className="h-20 w-14 shrink-0 rounded object-cover ring-1 ring-white/20" />
      <div className="min-w-0 flex-1">
        <div className="bb-title truncate text-base leading-tight text-white">{film.t.toUpperCase()}</div>
        <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-white/60">
          <Pill color={m.colore}>{m.emoji} {m.nome}</Pill>
          <span>{film.y}</span><span>•</span><span>{dur(film.d)}</span><span>•</span><span>★ {film.r.toFixed(1)}</span>
        </div>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          <button onClick={onOpen} className="rounded bg-white/15 px-2.5 py-1 text-[10px] font-bold text-white hover:bg-white/25">SCHEDA</button>
          <button onClick={() => goTo(film.id)} className="rounded bg-[#39e6a0] px-2.5 py-1 text-[10px] font-black text-black">📍 SCAFFALE</button>
          <button onClick={() => goToCinema(film.id)} className="rounded bg-[#e5452f] px-2 py-1 text-[10px] font-black text-white">🎬 SALA 1</button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════ */
/* INTRO                                                         */
/* ═══════════════════════════════════════════════════════════ */
export function Intro() {
  const start = useGame((s) => s.start);
  const touch = useGame((s) => s.touch);
  const setHasKey = useGame((s) => s.setHasApiKey);
  const [keyInput, setKeyInput] = useState(getApiKey());

  const handleSaveKey = () => {
    saveApiKey(keyInput);
    setHasKey(true);
    audio.fanfare();
    flash(keyInput.trim() ? 'API Key TMDB salvata! ✅' : 'Ripristinata la chiave condivisa ✅');
  };

  return (
    <div className="pointer-events-auto absolute inset-0 z-50 flex items-center justify-center bg-[#05070f]/95 p-4 overflow-y-auto">
      <div className="bb-panel bb-pop scan w-full max-w-xl rounded-2xl p-6 sm:p-8 text-center shadow-2xl my-4">
        <div className="mx-auto mb-4 inline-block border-4 border-[#f5c518] px-6 py-2.5">
          <div className="bb-title text-4xl sm:text-5xl leading-none text-[#f5c518]">MOODBUSTER</div>
          <div className="mt-1 text-[11px] tracking-[0.45em] text-white/80">VIDEO & CINEMA</div>
        </div>
        <p className="mx-auto max-w-lg text-sm sm:text-base leading-relaxed text-white/80">
          Entra nel Blockbuster 3D anni &apos;90: <b className="text-[#f5c518]">90+ film</b> in <b className="text-[#39e6a0]">11 reparti mood</b>,
          sala cinema con maxischermo, trailer YouTube reali e disponibilità streaming!
        </p>

        {/* Stato TMDB */}
        <div className="mt-5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 p-3.5 text-left">
          <div className="flex items-center justify-between gap-2">
            <div className="text-xs font-bold text-emerald-300">
              ✅ TMDB connesso · locandine, trailer e uscite in italiano
            </div>
            <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-200">
              it-IT
            </span>
          </div>
          <details className="mt-2">
            <summary className="cursor-pointer text-[11px] text-white/50 hover:text-white/80">
              Usa la mia API Key personale
            </summary>
            <div className="mt-2 flex gap-2">
              <input
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="API Key TMDB…"
                className="flex-1 rounded-lg bg-black/60 border border-white/20 px-3 py-2 text-sm text-white outline-none focus:border-emerald-400"
              />
              <button onClick={handleSaveKey} className="rounded-lg bg-emerald-500 px-3.5 py-2 text-sm font-bold text-black hover:bg-emerald-400">
                SALVA
              </button>
            </div>
            <p className="mt-1.5 text-[10px] text-white/40">
              Gratuita su{' '}
              <a href="https://www.themoviedb.org/settings/api" target="_blank" rel="noopener noreferrer" className="underline">
                themoviedb.org/settings/api
              </a>
              . Se la lasci vuota torna la chiave condivisa di default.
            </p>
          </details>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 text-left text-[11px] text-white/70 sm:grid-cols-4">
          {[['↑↓ WS', 'cammina'], ['←→ Mouse', 'guarda'], ['Spazio', 'salta'], ['E', 'interagisci']].map(([k, v]) => (
            <div key={k} className="bb-chip rounded-lg px-2 py-2"><div className="bb-title text-[#ffd84a]">{k}</div><div>{v}</div></div>
          ))}
        </div>
        {touch && <p className="mt-3 text-[11px] text-[#7ef5c0]">📱 Joystick + trascina + pulsanti per mobile</p>}

        <button onClick={start} className="mt-5 w-full rounded-xl bg-gradient-to-r from-[#f5c518] to-[#ffb700] px-6 py-4 text-lg font-black tracking-wide text-[#0b1f5c] shadow-lg hover:brightness-110 active:scale-[0.98]">
          ENTRA NELLA VIDEOTECA ▸
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════ */
/* MOOD-O-MATIC                                                  */
/* ═══════════════════════════════════════════════════════════ */
export function MoodPanel() {
  const setPanel = useGame((s) => s.setPanel);
  const moodFilter = useGame((s) => s.moodFilter);
  const [sel, setSel] = useState<MoodId | null>(moodFilter);
  const [maxLen, setMaxLen] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<Film | null>(null);
  const [ghost, setGhost] = useState<Film | null>(null);
  const timer = useRef<number>(0);

  const pool = useMemo(() => FILMS.filter((f) => (sel ? f.mood === sel : true)).filter((f) => (maxLen ? f.d <= maxLen : true)), [sel, maxLen]);

  const spin = () => {
    if (!pool.length) return;
    setSpinning(true); setResult(null);
    let n = 0;
    window.clearInterval(timer.current);
    timer.current = window.setInterval(() => {
      audio.tick();
      setGhost(pool[Math.floor(Math.random() * pool.length)]);
      n++;
      if (n > 18) {
        window.clearInterval(timer.current);
        const pick = pool[Math.floor(Math.random() * pool.length)];
        setGhost(null); setResult(pick); setSpinning(false);
        audio.fanfare();
      }
    }, 65);
  };
  useEffect(() => () => window.clearInterval(timer.current), []);

  return (
    <Shell title="MOOD-O-MATIC" sub="Scegli il mood, il tempo, e lascia fare a me." onClose={() => setPanel(null)} wide>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
        {MOODS.map((m) => {
          const on = sel === m.id;
          return (
            <button key={m.id} onClick={() => { audio.blip(on ? 440 : 660); setSel(on ? null : m.id); setResult(null); useGame.getState().setMoodFilter(on ? null : m.id); }}
              className={`rounded-xl border-2 p-2.5 text-left transition active:scale-95 ${on ? 'scale-[1.02] border-white ring-2 ring-yellow-400' : 'border-transparent hover:border-white/30'}`}
              style={{ background: `linear-gradient(140deg, ${m.colore}, ${m.colore2})` }}>
              <div className="text-xl">{m.emoji}</div>
              <div className="bb-title text-sm leading-tight text-white drop-shadow">{m.nome}</div>
              <div className="text-[9px] leading-tight text-white/80">{m.claim}</div>
            </button>
          );
        })}
      </div>

      {sel && (
        <button onClick={() => { const g = gondolaOf(sel); useGame.getState().setWaypoint({ x: g.x, z: g.z + 2.4, label: `Reparto ${MOOD_BY_ID[sel].nome}`, filmId: null }); useGame.getState().setPanel(null); flash('Segui la colonna verde 🎯'); }}
          className="mt-3 w-full rounded-xl border-2 border-[#39e6a0]/60 bg-[#39e6a0]/10 px-4 py-2.5 text-sm font-black text-[#39e6a0] hover:bg-[#39e6a0]/20">
          📍 PORTAMI AL REPARTO {MOOD_BY_ID[sel].nome}
        </button>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-[11px] text-white/60">Tempo:</span>
        {[[0, 'qualsiasi'], [100, '<1h40'], [130, '<2h10']].map(([v, l]) => (
          <button key={l as string} onClick={() => { audio.blip(500); setMaxLen(v as number); setResult(null); }}
            className={`rounded-full px-3 py-1 text-[11px] font-bold ${maxLen === v ? 'bg-[#f5c518] text-black' : 'bb-chip text-white/70'}`}>{l}</button>
        ))}
        <span className="ml-auto text-[11px] text-white/40">{pool.length} film</span>
      </div>

      <button onClick={spin} disabled={spinning || !pool.length}
        className="mt-4 w-full rounded-xl bg-gradient-to-r from-[#7b3bc9] via-[#4f6fd4] to-[#2fbf9e] px-6 py-4 text-lg font-black text-white shadow-xl disabled:opacity-50">
        {spinning ? '🎰 SCEGLIENDO...' : '🎲 SCEGLI PER ME'}
      </button>

      {(ghost || result) && (
        <div className="mt-4 flex flex-col gap-4 rounded-xl border border-white/10 bg-black/50 p-4 sm:flex-row">
          <img src={bigThumb((result || ghost)!)} alt="" className={`mx-auto h-56 w-38 rounded-lg ring-2 ring-white/25 ${spinning ? 'opacity-60 blur-[1px]' : 'bb-pop'}`} style={{ width: 150 }} />
          <div className="min-w-0 flex-1">
            <div className="bb-title text-3xl text-white">{(result || ghost)!.t.toUpperCase()}</div>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-white/60">
              <Pill color={MOOD_BY_ID[(result || ghost)!.mood].colore}>{MOOD_BY_ID[(result || ghost)!.mood].emoji} {MOOD_BY_ID[(result || ghost)!.mood].nome}</Pill>
              <span>{(result || ghost)!.y}</span><span>•</span><span>{dur((result || ghost)!.d)}</span><span>•</span><span>★ {(result || ghost)!.r.toFixed(1)}</span>
            </div>
            <p className="mt-2 text-sm text-white/80">{(result || ghost)!.s}</p>
            {(result || ghost)!.quote && <p className="mt-1 text-xs italic text-yellow-300/80">&ldquo;{(result || ghost)!.quote}&rdquo;</p>}
            {result && (
              <div className="mt-3 flex flex-wrap gap-2">
                <button onClick={() => goTo(result.id)} className="rounded-lg bg-[#39e6a0] px-4 py-2 text-sm font-black text-black">📍 SCAFFALE</button>
                <button onClick={() => goToCinema(result.id)} className="rounded-lg bg-[#e5452f] px-4 py-2 text-sm font-black text-white">🎬 SALA 1</button>
                <button onClick={() => { useGame.getState().toggleSerata(result.id); flash(`"${result.t}" aggiunto 🍿`); }} className="rounded-lg bg-[#f5c518] px-4 py-2 text-sm font-black text-black">🍿 SERATA</button>
                <button onClick={spin} className="bb-chip rounded-lg px-3 py-2 text-sm text-white/80">🔄 RIGIRA</button>
              </div>
            )}
          </div>
        </div>
      )}
    </Shell>
  );
}

/* ═══════════════════════════════════════════════════════════ */
/* ULTIME USCITE (TMDB)                                          */
/* ═══════════════════════════════════════════════════════════ */
export function NowPlayingPanel() {
  const setPanel = useGame((s) => s.setPanel);
  const hasKey = useGame((s) => s.hasApiKey);
  const setHasKey = useGame((s) => s.setHasApiKey);
  const [tab, setTab] = useState<'cinema' | 'trending'>('cinema');
  const [movies, setMovies] = useState<TmdbMovie[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<TmdbMovie | null>(null);
  const [trailerUrl, setTrailerUrl] = useState<string | null>(null);
  const [showTrailer, setShowTrailer] = useState(false);

  useEffect(() => {
    if (!hasKey) return;
    setLoading(true);
    const fetcher = tab === 'cinema' ? fetchNowPlaying : fetchTrending;
    fetcher('1').then((res) => {
      setMovies(res.results || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [tab, hasKey]);

  useEffect(() => {
    if (hasKey) return;
    setHasKey(true); // la chiave di default è già incorporata
  }, [hasKey, setHasKey]);

  return (
    <Shell title="ULTIME USCITE" sub="Dati in tempo reale da TMDB" onClose={() => setPanel(null)} wide>
      <div className="flex gap-2 mb-4">
        {([['cinema', '🎬 Al Cinema in Italia'], ['trending', '🌍 Di Tendenza']] as const).map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} className={`rounded-lg px-4 py-2 text-sm font-bold transition ${tab === id ? 'bg-[#f5c518] text-black' : 'bb-chip text-white/70'}`}>{label}</button>
        ))}
      </div>

      {loading && <div className="py-10 text-center text-white/40 animate-pulse">Caricamento film da TMDB...</div>}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {movies.map((m) => {
          const p = posterUrl(m.poster_path, 'w342');
          return (
            <button key={m.id} onClick={() => { setSelected(m); setShowTrailer(false); fetchMovieDetail(m.id).then((d) => { const url = getTrailerEmbedUrl(d.videos?.results); setTrailerUrl(url); }); }}
              className="group text-left rounded-xl overflow-hidden border border-white/10 bg-white/[0.03] hover:border-[#f5c518]/60 hover:shadow-lg transition active:scale-95">
              {p ? <img src={p} alt="" className="w-full aspect-[2/3] object-cover" /> : <div className="w-full aspect-[2/3] bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center text-4xl">🎬</div>}
              <div className="p-2">
                <div className="bb-title text-xs sm:text-sm text-white truncate">{m.title}</div>
                <div className="flex items-center gap-1.5 text-[10px] text-white/50">
                  <span>{m.release_date?.slice(0, 4) || 'N/A'}</span>
                  <span>•</span><span>★ {(m.vote_average || 0).toFixed(1)}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {selected && (
        <div className="mt-4 rounded-xl border border-white/10 bg-black/60 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {posterUrl(selected.poster_path, 'w500') && <img src={posterUrl(selected.poster_path, 'w500')!} alt="" className="w-32 rounded-lg ring-2 ring-white/20 shrink-0 mx-auto sm:mx-0" />}
            <div className="flex-1 min-w-0">
              <div className="bb-title text-2xl text-white">{selected.title}</div>
              <div className="text-xs text-white/50 mt-1">{selected.release_date} • ★ {(selected.vote_average || 0).toFixed(1)} • {selected.runtime || '?'} min</div>
              <p className="mt-2 text-sm text-white/80">{selected.overview || 'Nessuna descrizione disponibile.'}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {trailerUrl && (
                  <button onClick={() => setShowTrailer(true)} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-black text-white">▶ TRAILER</button>
                )}
                <button
                  onClick={() => {
                    const local = FILMS.find((x) => x.tmdbId === selected.id || x.t.toLowerCase() === selected.title.toLowerCase());
                    if (local) {
                      useGame.getState().toggleSerata(local.id);
                      flash(`"${local.t}" aggiunto alla serata 🍿`);
                    } else {
                      flash('Questo titolo non è a scaffale: cerca uno simile nel catalogo 🔎');
                    }
                  }}
                  className="bb-chip rounded-lg px-3 py-2 text-sm text-white/70"
                >
                  🍿 AGGIUNGI ALLA SERATA
                </button>
                {(() => {
                  const local = FILMS.find((x) => x.tmdbId === selected.id || x.t.toLowerCase() === selected.title.toLowerCase());
                  if (!local) return null;
                  return (
                    <>
                      <button onClick={() => goTo(local.id)} className="rounded-lg bg-[#39e6a0] px-3 py-2 text-sm font-black text-black">📍 SCAFFALE</button>
                      <button onClick={() => goToCinema(local.id)} className="rounded-lg bg-[#e5452f] px-3 py-2 text-sm font-black text-white">🎬 SALA 1</button>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}
      {showTrailer && trailerUrl && <TrailerModal embedUrl={trailerUrl} onClose={() => setShowTrailer(false)} />}
    </Shell>
  );
}

function ApiKeyInline({ onSaved }: { onSaved: () => void }) {
  const [k, setK] = useState(getApiKey());
  return (
    <div className="flex gap-2 max-w-md mx-auto">
      <input value={k} onChange={(e) => setK(e.target.value)} placeholder="TMDB API Key..." className="flex-1 rounded-lg bg-black/60 border border-white/20 px-3 py-2 text-sm text-white outline-none focus:border-blue-400" />
      <button onClick={() => { saveApiKey(k); onSaved(); flash('Key salvata! ✅'); }} className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-bold text-white">SALVA</button>
    </div>
  );
}
void ApiKeyInline;

/* ═══════════════════════════════════════════════════════════ */
/* CLAUDIO IL COMMESSO                                           */
/* ═══════════════════════════════════════════════════════════ */
export function ClaudioPanel() {
  const setPanel = useGame((s) => s.setPanel);
  const [talk, setTalk] = useState('Ciao! Benvenuta da Moodbuster Video! Ora abbiamo anche 25+ film INTERI gratis in Sala 1!');
  const jokes = [
    'Regola n.1: chi non riavvolge la cassetta paga 2000 lire di penale!',
    'Cerchi qualcosa per stasera? Se vuoi piangere, "Hachiko" + due pacchi di fazzoletti.',
    'Se il tuo ragazzo vuole "Trappola di Cristallo" a Natale... ha ragione.',
    'La Sala 1 è in fondo a destra: poltroncine in velluto e maxischermo!',
    'Il MOOD-O-MATIC ha salvato più coppie di uno psicologo matrimoniale.',
    'Novità: nel menu CINEMA GRATIS trovi film INTERI legali da canali ufficiali!',
    'Nosferatu (1922), Metropolis (1927), Il Monello di Chaplin... sono TUTTI gratis!',
  ];
  return (
    <Shell title="🧑‍💼 CLAUDIO — COMMESSO DEL MESE" sub="Esperto cinefilo Blockbuster dal 1996" onClose={() => setPanel(null)}>
      <div className="flex flex-col sm:flex-row gap-4 items-center bg-black/50 p-4 rounded-xl border border-emerald-500/30">
        <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-blue-700 to-indigo-900 flex items-center justify-center text-5xl shadow-xl border-2 border-yellow-400">🧑‍💼</div>
        <div className="flex-1"><div className="text-xs uppercase tracking-wider text-yellow-400 font-bold">Claudio dice:</div><p className="mt-1 text-sm leading-relaxed text-white italic">&ldquo;{talk}&rdquo;</p></div>
      </div>
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2">
        <button onClick={() => { setPanel('freecinema'); }} className="rounded-xl border border-red-500/50 bg-red-500/10 p-3 text-left hover:bg-red-500/20"><div className="font-bold text-red-400 text-sm">📺 Film INTERI gratis</div><div className="text-[11px] text-white/60">25+ film legali da vedere subito</div></button>
        <button onClick={() => { const f = FILMS[Math.floor(Math.random() * FILMS.length)]; setTalk(`Ti consiglio "${f.t}" (${f.y})! Reparto ${MOOD_BY_ID[f.mood].nome}. ${f.s}`); audio.blip(650); }} className="rounded-xl border border-yellow-400/50 bg-yellow-400/10 p-3 text-left hover:bg-yellow-400/20"><div className="font-bold text-yellow-300 text-sm">💡 Consigliami un film</div></button>
        <button onClick={() => { setPanel('mood'); }} className="rounded-xl border border-purple-500/50 bg-purple-500/10 p-3 text-left hover:bg-purple-500/20"><div className="font-bold text-purple-300 text-sm">🎰 MOOD-O-MATIC</div></button>
        <button onClick={() => goToCinema()} className="rounded-xl border border-blue-500/50 bg-blue-500/10 p-3 text-left hover:bg-blue-500/20"><div className="font-bold text-blue-400 text-sm">🚶 Dov&apos;è la Sala Cinema?</div></button>
        <button onClick={() => setTalk(jokes[Math.floor(Math.random() * jokes.length)])} className="rounded-xl border border-emerald-500/50 bg-emerald-500/10 p-3 text-left hover:bg-emerald-500/20"><div className="font-bold text-emerald-300 text-sm">🗣️ Aneddoto vintage</div></button>
      </div>
    </Shell>
  );
}

/* ═══════════════════════════════════════════════════════════ */
/* QUIZ COPPIA                                                  */
/* ═══════════════════════════════════════════════════════════ */
export function QuizPanel() {
  const setPanel = useGame((s) => s.setPanel);
  const [step, setStep] = useState(1);
  const [who, setWho] = useState<'io' | 'lui' | 'compromesso'>('compromesso');
  const [energy, setEnergy] = useState<'zero' | 'media' | 'capolavoro'>('media');
  const [winner, setWinner] = useState<Film | null>(null);
  const calc = () => {
    const moods: MoodId[] = who === 'lui' ? ['adrenalina', 'epico', 'ridere'] : who === 'io' ? ['cuore', 'piangere', 'comfort'] : energy === 'zero' ? ['comfort', 'ridere'] : energy === 'capolavoro' ? ['cervello', 'epico', 'drammatico'] : ['adrenalina', 'cuore', 'comfort'];
    const pool = FILMS.filter((f) => moods.includes(f.mood));
    setWinner(pool.sort(() => Math.random() - 0.5)[0] || FILMS[0]); setStep(4); audio.fanfare();
  };
  return (
    <Shell title="❤️ QUIZ DI COPPIA" sub="3 domande per non litigare su cosa guardare" onClose={() => setPanel(null)}>
      {step === 1 && (<div className="space-y-4"><div className="text-sm font-semibold text-white/90">Chi comanda stasera?</div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">{[ ['io', '👑 Scelgo Io'], ['lui', '🎮 Sceglie Lui/Lei'], ['compromesso', '🤝 Compromesso'] ].map(([id, t]) => (
          <button key={id} onClick={() => setWho(id as typeof who)} className={`rounded-xl border-2 p-4 text-left ${who === id ? 'border-[#f5c518] bg-[#f5c518]/20' : 'border-white/10 bg-white/5'}`}><div className="font-bold text-white">{t}</div></button>))}</div>
        <button onClick={() => setStep(2)} className="w-full rounded-xl bg-[#f5c518] py-3 font-black text-black">AVANTI ▸</button></div>)}
      {step === 2 && (<div className="space-y-4"><div className="text-sm font-semibold text-white/90">Quanto siete stanchi?</div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">{[ ['zero', '🧠 Zero'], ['media', '🍿 Medio'], ['capolavoro', '🏆 Capolavoro'] ].map(([id, t]) => (
          <button key={id} onClick={() => setEnergy(id as typeof energy)} className={`rounded-xl border-2 p-4 text-left ${energy === id ? 'border-[#f5c518] bg-[#f5c518]/20' : 'border-white/10 bg-white/5'}`}><div className="font-bold text-white">{t}</div></button>))}</div>
        <div className="flex gap-2"><button onClick={() => setStep(1)} className="bb-chip rounded-xl px-4 py-3 text-white/70">◂</button>
          <button onClick={calc} className="flex-1 rounded-xl bg-gradient-to-r from-emerald-400 to-[#39e6a0] py-3 font-black text-black shadow">🔮 TROVA IL FILM PERFETTO</button></div></div>)}
      {step === 4 && winner && (<div className="space-y-4">
        <div className="rounded-xl border-2 border-[#39e6a0] bg-emerald-950/30 p-4 text-center">
          <div className="text-xs uppercase tracking-widest text-[#39e6a0] font-bold">Verdetto della Serata</div>
          <div className="bb-title text-3xl text-white mt-1">{winner.t.toUpperCase()}</div>
          <div className="mt-1 flex justify-center gap-2 text-xs text-white/70"><Pill color={MOOD_BY_ID[winner.mood].colore}>{MOOD_BY_ID[winner.mood].emoji} {MOOD_BY_ID[winner.mood].nome}</Pill><span>{winner.y} • {dur(winner.d)} • ★ {winner.r.toFixed(1)}</span></div></div>
        <div className="flex flex-col sm:flex-row gap-3 items-center bg-black/40 p-3 rounded-xl"><img src={bigThumb(winner)} alt="" className="w-24 rounded-lg ring-2 ring-white/20" /><div className="flex-1 text-sm text-white/80"><p>{winner.s}</p><div className="mt-2 text-xs text-yellow-300">🍿 Combo: {winner.snack} + {winner.drink}</div></div></div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => goTo(winner.id)} className="flex-1 rounded-xl bg-[#39e6a0] py-3 text-sm font-black text-black">📍 SCAFFALE</button>
          <button onClick={() => goToCinema(winner.id)} className="flex-1 rounded-xl bg-[#e5452f] py-3 text-sm font-black text-white">🎬 SALA 1</button>
          <button onClick={() => { useGame.getState().toggleSerata(winner.id); flash(`"${winner.t}" nel cestino 🍿`); }} className="rounded-xl bg-[#f5c518] px-4 py-3 text-sm font-black text-black">🍿 SERATA</button>
          <button onClick={() => setStep(1)} className="bb-chip rounded-xl px-4 py-3 text-sm text-white/70">🔄</button></div></div>)}
    </Shell>
  );
}

/* ═══════════════════════════════════════════════════════════ */
/* SEARCH                                                        */
/* ═══════════════════════════════════════════════════════════ */
export function SearchPanel() {
  const setPanel = useGame((s) => s.setPanel);
  const setOpenFilm = useGame((s) => s.setOpenFilm);
  const [q, setQ] = useState('');
  const [mood, setMood] = useState<MoodId | null>(useGame.getState().moodFilter);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { inputRef.current?.focus(); }, []);
  const res = useMemo(() => {
    const t = q.trim().toLowerCase();
    return FILMS.filter((f) => (mood ? f.mood === mood : true)).filter((f) => !t || f.t.toLowerCase().includes(t) || f.s.toLowerCase().includes(t) || String(f.y).includes(t) || f.quote?.toLowerCase().includes(t));
  }, [q, mood]);
  return (
    <Shell title="CERCA IN CATALOGO" sub={`${res.length} titoli · ${FILMS.length} film a scaffale`} onClose={() => setPanel(null)} wide>
      <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Titolo, anno, citazione, trama..." className="w-full rounded-xl border border-white/15 bg-black/60 px-4 py-3 text-base text-white outline-none focus:border-[#f5c518]" />
      <div className="mt-3 flex flex-wrap gap-1.5">
        <button onClick={() => setMood(null)} className={`rounded-full px-3 py-1 text-[11px] font-bold ${!mood ? 'bg-white text-black' : 'bb-chip text-white/70'}`}>TUTTI</button>
        {MOODS.map((m) => (<button key={m.id} onClick={() => setMood(mood === m.id ? null : m.id)} className="rounded-full px-3 py-1 text-[11px] font-bold" style={mood === m.id ? { background: m.colore, color: '#000' } : { background: m.colore + '22', color: m.colore }}>{m.emoji} {m.nome}</button>))}
      </div>
      <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {res.map((f) => <FilmCard key={f.id} film={f} onOpen={() => { setPanel(null); setOpenFilm(f.id); }} />)}
        {!res.length && <p className="col-span-2 py-10 text-center text-sm text-white/40">Nessun risultato.</p>}
      </div>
    </Shell>
  );
}

/* ═══════════════════════════════════════════════════════════ */
/* FILM DETAIL MODAL                                             */
/* ═══════════════════════════════════════════════════════════ */
export function FilmModal() {
  const id = useGame((s) => s.openFilm);
  const serata = useGame((s) => s.serata);
  const held = useGame((s) => s.held);
  const setOpenFilm = useGame((s) => s.setOpenFilm);
  const [trailerEmbed, setTrailerEmbed] = useState<string | null>(null);
  if (!id) return null;
  const f = FILM_BY_ID[id];
  if (!f) return null;
  const m = MOOD_BY_ID[f.mood];
  const inList = serata.includes(f.id);
  const simili = FILMS.filter((x) => x.mood === f.mood && x.id !== f.id).slice(0, 5);
  return (
    <Shell title={f.t.toUpperCase()} sub={`${f.y} · ${dur(f.d)} · ${f.fmt}`} onClose={() => setOpenFilm(null)} wide>
      {trailerEmbed && <TrailerModal embedUrl={trailerEmbed} onClose={() => setTrailerEmbed(null)} />}
      <InlineTrailer film={f} />
      <div className="flex flex-col gap-5 sm:flex-row">
        <div className="mx-auto shrink-0 w-44 sm:w-48">
          <ModalPoster tmdbId={f.tmdbId} fallback={bigThumb(f)} />
          <div className="mt-3 rounded-lg border border-white/15 bg-black/50 px-3 py-2 text-center"><div className="text-[10px] tracking-widest text-white/50">NOLEGGIO</div><div className="bb-title text-2xl text-[#f5c518]">€ {prezzo(f).toFixed(2)}</div></div>
          <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(f.t + ' ' + f.y + ' trailer italiano')}`} target="_blank" rel="noopener noreferrer" className="mt-2 flex items-center justify-center gap-1.5 w-full rounded-lg bg-red-600/90 py-2 text-xs font-bold text-white hover:bg-red-500 shadow">▶ Apri su YouTube</a>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full px-3 py-1 text-[11px] font-black text-black" style={{ background: m.colore }}>{m.emoji} {m.nome}</span>
            <Pill color="#ffd84a">★ {f.r.toFixed(1)}/10</Pill><Pill color="#9fd0ff">{dur(f.d)}</Pill><Pill color="#39e6a0">{f.y}</Pill>
          </div>
          {f.quote && <div className="mt-3 border-l-4 border-[#f5c518] pl-3 py-1 italic text-yellow-200/90 text-sm">&ldquo;{f.quote}&rdquo;</div>}
          <p className="mt-3 text-[14px] leading-relaxed text-white/85">{f.s}</p>
          <div className="mt-2 text-xs text-emerald-300">🍿 {f.snack} + {f.drink}</div>
          <div className="mt-3 rounded-lg bg-white/5 border border-white/10 p-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-white/50 mb-1">Streaming in Italia:</div>
            <div className="flex flex-wrap gap-1.5">{(f.platforms || []).map((p) => <span key={p} className="rounded-md bg-blue-900/60 border border-blue-400/40 px-2 py-0.5 text-[11px] font-semibold text-blue-200">📺 {p}</span>)}</div>
          </div>
          <TmdbInfoBlock film={f} />
          <div className="mt-4 flex flex-wrap gap-2">
            <button onClick={() => { useGame.getState().toggleSerata(f.id); flash(inList ? `"${f.t}" rimosso` : `"${f.t}" aggiunto 🍿`); }} className={`rounded-lg px-4 py-2.5 text-sm font-black ${inList ? 'bg-white/20 text-white' : 'bg-[#f5c518] text-black'}`}>{inList ? '✓ RIMUOVI DA SERATA' : '🍿 SERATA'}</button>
            <button onClick={() => goToCinema(f.id)} className="rounded-lg bg-[#e5452f] px-4 py-2.5 text-sm font-black text-white">🎬 SALA 1</button>
            <button onClick={() => goTo(f.id)} className="rounded-lg bg-[#39e6a0] px-4 py-2.5 text-sm font-black text-black">📍 SCAFFALE</button>
          </div>
          {held && (
            <button
              onClick={() => useGame.getState().dropHeld()}
              className="mt-3 w-full rounded-lg border border-red-400/50 bg-red-500/15 px-4 py-2.5 text-sm font-black text-red-300 hover:bg-red-500/25"
            >
              📼 RIMETTI &ldquo;{FILM_BY_ID[held].t.toUpperCase()}&rdquo; AL SUO POSTO (X)
            </button>
          )}
          <div className="mt-5 border-t border-white/10 pt-3"><div className="mb-2 text-[10px] tracking-[0.2em] text-white/40">STESSO REPARTO</div><div className="flex gap-2.5 overflow-x-auto pb-1">{simili.map((s) => <button key={s.id} onClick={() => { audio.vhsClick(); setOpenFilm(s.id); }} className="group w-16 shrink-0 text-left hover:scale-105"><FilmCover tmdbId={s.tmdbId} fallback={thumb(s)} className="w-16 rounded ring-1 ring-white/20 group-hover:ring-[#f5c518]" /><div className="mt-1 truncate text-[9px] text-white/60">{s.t}</div></button>)}</div></div>
        </div>
      </div>
    </Shell>
  );
}

/* ═══════════════════════════════════════════════════════════ */
/* SERATA / SCONTRINO                                            */
/* ═══════════════════════════════════════════════════════════ */
export function SerataPanel() {
  const serata = useGame((s) => s.serata);
  const setPanel = useGame((s) => s.setPanel);
  const films = serata.map((id) => FILM_BY_ID[id]).filter(Boolean);
  const tot = films.reduce((a, f) => a + f.d, 0);
  const cost = films.reduce((a, f) => a + prezzo(f), 0);
  const end = new Date(Date.now() + (tot + films.length * 8) * 60000);
  const copyWA = () => {
    const list = films.map((f, i) => `${i + 1}. *${f.t}* (${f.y}) - ${dur(f.d)}`).join('\n');
    navigator.clipboard.writeText(`🍿 *MOODBUSTER SERATA* 🎬\n\n${list}\n\n⏱️ ${dur(tot)}\nTi aspetto sul divano! ❤️`);
    flash('Copiato! Incolla su WhatsApp 📲');
  };
  return (
    <Shell title="LA MIA SERATA 🍿" sub="Scontrino di noleggio" onClose={() => setPanel(null)}>
      {!films.length ? (
        <div className="py-10 text-center text-sm text-white/50"><div className="text-4xl mb-3">🍿</div><p>Nessun film nel cestino. Cammina tra gli scaffali, premi <b className="text-white">E</b> o prova il <b className="text-[#f5c518]">MOOD-O-MATIC</b>!</p></div>
      ) : (<>
        <div className="space-y-2 max-h-56 overflow-y-auto no-scrollbar">
          {films.map((f, i) => (<div key={f.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-2">
            <span className="bb-title w-6 text-center text-xl text-yellow-400/50">{i + 1}</span><img src={thumb(f)} alt="" className="h-14 w-10 rounded object-cover ring-1 ring-white/20" />
            <div className="min-w-0 flex-1"><div className="bb-title truncate text-base text-white">{f.t.toUpperCase()}</div><div className="text-[10px] text-white/50">{MOOD_BY_ID[f.mood].emoji} {f.y} · {dur(f.d)} · € {prezzo(f).toFixed(2)}</div></div>
            <button onClick={() => useGame.getState().toggleSerata(f.id)} className="rounded bg-white/10 px-2 py-1 text-[11px] text-white/70 hover:bg-red-500/40">✕</button>
          </div>))}
        </div>
        <div className="mt-4 rounded-xl border-2 border-dashed border-[#f5c518]/60 bg-[#0d101a] p-4 font-mono text-[12px] text-[#ffe08a]">
          <div className="text-center font-bold text-xs uppercase tracking-widest text-[#f5c518] mb-2 border-b border-[#f5c518]/30 pb-1">MOODBUSTER VIDEO — SCONTRINO</div>
          <div className="flex justify-between"><span>TITOLI</span><span>{films.length}</span></div>
          <div className="flex justify-between"><span>DURATA</span><span>{dur(tot)}</span></div>
          <div className="flex justify-between"><span>PAUSE POPCORN</span><span>{films.length * 8} min</span></div>
          <div className="mt-2 flex justify-between border-t border-[#f5c518]/30 pt-2 text-base font-bold text-white"><span>TOTALE</span><span>€ {cost.toFixed(2)}</span></div>
          <div className="mt-1 text-[11px] text-white/60">Fine prevista: {end.getHours().toString().padStart(2, '0')}:{end.getMinutes().toString().padStart(2, '0')}</div>
          <div className="mt-2 text-center tracking-[0.3em] text-lg opacity-50">||||||| | ||||| ||| ||||||</div>
        </div>
        <div className="mt-4 flex flex-col sm:flex-row gap-2">
          <button onClick={copyWA} className="flex-1 rounded-xl bg-[#25D366] px-4 py-3 text-sm font-black text-black flex items-center justify-center gap-2 shadow">📲 WHATSAPP</button>
          <button onClick={() => { flash('Noleggio confermato! 🍿'); setPanel(null); }} className="flex-1 rounded-xl bg-[#f5c518] px-4 py-3 text-sm font-black text-black shadow">CONFERMA</button>
          <button onClick={() => useGame.getState().clearSerata()} className="bb-chip rounded-xl px-4 py-3 text-sm text-white/70">SVUOTA</button>
        </div>
      </>)}
    </Shell>
  );
}

/* ═══════════════════════════════════════════════════════════ */
/* CUSTOM FILM                                                   */
/* ═══════════════════════════════════════════════════════════ */
export function CustomFilmPanel() {
  const setPanel = useGame((s) => s.setPanel);
  const [t, setT] = useState(''); const [y, setY] = useState(2020); const [d, setD] = useState(110); const [r, setR] = useState(8.0);
  const [mood, setMood] = useState<MoodId>('comfort'); const [s, setS] = useState(''); const [quote, setQuote] = useState(''); const [snack, setSnack] = useState('Popcorn');
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); if (!t.trim() || !s.trim()) { flash('Compila titolo e trama!'); return; }
    const c1 = MOOD_BY_ID[mood].colore; const c2 = MOOD_BY_ID[mood].colore2;
    const created = saveCustomFilm({ t: t.trim(), y: +y || 2020, d: +d || 100, r: +r || 8, mood, s: s.trim(), c: [c1, c2], quote: quote.trim() || 'Un classico!', platforms: [], snack: snack || 'Popcorn', drink: 'Bibita' });
    flash(`"${created.t}" aggiunto al catalogo! 🎬`); setPanel(null); useGame.getState().setOpenFilm(created.id);
  };
  return (
    <Shell title="➕ AGGIUNGI IL TUO FILM" sub="Nuova cassetta nel catalogo" onClose={() => setPanel(null)}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div><label className="text-xs text-white/70 font-bold block mb-1">Titolo *</label><input value={t} onChange={(e) => setT(e.target.value)} required placeholder="Interstellar, Shrek..." className="w-full rounded-xl border border-white/20 bg-black/60 px-3.5 py-2 text-sm text-white outline-none focus:border-[#f5c518]" /></div>
        <div className="grid grid-cols-3 gap-2">
          <div><label className="text-xs text-white/70 font-bold block mb-1">Anno</label><input type="number" value={y} onChange={(e) => setY(+e.target.value)} className="w-full rounded-xl border border-white/20 bg-black/60 px-3 py-2 text-sm text-white" /></div>
          <div><label className="text-xs text-white/70 font-bold block mb-1">Min</label><input type="number" value={d} onChange={(e) => setD(+e.target.value)} className="w-full rounded-xl border border-white/20 bg-black/60 px-3 py-2 text-sm text-white" /></div>
          <div><label className="text-xs text-white/70 font-bold block mb-1">Voto</label><input type="number" step="0.1" value={r} onChange={(e) => setR(+e.target.value)} className="w-full rounded-xl border border-white/20 bg-black/60 px-3 py-2 text-sm text-white" /></div>
        </div>
        <div><label className="text-xs text-white/70 font-bold block mb-1">Mood *</label><div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">{MOODS.map((m) => <button type="button" key={m.id} onClick={() => setMood(m.id)} className={`rounded-lg p-1.5 text-[10px] font-bold text-left ${mood === m.id ? 'ring-2 ring-white text-black' : 'text-white opacity-70'}`} style={{ background: m.colore }}>{m.emoji} {m.nome}</button>)}</div></div>
        <div><label className="text-xs text-white/70 font-bold block mb-1">Trama *</label><textarea value={s} onChange={(e) => setS(e.target.value)} rows={2} required className="w-full rounded-xl border border-white/20 bg-black/60 px-3.5 py-2 text-sm text-white" /></div>
        <div className="grid grid-cols-2 gap-2">
          <div><label className="text-xs text-white/70 font-bold block mb-1">Citazione</label><input value={quote} onChange={(e) => setQuote(e.target.value)} className="w-full rounded-xl border border-white/20 bg-black/60 px-3 py-2 text-sm text-white" /></div>
          <div><label className="text-xs text-white/70 font-bold block mb-1">Snack</label><input value={snack} onChange={(e) => setSnack(e.target.value)} className="w-full rounded-xl border border-white/20 bg-black/60 px-3 py-2 text-sm text-white" /></div>
        </div>
        <button type="submit" className="w-full rounded-xl bg-[#39e6a0] py-3 text-base font-black text-black shadow">SALVA A CATALOGO 📼</button>
      </form>
    </Shell>
  );
}

/* ═══════════════════════════════════════════════════════════ */
/* HELP                                                          */
/* ═══════════════════════════════════════════════════════════ */
export function HelpPanel() {
  const setPanel = useGame((s) => s.setPanel);
  const rows: [string, string][] = [['↑↓ WS', 'cammina'], ['←→', 'gira'], ['A/D', 'strafe'], ['Spazio', 'salta Roblox'], ['Mouse', 'guardati intorno'], ['Shift', 'corri'], ['E/Enter', 'interagisci'], ['V', '1ª/3ª persona'], ['L', 'torcia'], ['F', 'cerca'], ['M', 'MOOD-O-MATIC'], ['B', 'serata'], ['Esc', 'chiudi menu']];
  return (
    <Shell title="GUIDA COMANDI" sub="Come navigare nella videoteca 3D" onClose={() => setPanel(null)}>
      <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">{rows.map(([k, v]) => <div key={k} className="flex items-center gap-3 rounded-lg bg-white/[0.04] px-3 py-2"><kbd className="bb-title min-w-16 rounded bg-[#f5c518] px-2 py-0.5 text-center text-sm text-black">{k}</kbd><span className="text-[12px] text-white/80">{v}</span></div>)}</div>
      <div className="mt-4 rounded-xl bg-blue-950/40 border border-blue-500/30 p-3 text-xs text-blue-200">💡 La <b>Sala 1</b> è in fondo a destra: prendi una cassetta e proietta il trailer sul maxischermo!</div>
    </Shell>
  );
}