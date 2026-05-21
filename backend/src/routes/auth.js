import { Router } from 'express';
import { query } from '../db/postgres.js';

const router = Router();

async function ensureProfiles() {
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

router.get('/me', async (_req, res) => {
  await ensureProfiles();

  const result = await query(`
    SELECT * FROM profiles
    ORDER BY created_at ASC
    LIMIT 1
  `);

  res.json({
    user: result.rows[0] || {
      id: null,
      name: 'StreamVerse User',
      type: 'guest',
    },
  });
});

router.get('/providers', (_req, res) => {
  res.json({ providers: ['email'], oauthEnabled: false });
});

export default router;
