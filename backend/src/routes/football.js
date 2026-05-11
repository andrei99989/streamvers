import express from 'express';

const router = express.Router();

const FOOTBALL_API = 'https://api.football-data.org/v4';

function headers() {
  if (!process.env.FOOTBALL_DATA_API_KEY) {
    throw new Error('FOOTBALL_DATA_API_KEY lipsește din .env');
  }

  return {
    'X-Auth-Token': process.env.FOOTBALL_DATA_API_KEY
  };
}

async function footballFetch(path) {
  const res = await fetch(`${FOOTBALL_API}${path}`, { headers: headers() });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(JSON.stringify(data));
  }

  return data;
}

router.get('/competitions', async (_req, res) => {
  try {
    const data = await footballFetch('/competitions');
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/matches', async (req, res) => {
  try {
    const code = req.query.competition || 'PL';
    const data = await footballFetch(`/competitions/${code}/matches`);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/standings', async (req, res) => {
  try {
    const code = req.query.competition || 'PL';
    const data = await footballFetch(`/competitions/${code}/standings`);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
