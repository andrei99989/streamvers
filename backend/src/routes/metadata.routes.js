import { Router } from 'express';
import { searchMetadata } from '../services/metadataService.js';

const router = Router();

router.get('/search', async (req, res) => {
  const q = req.query.q;
  const data = await searchMetadata(q);
  res.json(data);
});

router.get('/title/:source/:id', async (req, res) => {
  const { source, id } = req.params;
  const decodedId = decodeURIComponent(id);

  try {
    if (source === 'tmdb' && process.env.TMDB_API_KEY) {
      const url = `https://api.themoviedb.org/3/movie/${decodedId}?api_key=${process.env.TMDB_API_KEY}&language=ro-RO`;
      const data = await fetch(url).then((r) => r.json());

      return res.json({
        id: data.id || decodedId,
        source,
        title: data.title || data.original_title || `TMDB #${decodedId}`,
        description: data.overview || 'Descriere indisponibilă.',
        year: data.release_date?.slice(0, 4) || '',
        rating: data.vote_average || null,
        runtime: data.runtime || null,
        genres: data.genres?.map((g) => g.name) || [],
        poster: data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : null,
        backdrop: data.backdrop_path ? `https://image.tmdb.org/t/p/original${data.backdrop_path}` : null,
      });
    }

    if (source === 'omdb' && process.env.OMDB_API_KEY) {
      const url = `https://www.omdbapi.com/?apikey=${process.env.OMDB_API_KEY}&i=${decodedId}`;
      const data = await fetch(url).then((r) => r.json());

      return res.json({
        id: data.imdbID || decodedId,
        source,
        title: data.Title || `OMDb #${decodedId}`,
        description: data.Plot || 'Descriere indisponibilă.',
        year: data.Year || '',
        rating: data.imdbRating || null,
        runtime: data.Runtime || null,
        genres: data.Genre ? data.Genre.split(',').map((x) => x.trim()) : [],
        poster: data.Poster && data.Poster !== 'N/A' ? data.Poster : null,
        backdrop: null,
      });
    }

    return res.json({
      id: decodedId,
      source,
      title: decodedId.replaceAll('-', ' '),
      description: 'Titlu demo StreamVerse. Metadata reală va apărea când sursa este TMDB sau OMDb.',
      year: '2025',
      rating: '9.1',
      runtime: '128 min',
      genres: ['Action', 'Drama'],
      poster: null,
      backdrop: null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Metadata title lookup failed' });
  }
});

export default router;
