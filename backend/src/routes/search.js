import { Router } from 'express';
import { query } from '../db/postgres.js';

const router = Router();

function cleanLimit(value) {
  return Math.min(Math.max(parseInt(value || '20', 10), 1), 100);
}

router.get('/', async (req, res) => {
  try {
    const q = String(req.query.q || '').trim();
    const type = String(req.query.type || '').trim().toLowerCase();
    const provider = String(req.query.provider || '').trim().toLowerCase();
    const year = String(req.query.year || '').trim();
    const limit = cleanLimit(req.query.limit);

    if (!q && !type && !provider && !year) {
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
        jsonb_strip_nulls(jsonb_build_object(
          'category', c.metadata->>'category',
          'provider', c.metadata->>'provider',
          'year', c.metadata->>'year',
          'thumbnail', c.metadata->>'thumbnail',
          'contentKey', c.metadata->>'contentKey'
        )) AS metadata,
        c.content_key,
        s.url,
        s.url AS embed_url,
        s.source_type AS type,
        s.source_type AS provider,
        s.quality,
        s.language,
        s.created_at,
        (
          CASE WHEN lower(c.title) = lower($1) THEN 100 ELSE 0 END +
          CASE WHEN c.title ILIKE $2 THEN 50 ELSE 0 END +
          CASE WHEN c.content_key ILIKE $2 THEN 30 ELSE 0 END +
          CASE WHEN c.description ILIKE $2 THEN 10 ELSE 0 END +
          CASE WHEN s.url ILIKE $2 THEN 5 ELSE 0 END
        ) AS score
      FROM sources s
      LEFT JOIN contents c ON c.id = s.content_id
      WHERE
        ($1 = '' OR c.title ILIKE $2 OR c.description ILIKE $2 OR s.url ILIKE $2 OR c.content_key ILIKE $2)
        AND ($3 = '' OR lower(c.type) = $3 OR lower(c.metadata->>'category') = $3)
        AND ($4 = '' OR lower(s.source_type) = $4 OR lower(c.metadata->>'provider') = $4)
        AND ($5 = '' OR c.metadata->>'year' = $5)
      ORDER BY score DESC, s.created_at DESC
      LIMIT $6
      `,
      [q, `%${q}%`, type, provider, year, limit]
    );

    res.json({ items: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Search failed' });
  }
});

export default router;
