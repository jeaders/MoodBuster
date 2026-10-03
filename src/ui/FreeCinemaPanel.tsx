import { useMemo, useState, useEffect } from 'react';
import {
  FREE_MOVIES,
  FREE_CARTOONS,
  FREE_CHANNELS,
  getArchiveEmbedUrl,
  getArchivePageUrl,
  getYouTubeEmbedUrl,
  getYouTubeSearchUrl,
  getChannelUrl,
  extractVideoId,
  resolveYouTubeEmbedUrl,
  type FreeTitle,
} from '../data/freeMovies';
import { MOOD_BY_ID } from '../data/films';
import { CENTER_SEAT_ID } from '../lib/layout';
import { useGame, flash } from '../lib/state';
import { audio } from '../lib/audio';

type Tab = 'film' | 'cartoni' | 'canali' | 'link' | 'yt-film' | 'yt-cartoon';

export function FreeCinemaPanel() {
  const setPanel = useGame((s) => s.setPanel);
  const setSeatFilmId = useGame((s) => s.setSeatFilmId);
  const setSeatedSeatId = useGame((s) => s.setSeatedSeatId);

  const [tab, setTab] = useState<Tab>('film');
  const [selected, setSelected] = useState<FreeTitle | null>(null);
  const [q, setQ] = useState('');
  const [ytFilmLoading, setYtFilmLoading] = useState(false);
  const [ytCartoonLoading, setYtCartoonLoading] = useState(false);
  const [ytFilms, setYtFilms] = useState<FreeTitle[]>([]);
  const [ytCartoons, setYtCartoons] = useState<FreeTitle[]>([]);

  useEffect(() => {
    if (tab === 'yt-film' && !ytFilmLoading && !ytFilms.length) {
      setYtFilmLoading(true);
      import('../data/freeMovies').then((m) => m.getYouTubeFilms()).then((items) => {
        console.log('[FreeCinema] yt-film loaded', items.length);
        setYtFilms(items);
        setYtFilmLoading(false);
      }).catch((e) => { console.warn(e); setYtFilmLoading(false); });
    }
  }, [tab, ytFilmLoading, ytFilms.length]);

  useEffect(() => {
    if (tab === 'yt-cartoon' && !ytCartoonLoading && !ytCartoons.length) {
      setYtCartoonLoading(true);
      import('../data/freeMovies').then((m) => m.getYouTubeCartoons()).then((items) => {
        console.log('[FreeCinema] yt-cartoon loaded', items.length);
        setYtCartoons(items);
        setYtCartoonLoading(false);
      }).catch((e) => { console.warn(e); setYtCartoonLoading(false); });
    }
  }, [tab, ytCartoonLoading, ytCartoons.length]);

  const list = useMemo(() => {
    if (tab === 'cartoni') return FREE_CARTOONS;
    if (tab === 'yt-film') return ytFilms;
    if (tab === 'yt-cartoon') return ytCartoons;
    return FREE_MOVIES;
  }, [tab, ytFilms, ytCartoons]);
  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return list;
    return list.filter(
      (f) =>
        f.t.toLowerCase().includes(t) ||
        f.s.toLowerCase().includes(t) ||
        f.genre.toLowerCase().includes(t),
    );
  }, [list, q]);

  /** Proietta un titolo di Internet Archive sul maxischermo della Sala 1. */
  const projectArchive = (title: FreeTitle) => {
    audio.fanfare();
    try {
      const map = JSON.parse(localStorage.getItem('moodbuster_free_films') || '{}');
      map[`ia_${title.archiveId}`] = { kind: 'archive', archiveId: title.archiveId, title: title.t };
      localStorage.setItem('moodbuster_free_films', JSON.stringify(map));
    } catch {
      /* ignore */
    }
    setSeatFilmId(`ia_${title.archiveId}`);
    setSeatedSeatId(CENTER_SEAT_ID);
    setPanel(null);
    flash(`"${title.t}" in proiezione in Sala 1! 🎬`);
  };

  /** Proietta un titolo YouTube (playlist o manuale) sul maxischermo della Sala 1. */
  const projectYouTube = (videoId: string, title: string) => {
    audio.fanfare();
    try {
      const map = JSON.parse(localStorage.getItem('moodbuster_free_films') || '{}');
      map[`yt_${videoId}`] = { kind: 'youtube', videoId, title };
      localStorage.setItem('moodbuster_free_films', JSON.stringify(map));
    } catch {
      /* ignore */
    }
    setSeatFilmId(`yt_${videoId}`);
    setSeatedSeatId(CENTER_SEAT_ID);
    setPanel(null);
    flash(`"${title}" in proiezione in Sala 1! 🎬`);
  };

  const TabBtn = ({ id, label, sub }: { id: Tab; label: string; sub?: string }) => (
    <button
      onClick={() => {
        audio.blip(620);
        setTab(id);
        setSelected(null);
      }}
      className={`rounded-xl px-3 py-2 text-left transition ${
        tab === id ? 'bg-white/15 text-white' : 'text-white/60 hover:text-white'
      }`}
    >
      <div className="text-xs font-black">{label}</div>
      {sub && <div className="text-[10px] text-white/50">{sub}</div>}
    </button>
  );

  return (
    <div
      className="pointer-events-auto absolute inset-0 z-40 flex items-center justify-center bg-black/85 p-2 sm:p-4 backdrop-blur-md"
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div className="bb-panel bb-pop relative flex max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl">
        <div className="relative shrink-0 overflow-hidden border-b border-white/10">
          <div className="absolute inset-0 bg-gradient-to-r from-rose-900/50 via-purple-900/20 to-transparent" />
          <div className="relative flex items-center justify-between px-4 sm:px-6 py-3.5">
            <div className="min-w-0">
              <h2 className="bb-title text-2xl sm:text-3xl bg-gradient-to-r from-rose-400 to-amber-300 bg-clip-text text-transparent">
                CINEMA GRATIS
              </h2>
              <p className="mt-0.5 text-[11px] text-white/55">
                {FREE_MOVIES.length} film · {FREE_CARTOONS.length} cartoni animati · playlist YouTube pubbliche
              </p>
            </div>
            <button
              onClick={() => {
                audio.blip(400);
                setPanel(null);
              }}
              className="rounded-lg bg-white/10 px-3 py-1.5 text-sm text-white/80 hover:bg-white/25 active:scale-95"
            >
              ✕
            </button>
          </div>
          <div className="relative flex gap-1 px-3 sm:px-5 overflow-x-auto no-scrollbar">
            <TabBtn id="film" label={`🎞️ FILM (${FREE_MOVIES.length})`} />
            <TabBtn id="cartoni" label={`🎨 CARTONI (${FREE_CARTOONS.length})`} />
            <TabBtn id="yt-film" label={`▶ YT FILM`} sub="Playlist pubblica" />
            <TabBtn id="yt-cartoon" label={`▶ YT CARTOON`} sub="Playlist pubblica" />
            <TabBtn id="canali" label="📺 CANALI" />
            <TabBtn id="link" label="🔗 INCOLLA LINK" />
          </div>
        </div>

        <div className="no-scrollbar flex-1 overflow-y-auto px-4 sm:px-6 py-4">
          {(tab === 'film' || tab === 'cartoni' || tab === 'yt-film' || tab === 'yt-cartoon') && !selected && (
            <>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={tab === 'cartoni' ? 'Cerca un cartone animato…' : tab.startsWith('yt-') ? 'Cerca nella playlist YouTube…' : 'Cerca un film…'}
                className="mb-4 w-full rounded-xl border border-white/15 bg-black/50 px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-rose-400"
              />
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {filtered.map((f) => {
                  const isYouTube = tab.startsWith('yt-');
                  return (
                    <button
                      key={f.id}
                      onClick={() => {
                        audio.blip(640);
                        setSelected(f);
                      }}
                      className="group relative overflow-hidden rounded-xl border border-white/10 text-left transition hover:-translate-y-1 hover:border-rose-400/70 hover:shadow-xl hover:shadow-rose-500/20 active:scale-95"
                    >
                      <div
                        className="relative aspect-[4/3] overflow-hidden"
                        style={{ background: `linear-gradient(140deg, ${f.c[0]}, ${f.c[1]})` }}
                      >
                        {isYouTube && f.ytThumbnailUrl ? (
                          <img
                            src={f.ytThumbnailUrl}
                            alt=""
                            className="absolute inset-0 h-full w-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <span className="absolute inset-0 flex items-center justify-center text-6xl font-black text-white/15 select-none">
                            {f.t[0]}
                          </span>
                        )}
                        <span className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/85 to-transparent" />
                        <span className={`absolute left-1.5 top-1.5 rounded px-1.5 py-0.5 text-[9px] font-black ${isYouTube ? 'bg-red-500/90 text-black' : 'bg-emerald-500/90 text-black'}`}>
                          {isYouTube ? '▶ YT' : '▶ IA'}
                        </span>
                        <span className="absolute bottom-1.5 right-1.5 rounded bg-black/70 px-1.5 py-0.5 text-[9px] font-bold text-white/85">
                          {f.d} min
                        </span>
                      </div>
                      <div className="p-2.5">
                        <div className="bb-title truncate text-sm text-white">{f.t}</div>
                        <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-white/55">
                          <span>{f.y}</span>
                          <span>·</span>
                          <span>★ {f.r.toFixed(1)}</span>
                          <span className="ml-auto">{MOOD_BY_ID[f.mood].emoji}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
                {!filtered.length && (
                  <p className="col-span-full py-12 text-center text-sm text-white/40">
                    {tab.startsWith('yt-') ? 'Nessun titolo nella playlist. Verifica la chiave YouTube API.' : 'Nessun risultato.'}
                  </p>
                )}
              </div>
            </>
          )}

          {(tab === 'film' || tab === 'cartoni' || tab.startsWith('yt-')) && selected && (
            <TitleDetail
              title={selected}
              onBack={() => setSelected(null)}
              onProject={() => {
                if (selected.ytVideoId) {
                  projectYouTube(selected.ytVideoId, selected.t);
                } else {
                  projectArchive(selected);
                }
              }}
            />
          )}

          {tab === 'canali' && (
            <div className="space-y-4">
              {(['film', 'cartoon'] as const).map((k) => (
                <div key={k}>
                  <h3 className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                    {k === 'film' ? '🎬 Film completi' : '🎨 Animazione'}
                  </h3>
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {FREE_CHANNELS.filter((c) => c.kind === k).map((c) => (
                      <a
                        key={c.id}
                        href={getChannelUrl(c.channelHandle)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-start gap-3 rounded-xl border border-white/10 bg-gradient-to-br from-zinc-900 to-black p-3.5 transition hover:-translate-y-0.5 hover:border-rose-500/50"
                      >
                        <span className="text-3xl">{c.logo}</span>
                        <span className="min-w-0 flex-1">
                          <span className="bb-title block text-base text-white group-hover:text-rose-400">
                            {c.name}
                          </span>
                          <span className="mt-0.5 block text-[11px] leading-snug text-white/55">
                            {c.description}
                          </span>
                        </span>
                        <span className="self-center text-white/30 group-hover:text-rose-400">→</span>
                      </a>
                    ))}
                  </div>
                </div>
              ))}
              <div className="rounded-xl border border-amber-500/25 bg-amber-950/30 p-3 text-[11px] leading-relaxed text-amber-200/90">
                ⚖️ Tutti i titoli in catalogo sono di <b>pubblico dominio</b> (copyright scaduto) o
                distribuiti ufficialmente dai detentori dei diritti.
              </div>
            </div>
          )}

          {tab === 'link' && <PasteLink onProject={projectYouTube} />}
        </div>
      </div>
    </div>
  );
}

function TitleDetail({
  title,
  onBack,
  onProject,
}: {
  title: FreeTitle;
  onBack: () => void;
  onProject: () => void;
}) {
  const m = MOOD_BY_ID[title.mood];
  const [previewOpen, setPreviewOpen] = useState(false);
  const isYouTube = !!title.ytVideoId;

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="text-sm text-white/60 hover:text-white">
        ← Torna al catalogo
      </button>

      <div
        className="relative overflow-hidden rounded-2xl p-5 sm:p-6"
        style={{ background: `linear-gradient(135deg, ${title.c[0]}, ${title.c[1]})` }}
      >
        <div className="absolute inset-0 bg-black/35" />
        <div className="relative">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black ${isYouTube ? 'bg-red-500/90 text-black' : 'bg-emerald-500/90 text-black'}`}>
              {isYouTube ? '▶ YOUTUBE PLAYLIST' : '✓ INTERNET ARCHIVE'}
            </span>
            <span
              className="rounded-full px-2.5 py-0.5 text-[10px] font-black text-black"
              style={{ background: m.colore }}
            >
              {m.emoji} {m.nome}
            </span>
          </div>
          <h3 className="bb-title mt-2 text-3xl sm:text-4xl text-white drop-shadow-lg">
            {title.t.toUpperCase()}
          </h3>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-white/80">
            <span>{title.y}</span>
            <span>·</span>
            <span>{title.d} min</span>
            <span>·</span>
            <span>★ {title.r.toFixed(1)}</span>
            <span>·</span>
            <span>{title.genre}</span>
          </div>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/90">{title.s}</p>
          <p className="mt-2 text-xs italic text-white/70">“{title.quote}”</p>
          <p className="mt-2 text-[11px] text-emerald-200">
            🍿 {title.snack} + {title.drink}
          </p>
        </div>
      </div>

      {previewOpen && isYouTube && title.ytVideoId && (
        <div className="overflow-hidden rounded-xl border-2 border-red-500/50 shadow-xl">
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            <iframe
              src={`https://www.youtube.com/embed/${title.ytVideoId}?autoplay=1&rel=0&modestbranding=1&iv_load_policy=3&hl=it&playsinline=1`}
              title={title.t}
              className="absolute inset-0 h-full w-full"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            />
          </div>
        </div>
      )}

      {previewOpen && !isYouTube && (
        <div className="overflow-hidden rounded-xl border-2 border-emerald-500/50 shadow-xl">
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            <iframe
              src={getArchiveEmbedUrl(title.archiveId, true)}
              title={title.t}
              className="absolute inset-0 h-full w-full"
              allowFullScreen
              allow="autoplay; fullscreen"
            />
          </div>
        </div>
      )}

      <div className="grid gap-2.5 md:grid-cols-3">
        <button
          onClick={onProject}
          className="rounded-xl bg-gradient-to-r from-red-600 to-rose-600 px-4 py-3.5 text-sm font-black text-white shadow-lg transition hover:brightness-110 active:scale-95"
        >
          🎬 PROIETTA IN SALA 1
        </button>
        {isYouTube && (
          <button
            onClick={() => setPreviewOpen((v) => !v)}
            className="rounded-xl bg-white/10 border border-white/20 px-4 py-3.5 text-sm font-bold text-white hover:bg-white/15 active:scale-95"
          >
            {previewOpen ? '✕ Chiudi anteprima' : '▶ Guarda qui'}
          </button>
        )}
        {!isYouTube && (
          <button
            onClick={() => setPreviewOpen((v) => !v)}
            className="rounded-xl bg-white/10 border border-white/20 px-4 py-3.5 text-sm font-bold text-white hover:bg-white/15 active:scale-95"
          >
            {previewOpen ? '✕ Chiudi anteprima' : '▶ Guarda qui'}
          </button>
        )}
        {isYouTube && title.ytVideoId && (
          <a
            href={`https://www.youtube.com/watch?v=${title.ytVideoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl bg-red-900/40 border border-red-500/40 px-4 py-3.5 text-center text-sm font-bold text-red-200 hover:bg-red-900/60"
          >
            ▶ Apri su YouTube
          </a>
        )}
        {!isYouTube && (
          <a
            href={getArchivePageUrl(title.archiveId)}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl bg-emerald-900/40 border border-emerald-500/40 px-4 py-3.5 text-center text-sm font-bold text-emerald-200 hover:bg-emerald-900/60"
          >
            🏛️ Apri su Archive.org
          </a>
        )}
      </div>
    </div>
  );
}

function PasteLink({
  onProject,
}: {
  onProject: (videoId: string, name: string) => void;
}) {
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const vid = extractVideoId(url);
  const touched = url.trim().length > 0;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-rose-500/30 bg-rose-950/30 p-4">
        <h3 className="bb-title text-xl text-rose-400">PROIETTA QUALSIASI VIDEO YOUTUBE</h3>
        <p className="mt-1 text-xs leading-relaxed text-white/70">
          Hai trovato un film o un cartone su YouTube? Incolla il link qui e guardalo sul maxischermo
          della Sala 1, seduto in poltrona con popcorn e bibita.
        </p>
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-bold text-white/70">Link YouTube o ID video</label>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=XXXXXXXXXXX"
          className="w-full rounded-xl border border-white/20 bg-black/60 px-4 py-2.5 font-mono text-sm text-white outline-none focus:border-rose-400"
        />
        {touched && !vid && (
          <p className="rounded-lg border border-red-500/30 bg-red-950/40 px-3 py-2 text-xs text-red-300">
            ⚠️ Link non riconosciuto. Formati validi: youtube.com/watch?v=… · youtu.be/… · ID da 11
            caratteri.
          </p>
        )}
        <label className="block pt-1 text-xs font-bold text-white/70">Titolo (opzionale)</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Il mio film"
          className="w-full rounded-xl border border-white/20 bg-black/60 px-4 py-2 text-sm text-white outline-none focus:border-rose-400"
        />
      </div>

      {vid && (
        <div className="space-y-3">
          <div className="overflow-hidden rounded-xl border-2 border-rose-500/60 shadow-xl">
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <iframe
                src={getYouTubeEmbedUrl(vid, false)}
                title="Anteprima"
                className="absolute inset-0 h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                allowFullScreen
              />
            </div>
          </div>
          <button
            onClick={() => onProject(vid, name.trim() || 'Il mio film')}
            className="w-full rounded-xl bg-gradient-to-r from-red-600 to-rose-600 px-4 py-3.5 text-base font-black text-white shadow-xl transition hover:brightness-110 active:scale-95"
          >
            🎬 PROIETTA IN SALA 1
          </button>
        </div>
      )}
    </div>
  );
}
