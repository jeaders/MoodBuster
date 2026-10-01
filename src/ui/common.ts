import type { Film } from '../data/films';
import { posterTexture } from '../lib/textures';

const caches: Record<number, Map<string, string>> = {};

/** Miniatura JPEG ridimensionata (veloce da codificare) della copertina procedurale. */
export function thumb(f: Film, w = 128) {
  const cache = (caches[w] ||= new Map());
  let u = cache.get(f.id);
  if (!u) {
    const src = posterTexture(f).image as HTMLCanvasElement;
    const c = document.createElement('canvas');
    c.width = w;
    c.height = Math.round(w * 1.5);
    const ctx = c.getContext('2d')!;
    ctx.drawImage(src, 0, 0, c.width, c.height);
    u = c.toDataURL('image/jpeg', 0.82);
    cache.set(f.id, u);
  }
  return u;
}

export const bigThumb = (f: Film) => thumb(f, 288);

export const dur = (m: number) => `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, '0')}m`;
