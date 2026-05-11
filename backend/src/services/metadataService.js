import axios from 'axios';

async function safe(name, fn) {
  try {
    return await fn();
  } catch {
    return [];
  }
}

export async function searchMetadata(query) {
  if (!query) {
    return {
      omdb: [], tmdb: [], youtube: [], tvmaze: [], jikan: [], kitsu: [],
      itunes: [], openlibrary: [], audiodb: [], sportsdb: [],
      lyrics: [], animechan: [], waifu: [], nekos: [], catboys: []
    };
  }

  const [
    omdb,
    tmdb,
    youtube,
    tvmaze,
    jikan,
    kitsu,
    itunes,
    openlibrary,
    audiodb,
    sportsdb,
    lyrics,
    animechan,
    waifu,
    nekos,
    catboys
  ] = await Promise.all([
    safe('omdb', async () => {
      const r = await axios.get('https://www.omdbapi.com/', {
        params: { apikey: process.env.OMDB_API_KEY, s: query }
      });
      return r.data.Search || [];
    }),

    safe('tmdb', async () => {
      const r = await axios.get('https://api.themoviedb.org/3/search/multi', {
        params: { api_key: process.env.TMDB_API_KEY, query, language: 'ro-RO' }
      });
      return r.data.results || [];
    }),

    safe('youtube', async () => {
      const r = await axios.get('https://www.googleapis.com/youtube/v3/search', {
        params: {
          key: process.env.YOUTUBE_API_KEY,
          q: query,
          part: 'snippet',
          maxResults: 8,
          type: 'video'
        }
      });
      return r.data.items || [];
    }),

    safe('tvmaze', async () => {
      const r = await axios.get('https://api.tvmaze.com/search/shows', {
        params: { q: query }
      });
      return r.data || [];
    }),

    safe('jikan', async () => {
      const r = await axios.get('https://api.jikan.moe/v4/anime', {
        params: { q: query, limit: 8 }
      });
      return r.data.data || [];
    }),

    safe('kitsu', async () => {
      const r = await axios.get('https://kitsu.io/api/edge/anime', {
        params: { 'filter[text]': query, 'page[limit]': 8 }
      });
      return r.data.data || [];
    }),

    safe('itunes', async () => {
      const r = await axios.get('https://itunes.apple.com/search', {
        params: { term: query, limit: 8, media: 'movie' }
      });
      return r.data.results || [];
    }),

    safe('openlibrary', async () => {
      const r = await axios.get('https://openlibrary.org/search.json', {
        params: { q: query, limit: 8 }
      });
      return r.data.docs || [];
    }),

    safe('audiodb', async () => {
      const r = await axios.get('https://www.theaudiodb.com/api/v1/json/2/search.php', {
        params: { s: query }
      });
      return r.data.artists || [];
    }),

    safe('sportsdb', async () => {
      const r = await axios.get('https://www.thesportsdb.com/api/v1/json/3/searchteams.php', {
        params: { t: query }
      });
      return r.data.teams || [];
    }),

    safe('lyrics', async () => {
      const parts = query.split(' ');
      if (parts.length < 2) return [];
      const artist = parts[0];
      const title = parts.slice(1).join(' ');
      const r = await axios.get(`https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`);
      return r.data.lyrics ? [{ artist, title, lyrics: r.data.lyrics.slice(0, 500) }] : [];
    }),

    safe('animechan', async () => {
      const r = await axios.get('https://animechan.xyz/api/random');
      return r.data ? [r.data] : [];
    }),

    safe('waifu', async () => {
      const r = await axios.get('https://api.waifu.pics/sfw/waifu');
      return r.data ? [r.data] : [];
    }),

    safe('nekos', async () => {
      const r = await axios.get('https://nekos.best/api/v2/neko');
      return r.data.results || [];
    }),

    safe('catboys', async () => {
      const r = await axios.get('https://api.catboys.com/img');
      return r.data ? [r.data] : [];
    })
  ]);

  return {
    omdb, tmdb, youtube, tvmaze, jikan, kitsu,
    itunes, openlibrary, audiodb, sportsdb,
    lyrics, animechan, waifu, nekos, catboys
  };
}
