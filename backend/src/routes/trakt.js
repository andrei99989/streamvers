import express from 'express';

const router = express.Router();

const TRAKT_API = 'https://api.trakt.tv';

function headers() {
  if (!process.env.TRAKT_CLIENT_ID) {
    throw new Error('TRAKT_CLIENT_ID lipsește din .env');
  }

  return {
    'Content-Type': 'application/json',
    'trakt-api-version': '2',
    'trakt-api-key': process.env.TRAKT_CLIENT_ID
  };
}

async function traktFetch(path) {
  const res = await fetch(`${TRAKT_API}${path}`, {
    headers: headers()
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Trakt error ${res.status}: ${text}`);
  }

  return res.json();
}

router.get('/trending/movies', async (req, res) => {
  try {
    const limit = Number(req.query.limit || 20);
    const data = await traktFetch(`/movies/trending?limit=${limit}`);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/popular/movies', async (req, res) => {
  try {
    const limit = Number(req.query.limit || 20);
    const data = await traktFetch(`/movies/popular?limit=${limit}`);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/trending/shows', async (req, res) => {
  try {
    const limit = Number(req.query.limit || 20);
    const data = await traktFetch(`/shows/trending?limit=${limit}`);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/popular/shows', async (req, res) => {
  try {
    const limit = Number(req.query.limit || 20);
    const data = await traktFetch(`/shows/popular?limit=${limit}`);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/search', async (req, res) => {
  try {
    const q = String(req.query.q || '');
    const limit = Number(req.query.limit || 20);

    if (!q) return res.json([]);

    const data = await traktFetch(`/search/movie,show?query=${encodeURIComponent(q)}&limit=${limit}`);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
