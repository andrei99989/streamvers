import { Router } from 'express';
import { query } from '../db/postgres.js';

const router = Router();

router.get('/recommendations', async (_req, res) => {
  const result = await query(`
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
      s.created_at
    FROM sources s
    LEFT JOIN contents c ON c.id = s.content_id
    ORDER BY s.created_at DESC
    LIMIT 24
  `);

  res.json({ items: result.rows });
});

router.post('/summarize', async (req, res) => {
  const { title, description, metadata } = req.body || {};

  res.json({
    summary: [
      title ? `Titlu: ${title}` : null,
      description ? `Descriere: ${description}` : null,
      metadata ? `Metadata disponibilă.` : null,
    ].filter(Boolean).join('\n') || 'Nu există suficiente date pentru sumar.',
  });
});

export default router;
