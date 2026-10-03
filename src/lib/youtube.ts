/**
 * YouTube Data API v3 helpers
 * - Carica i video di una playlist pubblica
 * - Normalizza i titoli per il matching con il catalogo
 */

export type YTPlaylistVideo = {
  id: string;
  title: string;
  channelTitle: string;
  description: string;
  thumbnailUrl: string;
  videoId: string;
};

const YT_BASE = 'https://www.googleapis.com/youtube/v3';

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
    const params = new URLSearchParams({
      key: apiKey,
      part: 'snippet,contentDetails',
      maxResults: '50',
      playlistId: listId,
    });
    if (pageToken) params.set('pageToken', pageToken);

    const url = `${YT_BASE}/playlistItems?${params.toString()}`;
    console.log('[YT] request', url);
    const res = await fetch(url);
    if (!res.ok) {
      console.warn('[YT] playlist fetch failed', listId, res.status, await res.text().catch(() => ''));
      break;
    }

    const data: any = await res.json();
    const items = data.items || [];
    console.log('[YT] raw items count', items.length, 'pageToken', data.nextPageToken);
    if (items[0]) console.log('[YT] first item keys', Object.keys(items[0]), 'contentDetails', items[0].contentDetails, 'resourceId', items[0].snippet?.resourceId);

    if (!items.length) {
      console.log('[YT] no more items');
      break;
    }

    for (const item of items) {
      const snippet = item.snippet;
      const videoId = item.contentDetails?.videoId || snippet?.resourceId?.videoId;
      console.log('[YT] item videoId', videoId, 'title', snippet?.title);
      if (!videoId) continue;

      const rawTitle = snippet?.title || '';
      const thumbnails = snippet?.thumbnails || {};
      const thumbnailUrl = thumbnails.medium?.url || thumbnails.high?.url || thumbnails.default?.url || '';

      out.push({
        id: `yt_${videoId}`,
        title: cleanTitle(rawTitle),
        channelTitle: snippet?.channelTitle || '',
        description: snippet?.description || '',
        thumbnailUrl,
        videoId,
      });
    }

    pageToken = data.nextPageToken || null;
    if (!pageToken) {
      console.log('[YT] no more pages');
      break;
    }
    if (items.length < 50) {
      console.log('[YT] partial page, stopping');
      break;
    }
  }

  console.log('[YT] total loaded', out.length);
  return out;
}
