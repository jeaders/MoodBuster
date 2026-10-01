import { useEffect, useState } from 'react';
import { posterUrl, resolvePosterPath } from '../lib/tmdb';

const resolved = new Map<number, string | null>();
const waiting: number[] = [];
let running = 0;
const MAX_PARALLEL = 6;

function pump() {
  while (running < MAX_PARALLEL && waiting.length) {
    const id = waiting.shift()!;
    running++;
    resolvePosterPath(id).finally(() => {
      running--;
      pump();
    });
  }
}

/**
 * Restituisce il path del poster TMDB reale del film, con coda di richieste e cache.
 * Se TMDB non risponde ritorna null (il chiamante usa la copertina procedurale).
 */
export function useTmdbPosterPath(tmdbId: number): string | null {
  const [path, setPath] = useState<string | null>(() => resolved.get(tmdbId) ?? null);

  useEffect(() => {
    if (!tmdbId) return;
    const hit = resolved.get(tmdbId);
    if (hit !== undefined) {
      setPath(hit);
      return;
    }
    let alive = true;
    waiting.push(tmdbId);
    pump();
    const check = window.setInterval(() => {
      const v = resolved.get(tmdbId);
      if (v !== undefined) {
        window.clearInterval(check);
        if (alive) setPath(v);
      }
    }, 100);
    return () => {
      alive = false;
      window.clearInterval(check);
    };
  }, [tmdbId]);

  return path;
}

export function tmdbPosterUrl(path: string | null, size: 'w185' | 'w342' | 'w500' = 'w185') {
  return posterUrl(path, size);
}

/** Cover: poster TMDB reale se disponibile, altrimenti copertina procedurale. */
export function FilmCover({
  tmdbId,
  fallback,
  size = 'w185',
  className,
  alt = '',
}: {
  tmdbId: number;
  fallback: string;
  size?: 'w185' | 'w342' | 'w500';
  className?: string;
  alt?: string;
}) {
  const remote = useTmdbPosterPath(tmdbId);
  const src = tmdbPosterUrl(remote, size) || fallback;
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={className}
      onError={(e) => {
        (e.currentTarget as HTMLImageElement).src = fallback;
      }}
    />
  );
}
