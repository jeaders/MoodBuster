/**
 * Client TMDB (The Movie Database) API v3
 * Gratuito, italiano, con copertine HD, trailer YouTube e streaming providers.
 * Registrati gratuitamente su: https://www.themoviedb.org/settings/api
 */

const BASE = 'https://api.themoviedb.org/3';
const IMG_BASE = 'https://image.tmdb.org/t/p';
const API_PROXY = '/.netlify/functions/api';

export type TmdbMovie = {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  release_date: string;
  runtime: number | null;
  vote_average: number;
  poster_path: string | null;
  backdrop_path: string | null;
  genre_ids: number[];
  genres?: { id: number; name: string }[];
  videos?: { results: TmdbVideo[] };
  'watch/providers'?: { results: Record<string, TmdbProviderRegion> };
  credits?: { cast: { name: string; character: string }[] };
};

export type TmdbVideo = {
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
};

export type TmdbProviderRegion = {
  link?: string;
  flatrate?: { provider_name: string; provider_id: number; logo_path: string }[];
  rent?: { provider_name: string; provider_id: number; logo_path: string }[];
  buy?: { provider_name: string; provider_id: number; logo_path: string }[];
};

export type TmdbSearchResult = {
  page: number;
  total_results: number;
  total_pages: number;
  results: TmdbMovie[];
};

/* ---- API key management ---- */
const KEY_STORAGE = 'moodbuster_tmdb_key';

/** Chiave di default fornita dall'utente: l'app funziona subito senza configurazione. */
export const DEFAULT_API_KEY = 'e4ec2b98194e32b52caa8d8de9ba5c02';

export function getApiKey(): string {
  try {
    return localStorage.getItem(KEY_STORAGE) || import.meta.env.VITE_TMDB_API_KEY || '';
  } catch {
    return import.meta.env.VITE_TMDB_API_KEY || '';
  }
}

export function setApiKey(key: string) {
  const k = key.trim();
  if (k) localStorage.setItem(KEY_STORAGE, k);
  else localStorage.removeItem(KEY_STORAGE);
}

export function isDefaultKey(): boolean {
  return getApiKey() === DEFAULT_API_KEY;
}

/** Cache dei poster_path risolti via TMDB, condivisa in tutta l'app. */
const posterPathCache = new Map<number, string | null>();

export function getCachedPosterPath(tmdbId: number): string | null | undefined {
  return posterPathCache.get(tmdbId);
}

export function resolvePosterPath(tmdbId: number): Promise<string | null> {
  if (posterPathCache.has(tmdbId)) return Promise.resolve(posterPathCache.get(tmdbId)!);
  return fetchMovieDetail(tmdbId)
    .then((d) => {
      const p = d.poster_path || null;
      posterPathCache.set(tmdbId, p);
      return p;
    })
    .catch(() => {
      posterPathCache.set(tmdbId, null);
      return null;
    });
}

/* ---- fetch helper ---- */
async function tmdbFetch<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const key = getApiKey();
  if (!key) throw new Error('NO_API_KEY');

  if (import.meta.env.PROD) {
    const qs = new URLSearchParams({ service: 'tmdb', path });
    Object.entries(params).forEach(([k, v]) => qs.set(k, v));
    const res = await fetch(`${API_PROXY}?${qs.toString()}`);
    if (!res.ok) throw new Error(`TMDB ${res.status}`);
    return res.json();
  }

  const qs = new URLSearchParams({ api_key: key, language: 'it-IT', ...params });
  const res = await fetch(`${BASE}${path}?${qs}`);
  if (!res.ok) throw new Error(`TMDB ${res.status}`);
  return res.json();
}

/* ---- cache ---- */
const memCache = new Map<string, unknown>();
const CACHE_TTL = 10 * 60 * 1000; // 10 min
const cacheTs = new Map<string, number>();

function cached<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  const now = Date.now();
  if (memCache.has(key) && (now - (cacheTs.get(key) ?? 0)) < CACHE_TTL) {
    return Promise.resolve(memCache.get(key) as T);
  }
  return fetcher().then((data) => {
    memCache.set(key, data);
    cacheTs.set(key, now);
    return data;
  });
}

/* ---- Public API ---- */

export function fetchMovieDetail(tmdbId: number): Promise<TmdbMovie> {
  return cached(`detail_${tmdbId}`, () =>
    tmdbFetch<TmdbMovie>(`/movie/${tmdbId}`, {
      append_to_response: 'videos,watch/providers,credits',
    }),
  );
}

export function fetchSearch(query: string, page = '1'): Promise<TmdbSearchResult> {
  return tmdbFetch('/search/movie', { query, page, include_adult: 'false' });
}

export function fetchNowPlaying(page = '1'): Promise<TmdbSearchResult> {
  return cached(`now_playing_${page}`, () =>
    tmdbFetch('/movie/now_playing', { region: 'IT', page }),
  );
}

export function fetchTrending(page = '1'): Promise<TmdbSearchResult> {
  return cached(`trending_${page}`, () =>
    tmdbFetch('/trending/movie/week', { page }),
  );
}

export function fetchPopular(page = '1'): Promise<TmdbSearchResult> {
  return cached(`popular_${page}`, () =>
    tmdbFetch('/movie/popular', { region: 'IT', page }),
  );
}

export function fetchUpcoming(page = '1'): Promise<TmdbSearchResult> {
  return cached(`upcoming_${page}`, () =>
    tmdbFetch('/movie/upcoming', { region: 'IT', page }),
  );
}

/* ---- Image helpers ---- */
export function posterUrl(path: string | null, size: 'w185' | 'w342' | 'w500' | 'w780' | 'original' = 'w500'): string | null {
  return path ? `${IMG_BASE}/${size}${path}` : null;
}

export function backdropUrl(path: string | null, size: 'w780' | 'w1280' | 'original' = 'w1280'): string | null {
  return path ? `${IMG_BASE}/${size}${path}` : null;
}

/* ---- Trailer helper ---- */
export function getTrailerUrl(videos: TmdbVideo[] | undefined): string | null {
  if (!videos || !videos.length) return null;
  // Prefer official Italian trailers, then any trailer on YouTube
  const itTrailer = videos.find((v) => v.site === 'YouTube' && v.type === 'Trailer' && v.official);
  const anyTrailer = videos.find((v) => v.site === 'YouTube' && v.type === 'Trailer');
  const anyClip = videos.find((v) => v.site === 'YouTube');
  const best = itTrailer || anyTrailer || anyClip;
  return best ? `https://www.youtube.com/watch?v=${best.key}` : null;
}

export function getTrailerEmbedUrl(videos: TmdbVideo[] | undefined): string | null {
  if (!videos || !videos.length) return null;
  const itTrailer = videos.find((v) => v.site === 'YouTube' && v.type === 'Trailer' && v.official);
  const anyTrailer = videos.find((v) => v.site === 'YouTube' && v.type === 'Trailer');
  const anyClip = videos.find((v) => v.site === 'YouTube');
  const best = itTrailer || anyTrailer || anyClip;
  return best ? `https://www.youtube.com/embed/${best.key}?autoplay=1&rel=0&modestbranding=1` : null;
}

/* ---- Streaming providers for Italy ---- */
export function getItalianProviders(data: TmdbMovie): { flatrate: string[]; rent: string[]; link: string | null } {
  const region = data['watch/providers']?.results?.IT;
  return {
    flatrate: (region?.flatrate || []).map((p) => p.provider_name),
    rent: [...(region?.rent || []), ...(region?.buy || [])].map((p) => p.provider_name),
    link: region?.link || null,
  };
}

/* ---- Search by title + year (for resolving our film database) ---- */
export async function resolveTmdbId(title: string, year: number): Promise<number | null> {
  try {
    const res = await fetchSearch(title, '1');
    if (res.results && res.results.length > 0) {
      // Try exact year match first
      const exact = res.results.find((r) => {
        const y = r.release_date ? parseInt(r.release_date.slice(0, 4)) : 0;
        return Math.abs(y - year) <= 1;
      });
      if (exact) return exact.id;
      return res.results[0].id;
    }
  } catch {
    // ignore
  }
  return null;
}