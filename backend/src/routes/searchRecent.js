import express from 'express';
import { query } from '../db/postgres.js';

const router = express.Router();

async function ensureTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS recent_searches (
      id SERIAL PRIMARY KEY,
      term TEXT UNIQUE NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
}

router.get('/', async (_req, res) => {
  try {
    await ensureTable();

    const result = await query(`
      SELECT term
      FROM recent_searches
      ORDER BY updated_at DESC
      LIMIT 10
    `);

    res.json({
      items: result.rows.map((row) => row.term),
    });
  } catch (error) {
    res.status(500).json({
      items: [],
      error: 'recent_searches_failed',
    });
  }
});

router.post('/', async (req, res) => {
  try {
    await ensureTable();

    const items = Array.isArray(req.body?.items) ? req.body.items : [];

    const clean = items
      .filter((x) => typeof x === 'string')
      .map((x) => x.trim())
      .filter(Boolean)
      .slice(0, 10);

    for (const term of clean) {
      await query(
        `
        INSERT INTO recent_searches (term, updated_at)
        VALUES ($1, NOW())
        ON CONFLICT (term)
        DO UPDATE SET updated_at = NOW()
        `,
        [term]
      );
    }

    const result = await query(`
      SELECT term
      FROM recent_searches
      ORDER BY updated_at DESC
      LIMIT 10
    `);

    res.json({
      ok: true,
      items: result.rows.map((row) => row.term),
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      items: [],
      error: 'recent_searches_save_failed',
    });
  }
});

router.delete('/', async (_req, res) => {
  try {
    await ensureTable();

    await query(`DELETE FROM recent_searches`);

    res.json({
      ok: true,
      items: [],
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: 'recent_searches_delete_failed',
    });
  }
});

export default router;
