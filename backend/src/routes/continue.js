import { Router } from 'express';
import { query } from '../db/postgres.js';

const router = Router();

async function ensureTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS continue_watching (
      id SERIAL PRIMARY KEY,
      source_id TEXT UNIQUE,
      content_id TEXT,
      title TEXT NOT NULL,
      url TEXT,
      provider TEXT,
      source_type TEXT,
      poster TEXT,
      progress INTEGER DEFAULT 1,
      duration INTEGER DEFAULT 0,
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      metadata JSONB DEFAULT '{}'::jsonb
    )
  `);
}

router.get('/', async (_req, res) => {
  try {
    await ensureTable();

    const result = await query(`
      SELECT *
      FROM continue_watching
      ORDER BY updated_at DESC
      LIMIT 200
    `);

    res.json({ items: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  const incomingSourceId = req.body.sourceId || req.body.source_id;
  const incomingTitle = req.body.title;
  const incomingUrl = req.body.url;

  if (!incomingSourceId || !incomingTitle || !incomingUrl) {
    return res.status(400).json({
      ok: false,
      error: 'Invalid continue payload',
    });
  }
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
      INSERT INTO continue_watching
      (source_id, content_id, title, url, provider, source_type, poster, progress, duration, metadata)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      ON CONFLICT (source_id)
      DO UPDATE SET
        content_id = EXCLUDED.content_id,
        title = EXCLUDED.title,
        url = EXCLUDED.url,
        provider = EXCLUDED.provider,
        source_type = EXCLUDED.source_type,
        poster = EXCLUDED.poster,
        progress = EXCLUDED.progress,
        duration = EXCLUDED.duration,
        metadata = EXCLUDED.metadata,
        updated_at = NOW()
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
    await query('DELETE FROM continue_watching WHERE id::text = $1 OR source_id::text = $1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/', async (_req, res) => {
  try {
    await ensureTable();
    await query('DELETE FROM continue_watching');
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
