/**
 * Netlify Function: API proxy per TMDB e YouTube.
 * Nasconde le chiavi API dal client bundle.
 */

// Le variabili sono lette solo a runtime lato server: non finiscono mai nel bundle del client.
const env = (name) => {
  const fromVite = process.env[`VITE_${name}`];
  const direct = process.env[name];
  const value = (fromVite || direct || '').trim();
  console.log('[api] env', name, '=', value ? '***' : '');
  return value;
};

const PLAYLISTS = {
  films: 'YOUTUBE_FILMS_PLAYLIST',
  cartoons: 'YOUTUBE_CARTOONS_PLAYLIST',
};

export default async (req) => {
  const url = new URL(req.url);
  const service = url.searchParams.get('service');
  const path = url.searchParams.get('path') || '';
  console.log('[api][yt] service=', service, 'path=', path, 'params=', Object.fromEntries(url.searchParams));

  if (service === 'tmdb') {
    const target = new URL(`https://api.themoviedb.org/3${path}`);
    target.searchParams.set('api_key', env('TMDB_API_KEY'));
    target.searchParams.set('language', 'it-IT');
    url.searchParams.forEach((value, key) => {
      if (!['service', 'path'].includes(key)) {
        target.searchParams.set(key, value);
      }
    });

    const res = await fetch(target.toString(), {
      headers: { Accept: 'application/json' },
    });

    const data = await res.json();
    return new Response(JSON.stringify(data), {
      status: res.status,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }

  if (service === 'youtube') {
    const target = new URL(`https://www.googleapis.com/youtube/v3${path}`);
    target.searchParams.set('key', env('YOUTUBE_API_KEY'));
    url.searchParams.forEach((value, key) => {
      if (!['service', 'path', 'playlist'].includes(key)) {
        target.searchParams.set(key, value);
      }
    });

    const playlist = url.searchParams.get('playlist');
    if (playlist) {
      const playlistId = PLAYLISTS[playlist] ? env(PLAYLISTS[playlist]) : '';
      console.log('[api][yt] playlist=', playlist, 'resolvedId=', playlistId, 'rawEnv=', process.env.VITE_YOUTUBE_FILMS_PLAYLIST, process.env.VITE_YOUTUBE_CARTOONS_PLAYLIST);
      if (!playlistId) {
        return new Response(JSON.stringify({ items: [] }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      target.searchParams.set('playlistId', playlistId);
    }

    const res = await fetch(target.toString(), {
      headers: { Accept: 'application/json' },
    });

    const data = await res.json();
    console.log('[api][yt] upstream status=', res.status, 'items=', data.items?.length);
    return new Response(JSON.stringify(data), {
      status: res.status,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }

  return new Response(JSON.stringify({ error: 'Invalid service' }), {
    status: 400,
    headers: { 'Content-Type': 'application/json' },
  });
};
