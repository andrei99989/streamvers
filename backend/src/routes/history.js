import { Router } from 'express';
import { query } from '../db/postgres.js';

const router = Router();

async function ensureTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS watch_history (
      id SERIAL PRIMARY KEY,
      source_id TEXT,
      content_id TEXT,
      title TEXT NOT NULL,
      url TEXT,
      provider TEXT,
      source_type TEXT,
      poster TEXT,
      progress INTEGER DEFAULT 1,
      duration INTEGER DEFAULT 0,
      watched_at TIMESTAMPTZ DEFAULT NOW(),
      metadata JSONB DEFAULT '{}'::jsonb
    )
  `);
}

router.get('/', async (req, res) => {
  try {
    await ensureTable();

    const limit = Math.min(Math.max(parseInt(req.query.limit || '20', 10), 1), 100);

    const result = await query(`
      SELECT *
      FROM watch_history
      ORDER BY watched_at DESC
      LIMIT $1
    `, [limit]);

    res.json({ items: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    await ensureTable();

    const {
      sourceId,
      contentId,
      title,
      url,
      provider,
      sourceType,
      poster,
      progress,
      duration,
      metadata,
    } = req.body;

    const result = await query(
      `
      INSERT INTO watch_history
      (source_id, content_id, title, url, provider, source_type, poster, progress, duration, metadata)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING *
      `,
      [
        sourceId || '',
        contentId || '',
        title || 'Untitled',
        url || '',
        provider || '',
        sourceType || '',
        poster || '',
        Number(progress || 1),
        Number(duration || 0),
        metadata || {},
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await ensureTable();

    await query('DELETE FROM watch_history WHERE id = $1', [req.params.id]);

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/', async (_req, res) => {
  try {
    await ensureTable();

    await query('DELETE FROM watch_history');

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
