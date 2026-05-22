import { Router } from 'express';
import { searchMetadata } from '../services/metadataService.js';
import { query } from '../db/postgres.js';

const router = Router();

async function findYoutubeTrailer(title, year = '') {
  if (!process.env.YOUTUBE_API_KEY || !title) return null;

  try {
    const q = `${title} ${year} official trailer`;
    const url =
      `https://www.googleapis.com/youtube/v3/search` +
      `?part=snippet&type=video&maxResults=1` +
      `&q=${encodeURIComponent(q)}` +
      `&key=${process.env.YOUTUBE_API_KEY}`;

    const data = await fetch(url).then((r) => r.json());
    const videoId = data.items?.[0]?.id?.videoId;

    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  } catch {
    return null;
  }
}

function firstImage(data) {
  return (
    (data.tmdb?.[0]?.poster_path ? `https://image.tmdb.org/t/p/w500${data.tmdb[0].poster_path}` : '') ||
    (data.omdb?.[0]?.Poster && data.omdb[0].Poster !== 'N/A' ? data.omdb[0].Poster : '') ||
    data.youtube?.[0]?.snippet?.thumbnails?.high?.url ||
    data.jikan?.[0]?.images?.jpg?.large_image_url ||
    data.kitsu?.[0]?.attributes?.posterImage?.large ||
    (data.openlibrary?.[0]?.cover_i ? `https://covers.openlibrary.org/b/id/${data.openlibrary[0].cover_i}-L.jpg` : '') ||
    data.audiodb?.[0]?.strArtistThumb ||
    data.sportsdb?.[0]?.strTeamBadge ||
    ''
  );
}

function firstBackdrop(data) {
  return (
    (data.tmdb?.[0]?.backdrop_path ? `https://image.tmdb.org/t/p/w1280${data.tmdb[0].backdrop_path}` : '') ||
    data.youtube?.[0]?.snippet?.thumbnails?.high?.url ||
    data.sportsdb?.[0]?.strStadiumThumb ||
    firstImage(data)
  );
}

function bestDescription(data) {
  return (
    data.tmdb?.[0]?.overview ||
    data.tvmaze?.[0]?.show?.summary?.replace(/<[^>]+>/g, '') ||
    data.jikan?.[0]?.synopsis ||
    data.kitsu?.[0]?.attributes?.synopsis ||
    data.audiodb?.[0]?.strBiographyEN ||
    data.sportsdb?.[0]?.strDescriptionEN ||
    ''
  );
}

async function enrichContentById(id) {
  const result = await query('SELECT * FROM contents WHERE id = $1', [id]);
  const item = result.rows[0];

  if (!item) return null;

  const universalRaw = await searchMetadata(item.title);
  const kind = String(item.type || item.metadata?.category || '').toLowerCase();

  const allowAnime = kind.includes('anime');
  const allowSports = kind.includes('sport') || kind.includes('football') || kind.includes('nba');
  const allowBooks = kind.includes('book') || kind.includes('course') || kind.includes('curs');
  const allowMusic = kind.includes('music') || kind.includes('muzic');

  const universal = {
    ...universalRaw,
    jikan: allowAnime ? universalRaw.jikan : [],
    kitsu: allowAnime ? universalRaw.kitsu : [],
    sportsdb: allowSports ? universalRaw.sportsdb : [],
    openlibrary: allowBooks ? universalRaw.openlibrary : [],
    audiodb: allowMusic ? universalRaw.audiodb : [],
    lyrics: allowMusic ? universalRaw.lyrics : [],
    animechan: [],
    waifu: [],
    nekos: [],
    catboys: [],
  };

  const updated = await query(
    `
    UPDATE contents
    SET
      description = COALESCE(NULLIF($1, ''), description),
      poster = COALESCE(NULLIF($2, ''), poster),
      backdrop = COALESCE(NULLIF($3, ''), backdrop),
      metadata = COALESCE(metadata, '{}'::jsonb) || $4::jsonb
    WHERE id = $5
    RETURNING *
    `,
    [
      bestDescription(universal),
      firstImage(universal),
      firstBackdrop(universal),
      JSON.stringify({
        universal,
        enrichedAt: new Date().toISOString(),
        enrichmentSources: Object.fromEntries(
          Object.entries(universal).map(([k, v]) => [k, Array.isArray(v) ? v.length : 0])
        ),
      }),
      id,
    ]
  );

  return updated.rows[0];
}

router.get('/search', async (req, res) => {
  const q = req.query.q;
  const data = await searchMetadata(q);
  res.json(data);
});

router.post('/enrich-content/:id', async (req, res) => {
  try {
    const content = await enrichContentById(req.params.id);

    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }

    res.json({ ok: true, content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/enrich-all', async (_req, res) => {
  try {
    const result = await query('SELECT id FROM contents ORDER BY id DESC LIMIT 200');

    let updated = 0;
    let failed = 0;

    for (const row of result.rows) {
      try {
        const content = await enrichContentById(row.id);
        if (content) updated += 1;
      } catch {
        failed += 1;
      }
    }

    res.json({ ok: true, updated, failed, total: result.rows.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/title/:source/:id', async (req, res) => {
  const { source, id } = req.params;
  const decodedId = decodeURIComponent(id);

  try {
    if (source === 'tmdb' && process.env.TMDB_API_KEY) {
      const url = `https://api.themoviedb.org/3/movie/${decodedId}?api_key=${process.env.TMDB_API_KEY}&language=ro-RO`;
      const data = await fetch(url).then((r) => r.json());

      const title = data.title || data.original_title || `TMDB #${decodedId}`;
      const year = data.release_date?.slice(0, 4) || '';
      const trailerUrl = await findYoutubeTrailer(title, year);

      return res.json({
        id: data.id || decodedId,
        source,
        title,
        description: data.overview || 'Descriere indisponibilă.',
        year,
        rating: data.vote_average || null,
        runtime: data.runtime ? `${data.runtime} min` : null,
        genres: data.genres?.map((g) => g.name) || [],
        poster: data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : null,
        backdrop: data.backdrop_path ? `https://image.tmdb.org/t/p/original${data.backdrop_path}` : null,
        trailerUrl,
      });
    }

    if (source === 'omdb' && process.env.OMDB_API_KEY) {
      const url = `https://www.omdbapi.com/?apikey=${process.env.OMDB_API_KEY}&i=${decodedId}`;
      const data = await fetch(url).then((r) => r.json());

      const title = data.Title || `OMDb #${decodedId}`;
      const year = data.Year || '';
      const trailerUrl = await findYoutubeTrailer(title, year);

      return res.json({
        id: data.imdbID || decodedId,
        source,
        title,
        description: data.Plot || 'Descriere indisponibilă.',
        year,
        rating: data.imdbRating || null,
        runtime: data.Runtime || null,
        genres: data.Genre ? data.Genre.split(',').map((x) => x.trim()) : [],
        poster: data.Poster && data.Poster !== 'N/A' ? data.Poster : null,
        backdrop: null,
        trailerUrl,
      });
    }

    const title = decodedId.replaceAll('-', ' ');
    const trailerUrl = await findYoutubeTrailer(title, '2025');

    return res.json({
      id: decodedId,
      source,
      title,
      description: 'Metadata StreamVerse generată din sursele disponibile.',
      year: '2025',
      rating: '9.1',
      runtime: '128 min',
      genres: ['Action', 'Drama'],
      poster: null,
      backdrop: null,
      trailerUrl,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Metadata title lookup failed' });
  }
});

export default router;
