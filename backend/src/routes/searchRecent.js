import express from 'express';

const router = express.Router();

let recentSearches = [];

router.get('/', (_req, res) => {
  res.json({ items: recentSearches });
});

router.post('/', (req, res) => {
  const items = Array.isArray(req.body?.items) ? req.body.items : [];

  recentSearches = items
    .filter((x) => typeof x === 'string')
    .map((x) => x.trim())
    .filter(Boolean)
    .slice(0, 10);

  res.json({ ok: true, items: recentSearches });
});

router.delete('/', (_req, res) => {
  recentSearches = [];
  res.json({ ok: true, items: [] });
});

export default router;
