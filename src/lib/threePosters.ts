import * as THREE from 'three';
import { posterUrl, resolvePosterPath } from './tmdb';

const loader = new THREE.TextureLoader();
loader.setCrossOrigin('anonymous');

const texCache = new Map<number, THREE.Texture>();

/**
 * Scarica la locandina reale TMDB e la consegna come texture Three.js.
 * Fallback silenzioso: se fallisce resta la copertina procedurale.
 */
export function loadTmdbPosterTexture(
  tmdbId: number,
  size: 'w185' | 'w342' | 'w500',
  onReady: (t: THREE.Texture) => void,
) {
  if (!tmdbId) return;
  const hit = texCache.get(tmdbId);
  if (hit) {
    onReady(hit);
    return;
  }
  resolvePosterPath(tmdbId)
    .then((path) => {
      const url = posterUrl(path, size);
      if (!url) return;
      loader.load(
        url,
        (t) => {
          t.colorSpace = THREE.SRGBColorSpace;
          t.anisotropy = 8;
          t.needsUpdate = true;
          texCache.set(tmdbId, t);
          onReady(t);
        },
        undefined,
        () => {
          /* rete non disponibile: resta la copertina procedurale */
        },
      );
    })
    .catch(() => {
      /* chiave o rete non valide */
    });
}
