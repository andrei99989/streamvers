import express from 'express';
import { query } from '../db/postgres.js';

const router = express.Router();

function detectSourceType(url = '') {
  const clean = String(url).toLowerCase();

  if (
    clean.includes('youtube.com') ||
    clean.includes('youtu.be') ||
    clean.includes('vimeo.com') ||
    clean.includes('dailymotion.com') ||
    clean.includes('rumble.com') ||
    clean.includes('tiktok.com') ||
    clean.includes('terabox.com')
  ) return 'iframe';

  if (clean.endsWith('.m3u8')) return 'hls';
  if (clean.endsWith('.mp4')) return 'mp4';
  if (clean.endsWith('.webm')) return 'webm';

  return 'iframe';
}

router.get('/contents', async (_req, res) => {
  try {
    const result = await query(`
      SELECT c.*,
        COALESCE(
          json_agg(s.*) FILTER (WHERE s.id IS NOT NULL),
          '[]'
        ) AS sources
      FROM contents c
      LEFT JOIN sources s ON s.content_id = c.id
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `);

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/contents', async (req, res) => {
  try {
    const {
      title,
      description,
      poster,
      backdrop,
      type,
      year,
      country,
      language,
      genres,
      metadata
    } = req.body;

    const result = await query(
      `
      INSERT INTO contents
      (title, description, poster, backdrop, type, year, country, language, genres, metadata)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING *
      `,
      [
        title || 'Fără titlu',
        description || '',
        poster || '',
        backdrop || '',
        type || 'movie',
        year || '',
        country || '',
        language || '',
        Array.isArray(genres) ? genres : [],
        metadata || {}
      ]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.patch('/contents/:id', async (req, res) => {
  try {
    const {
      title,
      description,
      poster,
      backdrop,
      type,
      year,
      country,
      language,
      genres,
      metadata
    } = req.body;

    const result = await query(
      `
      UPDATE contents
      SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        poster = COALESCE($3, poster),
        backdrop = COALESCE($4, backdrop),
        type = COALESCE($5, type),
        year = COALESCE($6, year),
        country = COALESCE($7, country),
        language = COALESCE($8, language),
        genres = COALESCE($9, genres),
        metadata = COALESCE($10, metadata)
      WHERE id = $11
      RETURNING *
      `,
      [
        title ?? null,
        description ?? null,
        poster ?? null,
        backdrop ?? null,
        type ?? null,
        year ?? null,
        country ?? null,
        language ?? null,
        Array.isArray(genres) ? genres : null,
        metadata ?? null,
        req.params.id
      ]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ error: 'Content inexistent' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get('/sources', async (_req, res) => {
  try {
    const result = await query(`
      SELECT s.*, c.title, c.poster, c.type
      FROM sources s
      LEFT JOIN contents c ON c.id = s.content_id
      ORDER BY s.created_at DESC
    `);

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/sources', async (req, res) => {
  try {
    const {
      contentId,
      title,
      url,
      sourceType,
      isPrimary,
      quality,
      language
    } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL lipsă' });
    }

    let finalContentId = contentId;

    if (!finalContentId) {
      const content = await query(
        `
        INSERT INTO contents (title, type, metadata)
        VALUES ($1, $2, $3)
        RETURNING *
        `,
        [
          title || 'Sursă fără titlu',
          'custom',
          { createdFrom: 'upload-url' }
        ]
      );

      finalContentId = content.rows[0].id;
    }

    const result = await query(
      `
      INSERT INTO sources
      (content_id, url, source_type, is_primary, quality, language)
      VALUES ($1,$2,$3,$4,$5,$6)
      RETURNING *
      `,
      [
        finalContentId,
        url,
        sourceType || detectSourceType(url),
        Boolean(isPrimary),
        quality || '',
        language || ''
      ]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/sources/:id', async (req, res) => {
  try {
    await query('DELETE FROM sources WHERE id = $1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
