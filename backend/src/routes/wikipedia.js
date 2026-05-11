import express from 'express';

const router = express.Router();

const WIKI_API = 'https://en.wikipedia.org/api/rest_v1';
const WIKI_SEARCH = 'https://en.wikipedia.org/w/api.php';

router.get('/summary', async (req, res) => {
  try {
    const title = String(req.query.title || '');
    if (!title) return res.status(400).json({ error: 'title lipsește' });

    const response = await fetch(`${WIKI_API}/page/summary/${encodeURIComponent(title)}`);
    const data = await response.json();

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/search', async (req, res) => {
  try {
    const q = String(req.query.q || '');
    if (!q) return res.json({ query: q, results: [] });

    const url =
      `${WIKI_SEARCH}?action=query&list=search&srsearch=${encodeURIComponent(q)}` +
      `&format=json&origin=*`;

    const response = await fetch(url);
    const data = await response.json();

    res.json({
      query: q,
      results: data?.query?.search || []
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
