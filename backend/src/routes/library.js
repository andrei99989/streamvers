import { Router } from 'express';
import { query } from '../db/postgres.js';

const router = Router();

async function ensureLibrary() {
  await query(`
    CREATE TABLE IF NOT EXISTS library (
      id SERIAL PRIMARY KEY,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await query(`ALTER TABLE library ADD COLUMN IF NOT EXISTS source_id INTEGER`);
  await query(`ALTER TABLE library ADD COLUMN IF NOT EXISTS content_id INTEGER`);
  await query(`ALTER TABLE library ADD COLUMN IF NOT EXISTS title TEXT DEFAULT 'Untitled'`);
  await query(`ALTER TABLE library ADD COLUMN IF NOT EXISTS url TEXT DEFAULT ''`);
  await query(`ALTER TABLE library ADD COLUMN IF NOT EXISTS provider TEXT DEFAULT ''`);
  await query(`ALTER TABLE library ADD COLUMN IF NOT EXISTS poster TEXT DEFAULT ''`);
  await query(`ALTER TABLE library ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb`);
}


router.get('/', async (_req, res) => {
  await ensureLibrary();

  const result = await query(`
    SELECT *
    FROM library
    ORDER BY created_at DESC
  `);

  res.json({ items: result.rows });
});

router.post('/', async (req, res) => {
  await ensureLibrary();

  const {
    sourceId,
    contentId,
    title = 'Untitled',
    url = '',
    provider = '',
    poster = '',
    metadata = {},
  } = req.body || {};

  const result = await query(
    `
    INSERT INTO library (source_id, content_id, title, url, provider, poster, metadata)
    VALUES ($1,$2,$3,$4,$5,$6,$7)
    RETURNING *
    `,
    [
      sourceId || null,
      contentId || null,
      title,
      url,
      provider,
      poster,
      metadata,
    ]
  );

  res.status(201).json(result.rows[0]);
});

router.delete('/:id', async (req, res) => {
  await ensureLibrary();

  await query('DELETE FROM library WHERE id = $1', [req.params.id]);

  res.json({ ok: true });
});

export default router;
