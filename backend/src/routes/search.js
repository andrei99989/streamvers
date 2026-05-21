import { Router } from 'express';
import { query } from '../db/postgres.js';

const router = Router();

router.get('/', async (req, res) => {
  const q = String(req.query.q || '').trim();

  if (!q) {
    return res.json({ items: [] });
  }

  const result = await query(
    `
    SELECT
      s.id,
      s.content_id,
      c.title,
      c.description,
      c.poster,
      c.backdrop,
      c.type AS content_type,
      c.metadata,
      s.url,
      s.url AS embed_url,
      s.source_type AS type,
      s.source_type AS provider,
      s.quality,
      s.language,
      s.created_at
    FROM sources s
    LEFT JOIN contents c ON c.id = s.content_id
    WHERE
      c.title ILIKE $1 OR
      c.description ILIKE $1 OR
      s.url ILIKE $1 OR
      s.source_type ILIKE $1 OR
      c.type ILIKE $1
    ORDER BY s.created_at DESC
    LIMIT 80
    `,
    [`%${q}%`]
  );

  res.json({ items: result.rows });
});

export default router;
