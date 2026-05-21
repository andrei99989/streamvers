import { Router } from 'express';
import { query } from '../db/postgres.js';

const router = Router();

async function ensureTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS downloads (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      url TEXT,
      poster TEXT DEFAULT '',
      provider TEXT DEFAULT '',
      status TEXT DEFAULT 'saved',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      metadata JSONB DEFAULT '{}'::jsonb
    )
  `);
}

router.get('/', async (_req, res) => {
  await ensureTable();
  const result = await query('SELECT * FROM downloads ORDER BY created_at DESC');
  res.json({ items: result.rows });
});

router.post('/', async (req, res) => {
  await ensureTable();
  const { title, url, poster, provider, status, metadata } = req.body;

  const result = await query(
    `INSERT INTO downloads (title, url, poster, provider, status, metadata)
     VALUES ($1,$2,$3,$4,$5,$6)
     RETURNING *`,
    [
      title || 'Download',
      url || '',
      poster || '',
      provider || '',
      status || 'saved',
      metadata || {},
    ]
  );

  res.status(201).json(result.rows[0]);
});

router.delete('/:id', async (req, res) => {
  await ensureTable();
  await query('DELETE FROM downloads WHERE id = $1', [req.params.id]);
  res.json({ ok: true });
});

export default router;
