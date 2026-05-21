import { Router } from 'express';
import { query } from '../db/postgres.js';

const router = Router();

async function ensureTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS favorites (
      id SERIAL PRIMARY KEY,
      source_id TEXT UNIQUE,
      content_id TEXT,
      title TEXT NOT NULL,
      url TEXT,
      provider TEXT,
      source_type TEXT,
      poster TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      metadata JSONB DEFAULT '{}'::jsonb
    )
  `);
}

router.get('/', async (_req, res) => {
  try {
    await ensureTable();
    const result = await query(`SELECT * FROM favorites ORDER BY created_at DESC LIMIT 300`);
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
      metadata,
    } = req.body;

    const result = await query(
      `
      INSERT INTO favorites
      (source_id, content_id, title, url, provider, source_type, poster, metadata)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      ON CONFLICT (source_id)
      DO UPDATE SET
        title = EXCLUDED.title,
        url = EXCLUDED.url,
        provider = EXCLUDED.provider,
        source_type = EXCLUDED.source_type,
        poster = EXCLUDED.poster,
        metadata = EXCLUDED.metadata,
        created_at = NOW()
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
    const id = Number(req.params.id);

    if (!Number.isFinite(id)) {
      return res.status(400).json({ error: 'Invalid favorite id' });
    }

    await query('DELETE FROM favorites WHERE id = $1', [id]);

    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Delete favorite failed' });
  }
});

export default router;
