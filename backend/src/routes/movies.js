import { Router } from 'express';
import { query } from '../db/postgres.js';

const router = Router();

router.get('/', async (_req, res) => {
  const result = await query(`
    SELECT
      c.id,
      c.title,
      c.description,
      c.poster,
      c.backdrop,
      c.type,
      c.metadata,
      c.created_at,
      COUNT(s.id)::int AS sources_count
    FROM contents c
    LEFT JOIN sources s ON s.content_id = c.id
    GROUP BY c.id
    ORDER BY c.created_at DESC
    LIMIT 100
  `);

  res.json({ items: result.rows });
});

router.get('/:id', async (req, res) => {
  const content = await query('SELECT * FROM contents WHERE id = $1', [req.params.id]);
  const sources = await query('SELECT * FROM sources WHERE content_id = $1 ORDER BY is_primary DESC, created_at DESC', [req.params.id]);

  if (!content.rows[0]) {
    return res.status(404).json({ error: 'Content not found' });
  }

  res.json({
    ...content.rows[0],
    sources: sources.rows,
  });
});

export default router;
