import { useEffect, useMemo, useState } from 'react';
import { FILM_BY_ID, FILMS, MOOD_BY_ID } from '../data/films';
import { getArchiveEmbedUrl, getYouTubeEmbedUrl, resolveYouTubeEmbedUrl } from '../data/freeMovies';
import { useGame, flash } from '../lib/state';
import { audio } from '../lib/audio';
import { fetchMovieDetail, getTrailerEmbedUrl } from '../lib/tmdb';

type Projected =
  | { kind: 'archive'; archiveId: string; title: string }
  | { kind: 'youtube'; videoId: string; title: string }
  | null;

/** Interpreta il seatFilmId: `ia_<id>` = Archive, `yt_<id>` = YouTube playlist, altro = film catalogo. */
function readProjected(seatFilmId: string | null): Projected {
  if (!seatFilmId) return null;
  if (seatFilmId.startsWith('ia_')) {
    const archiveId = seatFilmId.slice(3);
    let title = archiveId.replace(/[_-]/g, ' ');
    try {
      const map = JSON.parse(localStorage.getItem('moodbuster_free_films') || '{}');
      const entry = map[seatFilmId];
      if (entry?.title) title = entry.title;
    } catch { /* ignore */ }
    return { kind: 'archive', archiveId, title };
  }
  if (seatFilmId.startsWith('yt_')) {
    const videoId = seatFilmId.slice(3);
    let title = 'Proiezione';
    try {
      const map = JSON.parse(localStorage.getItem('moodbuster_free_films') || '{}');
      const entry = map[seatFilmId];
      if (entry?.title) title = entry.title;
    } catch { /* ignore */ }
    return { kind: 'youtube', videoId, title };
  }
  return null;
}

export function CinemaOverlay() {
  const seatedSeatId = useGame((s) => s.seatedSeatId);
  const seatFilmId = useGame((s) => s.seatFilmId);
  const setSeatedSeatId = useGame((s) => s.setSeatedSeatId);
  const setSeatFilmId = useGame((s) => s.setSeatFilmId);
  const setPanel = useGame((s) => s.setPanel);

  const [embedUrl, setEmbedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [lightsOff, setLightsOff] = useState(true);
  const [mode, setMode] = useState<'archive' | 'youtube' | 'trailer' | 'none'>('none');

  const projected = useMemo(() => readProjected(seatFilmId), [seatFilmId]);
  const catalogFilm = useMemo(
    () => (seatFilmId && !seatFilmId.startsWith('ia_') && !seatFilmId.startsWith('yt_') ? FILM_BY_ID[seatFilmId] || null : null),
    [seatFilmId],
  );

  const displayTitle = projected?.title || catalogFilm?.t || 'SALA 1';
  const displayMood = catalogFilm?.mood;

  useEffect(() => {
    if (projected?.kind === 'archive') {
      setEmbedUrl(getArchiveEmbedUrl(projected.archiveId, true));
      setMode('archive');
      setLoading(false);
      return;
    }
  if (projected?.kind === 'youtube') {
    const directUrl = resolveYouTubeEmbedUrl(seatFilmId);
    if (directUrl) {
      setEmbedUrl(directUrl);
      setMode('youtube');
      setLoading(false);
      return;
    }
    setEmbedUrl(getYouTubeEmbedUrl(projected.videoId, true));
    setMode('youtube');
    setLoading(false);
    return;
  }
    if (!catalogFilm?.tmdbId) {
      setEmbedUrl(null);
      setMode('none');
      return;
    }
    let alive = true;
    setLoading(true);
    setMode('trailer');
    fetchMovieDetail(catalogFilm.tmdbId)
      .then((d) => {
        if (!alive) return;
        setEmbedUrl(getTrailerEmbedUrl(d.videos?.results));
        setLoading(false);
      })
      .catch(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [projected, catalogFilm?.tmdbId]);

  if (!seatedSeatId) return null;

  const label =
    mode === 'archive'
      ? 'FILM INTERO · INTERNET ARCHIVE'
      : mode === 'youtube'
        ? 'IN PROIEZIONE · YOUTUBE'
        : mode === 'trailer'
          ? 'TRAILER UFFICIALE'
          : 'SALA 1';

  return (
    <div className="pointer-events-auto absolute inset-0 z-40 flex select-none flex-col items-center justify-between p-2 sm:p-3" onPointerDown={(e) => e.stopPropagation()}>
      <div className="pointer-events-none absolute inset-0 bg-black transition-opacity duration-[900ms]" style={{ opacity: lightsOff ? 0.93 : 0.45 }} />
      <div className="pointer-events-none absolute inset-0 opacity-60" style={{ background: 'radial-gradient(ellipse at 50% 42%, rgba(120,170,255,0.18), transparent 62%)' }} />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 top-1/2 bg-gradient-to-t from-black via-black/45 to-transparent" />

      <div className="relative z-10 flex w-full max-w-5xl items-center justify-between rounded-xl border border-white/10 bg-black/70 px-3 sm:px-4 py-2.5 shadow-2xl backdrop-blur">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-600" />
          </span>
          <div className="min-w-0">
            <div className="text-[9px] font-black uppercase tracking-[0.2em] text-red-400">{label}</div>
            <div className="bb-title max-w-[180px] truncate text-base leading-tight text-white sm:max-w-md sm:text-lg">
              {displayTitle.toUpperCase()}
            </div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            onClick={() => setLightsOff(!lightsOff)}
            className={`rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition active:scale-95 ${lightsOff ? 'bg-zinc-800 text-amber-300' : 'bg-amber-400 text-black'}`}
          >
            💡
          </button>
          <button
            onClick={() => setSeatedSeatId(null)}
            className="rounded-lg bg-red-600 px-3 py-1.5 text-[11px] font-black text-white transition hover:bg-red-500 active:scale-95"
          >
            🚶 ALZATI
          </button>
        </div>
      </div>

      <div className="relative z-10 my-auto w-full max-w-5xl overflow-hidden rounded-xl border-4 border-zinc-900 bg-black shadow-[0_0_80px_rgba(90,140,255,0.15)]">
        <div className="absolute inset-x-0 top-0 z-10 h-px bg-gradient-to-r from-transparent via-rose-500/70 to-transparent" />
        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
          {embedUrl ? (
            <iframe
              key={embedUrl}
              src={embedUrl}
              title="Maxischermo Sala 1"
              className="absolute inset-0 h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-zinc-950 to-neutral-900 p-4 text-center">
              <div className="text-5xl">{loading ? '⏳' : '🎬'}</div>
              <h3 className="bb-title text-xl text-amber-400">
                {loading ? 'CARICAMENTO…' : 'SCEGLI COSA PROIETTARE'}
              </h3>
              <p className="max-w-md text-xs text-white/55">
                Apri <b className="text-rose-400">CINEMA GRATIS</b> per film interi di pubblico dominio
                e cartoni animati, oppure incolla un link YouTube.
              </p>
              {!loading && (
                <button
                  onClick={() => { setSeatedSeatId(null); setTimeout(() => setPanel('freecinema'), 80); }}
                  className="rounded-xl bg-gradient-to-r from-red-600 to-rose-600 px-5 py-2.5 text-sm font-black text-white shadow-xl"
                >
                  📺 APRI CINEMA GRATIS
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="relative z-10 flex w-full max-w-5xl flex-col items-stretch justify-between gap-2.5 rounded-xl border border-white/10 bg-black/70 p-2.5 shadow-2xl backdrop-blur sm:flex-row sm:items-center">
        <div className="flex min-w-0 items-center gap-1.5">
          <select
            value={seatFilmId && !seatFilmId.startsWith('ia_') && !seatFilmId.startsWith('yt_') ? seatFilmId : ''}
            onChange={(e) => { audio.vhsClick(); setSeatFilmId(e.target.value); }}
            className="min-w-0 max-w-[190px] flex-1 rounded-lg border border-white/15 bg-zinc-900 px-2 py-1.5 text-xs text-white outline-none focus:border-rose-500"
          >
            <option value="">— Trailer dal catalogo —</option>
            {FILMS.slice(0, 50).map((f) => (
              <option key={f.id} value={f.id}>{MOOD_BY_ID[f.mood].emoji} {f.t} ({f.y})</option>
            ))}
          </select>
          <button
            onClick={() => { setSeatedSeatId(null); setTimeout(() => setPanel('freecinema'), 80); }}
            className="shrink-0 rounded-lg bg-gradient-to-r from-red-600 to-rose-600 px-2.5 py-1.5 text-[10px] font-black text-white shadow"
          >
            📺 GRATIS
          </button>
        </div>

        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => { audio.chewPopcorn(); flash('Crunch crunch… popcorn caldi! 🍿'); }}
            className="rounded-xl border border-white/10 bg-zinc-900 px-3.5 py-2 text-xs font-bold text-white shadow transition hover:border-amber-400 active:scale-95"
          >
            🍿 POPCORN
          </button>
          <button
            onClick={() => { audio.sipSoda(); flash('Slurp… che dissetante! 🥤'); }}
            className="rounded-xl border border-white/10 bg-zinc-900 px-3.5 py-2 text-xs font-bold text-white shadow transition hover:border-sky-400 active:scale-95"
          >
            🥤 SODA
          </button>
          {displayMood && (
            <span className="hidden rounded-full px-2.5 py-1 text-[10px] font-black text-black lg:inline" style={{ background: MOOD_BY_ID[displayMood].colore }}>
              {MOOD_BY_ID[displayMood].emoji}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default CinemaOverlay;
