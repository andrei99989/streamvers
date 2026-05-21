import { Router } from 'express';
import { query } from '../db/postgres.js';

const router = Router();

async function ensureTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS app_settings (
      id INTEGER PRIMARY KEY DEFAULT 1,
      settings JSONB DEFAULT '{}'::jsonb,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
}

router.get('/', async (_req, res) => {
  await ensureTable();

  const result = await query(`
    SELECT settings
    FROM app_settings
    WHERE id = 1
  `);

  res.json(result.rows[0]?.settings || {});
});

router.post('/', async (req, res) => {
  await ensureTable();

  const result = await query(
    `
    INSERT INTO app_settings (id, settings, updated_at)
    VALUES (1, $1, NOW())
    ON CONFLICT (id)
    DO UPDATE SET settings = EXCLUDED.settings, updated_at = NOW()
    RETURNING settings
    `,
    [req.body || {}]
  );

  res.json(result.rows[0].settings);
});

export default router;
