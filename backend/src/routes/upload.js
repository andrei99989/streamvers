import { Router } from 'express';
import { query } from '../db/postgres.js';

const router = Router();

function detectSourceType(url = '') {
  const value = url.toLowerCase();

  if (
    value.includes('youtube.com') ||
    value.includes('youtu.be') ||
    value.includes('youtube-nocookie.com')
  ) return 'youtube';
  if (value.includes('vimeo.com')) return 'vimeo';
  if (value.includes('dailymotion.com') || value.includes('dai.ly')) return 'dailymotion';
  if (value.includes('tiktok.com')) return 'tiktok';
  if (value.includes('rumble.com')) return 'rumble';
  if (value.includes('terabox.com')) return 'terabox';
  if (value.endsWith('.m3u8')) return 'hls';
  if (value.endsWith('.mp4')) return 'mp4';
  if (value.endsWith('.webm')) return 'webm';

  return 'external';
}

router.post('/', async (req, res) => {
  const {
    title = 'Untitled',
    description = '',
    url = '',
    poster = '',
    category = 'custom',
    metadata = {},
  } = req.body || {};

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  const content = await query(
    `
    INSERT INTO contents (title, description, poster, type, metadata)
    VALUES ($1,$2,$3,$4,$5)
    RETURNING *
    `,
    [
      title,
      description,
      poster,
      category,
      {
        ...metadata,
        createdFrom: 'upload-api',
      },
    ]
  );

  const sourceType = detectSourceType(url);

  const source = await query(
    `
    INSERT INTO sources (content_id, url, embed_url, source_type, provider, quality, language, is_primary, metadata)
    VALUES ($1,$2,$3,$4,$5,$6,$7,true,$8)
    RETURNING *
    `,
    [
      content.rows[0].id,
      url,
      url,
      sourceType,
      sourceType,
      'auto',
      'ro',
      {
        ...metadata,
        category,
        createdFrom: 'upload-api',
      },
    ]
  );

  res.status(201).json({
    ...content.rows[0],
    source: source.rows[0],
  });
});

export default router;
