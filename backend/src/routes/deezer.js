import express from 'express';

const router = express.Router();

const DEEZER_API = 'https://api.deezer.com';

router.get('/search', async (req, res) => {
  try {
    const q = String(req.query.q || '');
    if (!q) return res.json({ data: [] });

    const response = await fetch(`${DEEZER_API}/search?q=${encodeURIComponent(q)}`);
    const data = await response.json();

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/artist/:id', async (req, res) => {
  try {
    const response = await fetch(`${DEEZER_API}/artist/${req.params.id}`);
    const data = await response.json();

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/artist/:id/top', async (req, res) => {
  try {
    const limit = Number(req.query.limit || 20);
    const response = await fetch(`${DEEZER_API}/artist/${req.params.id}/top?limit=${limit}`);
    const data = await response.json();

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/album/:id', async (req, res) => {
  try {
    const response = await fetch(`${DEEZER_API}/album/${req.params.id}`);
    const data = await response.json();

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
