import express from 'express';

const router = express.Router();

const registry = [
  { name: 'OMDb', key: 'OMDB_API_KEY', status: 'active', type: 'movies metadata' },
  { name: 'TMDB', key: 'TMDB_API_KEY', status: 'active', type: 'movies / series metadata' },
  { name: 'YouTube', key: 'YOUTUBE_API_KEY', status: 'active', type: 'trailers / channels' },
  { name: 'Trakt.TV', key: 'TRAKT_CLIENT_ID', status: 'blocked', type: 'movies / series trending - Cloudflare 403 on Termux' },

  { name: 'TVMaze', key: null, status: 'active', type: 'series metadata' },
  { name: 'Jikan', key: null, status: 'active', type: 'anime metadata' },
  { name: 'Kitsu', key: null, status: 'active', type: 'anime metadata' },
  { name: 'iTunes', key: null, status: 'active', type: 'music / media' },
  { name: 'OpenLibrary', key: null, status: 'active', type: 'books / courses' },
  { name: 'TheAudioDB', key: null, status: 'active', type: 'music metadata' },
  { name: 'TheSportsDB', key: null, status: 'active', type: 'sports metadata' },
  { name: 'Lyrics.ovh', key: null, status: 'active', type: 'lyrics' },
  { name: 'Waifu.pics', key: null, status: 'active', type: 'anime images' },
  { name: 'Nekos.best', key: null, status: 'active', type: 'anime images' },
  { name: 'Catboys', key: null, status: 'active', type: 'anime images' },

  { name: 'Algolia', key: 'ALGOLIA_APP_ID', status: 'active', type: 'search engine' },
  { name: 'ODDMB / OpenMovieDB', key: 'ODDMB_API_KEY', status: 'missing-key', type: 'movies metadata' },
  { name: 'OpenSubtitles', key: 'OPENSUBTITLES_API_KEY', status: 'missing-key', type: 'subtitles' },
  { name: 'Deezer', key: null, status: 'active', type: 'music metadata' },
  { name: 'Reddit', key: 'REDDIT_CLIENT_ID', status: 'missing-key', type: 'community trends' },
  { name: 'Football-Data', key: 'FOOTBALL_DATA_API_KEY', status: 'missing-key', type: 'football fixtures' },
  { name: 'Balldontlie NBA', key: 'BALLDONTLIE_API_KEY', status: 'missing-key', type: 'NBA data' },
  { name: 'Jolpica F1 / Ergast compatible', key: null, status: 'active', type: 'F1 data' },
  { name: 'OpenLigaDB', key: null, status: 'active', type: 'sports fixtures' },
  { name: 'Wikipedia', key: null, status: 'active', type: 'metadata enrichment' },
  { name: 'RSS Feeds', key: null, status: 'active', type: 'news / releases' },
  { name: 'Sitemap Scraping', key: null, status: 'active', type: 'site discovery' },
  { name: 'MyDramaList', key: null, status: 'not-implemented', type: 'asian drama metadata' },
  { name: 'AsianWiki', key: null, status: 'not-implemented', type: 'asian drama metadata' },
  { name: 'AniAPI', key: null, status: 'not-implemented', type: 'anime metadata' },
  { name: 'LiveScore RSS', key: null, status: 'not-implemented', type: 'sports RSS' },
  { name: 'DramaCool', key: null, status: 'not-implemented', type: 'drama metadata' },
  { name: 'KissAsian', key: null, status: 'not-implemented', type: 'asian metadata' },
  { name: 'Viki Public Metadata', key: null, status: 'not-implemented', type: 'drama metadata' },
  { name: 'AnimeChan', key: null, status: 'broken', type: 'anime quotes' }
];

router.get('/', (_req, res) => {
  const result = registry.map((api) => ({
    ...api,
    configured: api.key ? Boolean(process.env[api.key]) : true
  }));

  res.json(result);
});

export default router;
