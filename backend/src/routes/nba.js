import express from 'express';

const router = express.Router();

const NBA_API = 'https://api.balldontlie.io/v1';

function headers() {
  const h = { 'Content-Type': 'application/json' };

  if (process.env.BALLDONTLIE_API_KEY) {
    h.Authorization = process.env.BALLDONTLIE_API_KEY;
  }

  return h;
}

async function nbaFetch(path) {
  const res = await fetch(`${NBA_API}${path}`, {
    headers: headers()
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(JSON.stringify(data));
  }

  return data;
}

router.get('/teams', async (_req, res) => {
  try {
    const data = await nbaFetch('/teams');
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/players', async (req, res) => {
  try {
    const q = String(req.query.q || '');
    const data = await nbaFetch(`/players?search=${encodeURIComponent(q)}&per_page=25`);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/games', async (req, res) => {
  try {
    const season = req.query.season || '2025';
    const data = await nbaFetch(`/games?seasons[]=${season}&per_page=25`);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
