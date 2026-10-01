/**
 * YouTube Data API v3 helpers
 * - Carica i video di una playlist pubblica
 * - Normalizza i titoli per il matching con il catalogo
 */

const YT_BASE = 'https://www.googleapis.com/youtube/v3';

export function getYouTubeApiKey(): string {
  return (import.meta.env.VITE_YOUTUBE_API_KEY || '').trim();
}

export function getYouTubeFilmPlaylist(): string {
  return (import.meta.env.VITE_YOUTUBE_FILMS_PLAYLIST || '').trim();
}

export function getYouTubeCartoonsPlaylist(): string {
  return (import.meta.env.VITE_YOUTUBE_CARTOONS_PLAYLIST || '').trim();
}

export type YTPlaylistVideo = {
  id: string;
  title: string;
  channelTitle: string;
  description: string;
  thumbnailUrl: string;
  videoId: string;
};

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
    const qs = new URLSearchParams({
      part: 'snippet,contentDetails',
      maxResults: '50',
      playlistId: listId,
      key: apiKey,
    });
    if (pageToken) qs.set('pageToken', pageToken);

    const res = await fetch(`${YT_BASE}/playlistItems?${qs.toString()}`);
    if (!res.ok) {
      console.warn('YouTube playlist fetch failed', listId, res.status);
      break;
    }

    const data = await res.json();
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
