import express from 'express';

const router = express.Router();

const API = 'https://api.openligadb.de';

async function openLigaFetch(path) {
  const res = await fetch(`${API}${path}`);
  const data = await res.json();

  if (!res.ok) throw new Error(JSON.stringify(data));
  return data;
}

router.get('/leagues', async (_req, res) => {
  try {
    const data = await openLigaFetch('/getavailableleagues');
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/matches', async (req, res) => {
  try {
    const league = req.query.league || 'bl1';
    const season = req.query.season || '2025';
    const data = await openLigaFetch(`/getmatchdata/${league}/${season}`);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/teams', async (req, res) => {
  try {
    const league = req.query.league || 'bl1';
    const season = req.query.season || '2025';
    const data = await openLigaFetch(`/getavailableteams/${league}/${season}`);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
