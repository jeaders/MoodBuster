/**
 * YouTube Data API v3 helpers
 * - Carica i video di una playlist pubblica
 * - Normalizza i titoli per il matching con il catalogo
 */

export type YTPlaylistName = 'films' | 'cartoons';

export type YTPlaylistVideo = {
  id: string;
  title: string;
  channelTitle: string;
  description: string;
  thumbnailUrl: string;
  videoId: string;
};

const YT_BASE = 'https://www.googleapis.com/youtube/v3';
const API_PROXY = '/.netlify/functions/api';

function extractPlaylistId(value: string): string {
  if (!value) return '';
  if (value.startsWith('http')) {
    const m = value.match(/[?&]list=([^&]+)/);
    if (m) return m[1];
    return '';
  }
  return value;
}

export function getYouTubeApiKey(): string {
  return (import.meta.env.VITE_YOUTUBE_API_KEY || '').trim();
}

export function getYouTubeFilmPlaylist(): string {
  return extractPlaylistId((import.meta.env.VITE_YOUTUBE_FILMS_PLAYLIST || '').trim());
}

export function getYouTubeCartoonsPlaylist(): string {
  return extractPlaylistId((import.meta.env.VITE_YOUTUBE_CARTOONS_PLAYLIST || '').trim());
}

function cleanTitle(title: string): string {
  return title
    .replace(/\(ITA\)/gi, '')
    .replace(/\(ITA LOB\)/gi, '')
    .replace(/Film completo/gi, '')
    .replace(/Film Completo/gi, '')
    .replace(/HD/gi, '')
    .replace(/720p/gi, '')
    .replace(/1080p/gi, '')
    .replace(/\[HD\]/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractYear(title: string): number | null {
  const m = title.match(/\b(19|20)\d{2}\b/);
  if (!m) return null;
  return Number(m[0]);
}

export async function fetchPlaylistVideos(listId: string): Promise<YTPlaylistVideo[]> {
  const apiKey = getYouTubeApiKey();
  if (!apiKey || !listId) return [];

  const out: YTPlaylistVideo[] = [];
  let pageToken: string | null = null;

  for (let safety = 0; safety < 20; safety++) {
    const params: Record<string, string> = {
      part: 'snippet,contentDetails',
      maxResults: '50',
      playlistId: listId,
    };
    if (pageToken) params.pageToken = pageToken;

    let data: any;
    if (import.meta.env.PROD) {
      const qs = new URLSearchParams({ service: 'youtube', path: '/playlistItems' });
      Object.entries(params).forEach(([k, v]) => qs.set(k, v));
      const res = await fetch(`${API_PROXY}?${qs.toString()}`);
      if (!res.ok) {
        console.warn('YouTube playlist fetch failed', listId, res.status);
        break;
      }
      data = await res.json();
    } else {
      const qs = new URLSearchParams({ key: apiKey, ...params });
      const res = await fetch(`${YT_BASE}/playlistItems?${qs.toString()}`);
      if (!res.ok) {
        console.warn('YouTube playlist fetch failed', listId, res.status);
        break;
      }
      data = await res.json();
    }

    const items = data.items || [];
    for (const item of items) {
      const snippet = item.snippet;
      const videoId = item.contentDetails?.videoId;
      if (!videoId) continue;

      const rawTitle = snippet.title || '';
      const thumbnails = snippet.thumbnails || {};
      const thumbnailUrl = thumbnails.medium?.url || thumbnails.high?.url || thumbnails.default?.url || '';

      out.push({
        id: `yt_${videoId}`,
        title: cleanTitle(rawTitle),
        channelTitle: snippet.channelTitle || '',
        description: snippet.description || '',
        thumbnailUrl,
        videoId,
      });
    }

    pageToken = data.nextPageToken || null;
    if (!pageToken) break;
  }

  return out;
}

function matchToExistingFilm(title: string, year: number | null): { filmId?: string; tmdbId?: number } {
  const normalized = title.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  for (const film of FILMS) {
    const filmNorm = film.t.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
    if (filmNorm === normalized) {
      if (year && film.y !== year) continue;
      return { filmId: film.id, tmdbId: film.tmdbId };
    }
  }
  return {};
}

function ytToFreeTitle(video: YTPlaylistVideo, kind: 'film' | 'cartoon'): FreeTitle {
  const { title, year } = normalizeYTTitle(video.title);
  const matched = matchToExistingFilm(title, year);
  const mood = guessMood(title, kind);
  return {
    id: video.id,
    t: title || video.title,
    y: year || new Date().getFullYear(),
    d: 90,
    r: 0,
    mood,
    s: video.description || `Film gratuito da YouTube: ${video.title}`,
    archiveId: '',
    ytQuery: video.title,
    license: 'official',
    genre: kind === 'cartoon' ? 'Animazione' : 'Film',
    c: ['#1a1a2e', '#16213e'],
    quote: 'Film gratuito.',
    snack: 'Popcorn',
    drink: 'Cola',
    kind,
    ytVideoId: video.videoId,
    ytThumbnailUrl: video.thumbnailUrl,
    tmdbPosterPath: matched.tmdbId ? null : undefined,
  };
}

function guessMood(title: string, kind: 'film' | 'cartoon'): MoodId {
  const t = title.toLowerCase();
  if (kind === 'cartoon') return 'animazione';
  if (/commedia|ridere|scemo|fantozzi|amici miei|totò/.test(t)) return 'ridere';
  if (/dramma|piangere|vita è bella|forrest gump|schindler/.test(t)) return 'piangere';
  if (/horror|paura|esorcista|shining|alien|suspiria/.test(t)) return 'paura';
  if (/amore|cuore|romantico|pretty woman|notting hill/.test(t)) return 'cuore';
  if (/fantascienza|cervello|inception|matrix|memento/.test(t)) return 'cervello';
  if (/azione|adrenalina|mad max|john wick|terminator/.test(t)) return 'adrenalina';
  if (/epico|guerra|eroe|il gladiatore|braveheart/.test(t)) return 'epico';
  if (/viaggio|avventura|into the wild|lost in translation/.test(t)) return 'viaggio';
  if (/animazione|cartoon|disney|pixar|studio ghibli/.test(t)) return 'animazione';
  if (/commedia|family|famiglia|tutti insieme|re leone/.test(t)) return 'famiglia';
  return 'comfort';
}

let ytFilmsPromise: Promise<FreeTitle[]> | null = null;
let ytCartoonsPromise: Promise<FreeTitle[]> | null = null;

export function getYouTubeFilms(): Promise<FreeTitle[]> {
  if (!ytFilmsPromise) {
    ytFilmsPromise = loadYouTubeTitles('film');
  }
  return ytFilmsPromise;
}

export function getYouTubeCartoons(): Promise<FreeTitle[]> {
  if (!ytCartoonsPromise) {
    ytCartoonsPromise = loadYouTubeTitles('cartoon');
  }
  return ytCartoonsPromise;
}

async function loadYouTubeTitles(kind: 'film' | 'cartoon'): Promise<FreeTitle[]> {
  const playlistId = kind === 'film' ? getYouTubeFilmPlaylist() : getYouTubeCartoonsPlaylist();
  if (!playlistId) return [];

  try {
    const videos = await fetchPlaylistVideos(playlistId);
    const freeTitles: FreeTitle[] = [];
    for (const video of videos) {
      const ft = ytToFreeTitle(video, kind);
      freeTitles.push(ft);
    }
    return freeTitles;
  } catch (error) {
    console.warn('Failed to load YouTube playlist', kind, error);
    return [];
  }
}

/** Merge YouTube titles into FREE_MOVIES, avoiding duplicates. */
export async function mergeYouTubeTitles(): Promise<{ added: number; skipped: number }> {
  const [ytFilms, ytCartoons] = await Promise.all([getYouTubeFilms(), getYouTubeCartoons()]);
  const allYT = [...ytFilms, ...ytCartoons];

  const existingIds = new Set(FREE_MOVIES.map((f) => f.id));
  const existingTitles = new Set(
    FREE_MOVIES.map((f) => f.t.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()),
  );

  let added = 0;
  let skipped = 0;

  for (const yt of allYT) {
    const normalizedTitle = yt.t.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
    if (existingIds.has(yt.id)) {
      skipped++;
      continue;
    }
    if (existingTitles.has(normalizedTitle)) {
      skipped++;
      continue;
    }

    const matched = matchToExistingFilm(yt.t, yt.y);
    if (matched.filmId) {
      skipped++;
      continue;
    }

    FREE_MOVIES.push(yt);
    existingIds.add(yt.id);
    existingTitles.add(normalizedTitle);
    added++;
  }

  return { added, skipped };
}

export function resolveYouTubeEmbedUrl(freeFilmId: string): string | null {
  const entry = FREE_MOVIES.find((f) => f.id === freeFilmId);
  if (!entry?.ytVideoId) return null;
  return getYouTubeEmbedUrl(entry.ytVideoId, true);
}

/** URL embed di Internet Archive — stabile, nessun ad, nessun tracking. */
export function getArchiveEmbedUrl(archiveId: string, autoplay = true): string {
  const params = new URLSearchParams();
  if (autoplay) params.set('autoplay', '1');
  const qs = params.toString();
  return `https://archive.org/embed/${archiveId}${qs ? '?' + qs : ''}`;
}

/** Pagina pubblica di Internet Archive (apertura in nuova scheda). */
export function getArchivePageUrl(archiveId: string): string {
  return `https://archive.org/details/${archiveId}`;
}

/** URL embed YouTube per un video incollato dall'utente. */
export function getYouTubeEmbedUrl(videoId: string, autoplay = true): string {
  const params = new URLSearchParams({
    autoplay: autoplay ? '1' : '0',
    rel: '0',
    modestbranding: '1',
    iv_load_policy: '3',
    hl: 'it',
    playsinline: '1',
  });
  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
}

export function getYouTubeSearchUrl(query: string): string {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}

export function getChannelUrl(handle: string): string {
  if (handle.startsWith('http')) return handle;
  if (handle.startsWith('results?')) return `https://www.youtube.com/${handle}`;
  return `https://www.youtube.com/${handle}`;
}

/** Estrae l'ID da qualsiasi formato di URL YouTube. */
export function extractVideoId(input: string): string | null {
  const s = input.trim();
  if (!s) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/|youtube\.com\/live\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const p of patterns) {
    const m = s.match(p);
    if (m) return m[1];
  }
  return null;
}
