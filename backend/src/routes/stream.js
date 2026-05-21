import { Router } from 'express';
import { query } from '../db/postgres.js';

const router = Router();

router.get('/:id', async (req, res) => {
  const result = await query(
    `
    SELECT
      s.*,
      c.title,
      c.description,
      c.poster,
      c.backdrop,
      c.type AS content_type,
      c.metadata AS content_metadata
    FROM sources s
    LEFT JOIN contents c ON c.id = s.content_id
    WHERE s.id = $1
    `,
    [req.params.id]
  );

  if (!result.rows[0]) {
    return res.status(404).json({ error: 'Stream not found' });
  }

  res.json(result.rows[0]);
});

export default router;
