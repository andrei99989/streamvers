import { Router } from 'express';
import { query } from '../db/postgres.js';

const router = Router();

async function ensureTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS profiles (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      avatar TEXT DEFAULT '',
      type TEXT DEFAULT 'adult',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
}

router.get('/', async (_req, res) => {
  await ensureTable();
  const result = await query('SELECT * FROM profiles ORDER BY created_at DESC');
  res.json({ items: result.rows });
});

router.post('/', async (req, res) => {
  await ensureTable();
  const { name, avatar, type } = req.body;

  const result = await query(
    `INSERT INTO profiles (name, avatar, type)
     VALUES ($1,$2,$3)
     RETURNING *`,
    [name || 'Profile', avatar || '', type || 'adult']
  );

  res.status(201).json(result.rows[0]);
});

router.delete('/:id', async (req, res) => {
  await ensureTable();
  await query('DELETE FROM profiles WHERE id = $1', [req.params.id]);
  res.json({ ok: true });
});

export default router;
