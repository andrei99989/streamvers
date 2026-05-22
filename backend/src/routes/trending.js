import { Router } from 'express';
import { query } from '../db/postgres.js';

const router = Router();

function normalizeText(value = '') {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function dedupeTrendingItems(items) {
  const best = new Map();

  for (const item of items) {
    const key = normalizeText(item.title) || String(item.url || '').toLowerCase();
    if (!key) continue;

    const previous = best.get(key);

    const quality =
      Number(item.trending_score || 0) +
      (item.poster ? 5 : 0) +
      (item.description ? 2 : 0);

    const previousQuality = previous
      ? Number(previous.trending_score || 0) +
        (previous.poster ? 5 : 0) +
        (previous.description ? 2 : 0)
      : -999999;

    if (!previous || quality > previousQuality) {
      best.set(key, item);
    }
  }

  return [...best.values()];
}


router.get('/', async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit || 20), 50);

    const result = await query(`
      SELECT
        c.id,
        c.title,
        c.description,
        c.poster,
        c.backdrop,
        c.type AS content_type,
        COALESCE(NULLIF(s.provider, ''), s.source_type, 'source') AS provider,
        s.source_type AS type,
        s.url,
        s.url AS embed_url,
        s.created_at,

        (
          COALESCE(h.history_count, 0) * 8 +
          COALESCE(f.favorite_count, 0) * 15 +
          COALESCE(cw.continue_count, 0) * 10 +
          EXTRACT(EPOCH FROM NOW() - s.created_at) / -100000
        )::int AS trending_score

      FROM contents c
      JOIN sources s ON s.content_id = c.id

      LEFT JOIN (
        SELECT source_id, COUNT(*)::int AS history_count
        FROM watch_history
        GROUP BY source_id
      ) h ON h.source_id = s.id::text

      LEFT JOIN (
        SELECT source_id, COUNT(*)::int AS favorite_count
        FROM favorites
        GROUP BY source_id
      ) f ON f.source_id = s.id::text

      LEFT JOIN (
        SELECT source_id, COUNT(*)::int AS continue_count
        FROM continue_watching
        GROUP BY source_id
      ) cw ON cw.source_id = s.id::text

      ORDER BY trending_score DESC, s.created_at DESC
      LIMIT $1
    `, [limit]);

    const items = dedupeTrendingItems(result.rows).slice(0, limit);

    res.json({
      ok: true,
      total: items.length,
      generatedAt: new Date().toISOString(),
      items
    });
  } catch (error) {
    console.error('Trending error', error);

    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

export default router;
