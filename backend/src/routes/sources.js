import { Router } from 'express';
import { query } from '../db/postgres.js';
import { getSourceThumbnail } from '../utils/thumbnails.js';

const router = Router();

let fallbackSources = [];

function detectProvider(url = '') {
  const clean = String(url).toLowerCase();

  if (clean.includes('youtube.com') || clean.includes('youtu.be')) return 'youtube';
  if (clean.includes('vimeo.com')) return 'vimeo';
  if (clean.includes('dailymotion.com') || clean.includes('dai.ly')) return 'dailymotion';
  if (clean.includes('tiktok.com')) return 'tiktok';
  if (clean.includes('terabox.com') || clean.includes('1024tera.com')) return 'terabox';
  if (clean.includes('rumble.com')) return 'rumble';
  if (clean.includes('twitch.tv')) return 'twitch';
  if (clean.includes('drive.google.com')) return 'google-drive';
  if (clean.endsWith('.m3u8')) return 'hls';
  if (clean.endsWith('.mp4')) return 'mp4';
  if (clean.endsWith('.webm')) return 'webm';

  return 'unknown';
}

function detectType(url = '') {
  const clean = String(url).toLowerCase();

  if (clean.endsWith('.m3u8')) return 'hls';
  if (clean.endsWith('.mp4')) return 'mp4';
  if (clean.endsWith('.webm')) return 'webm';

  return 'iframe';
}

function normalizeSourceType(provider, type) {
  if (['mp4', 'webm', 'hls'].includes(type)) return type;
  return provider || 'iframe';
}

async function ensureColumns() {
  await query(`ALTER TABLE contents ADD COLUMN IF NOT EXISTS poster TEXT`);
  await query(`ALTER TABLE contents ADD COLUMN IF NOT EXISTS backdrop TEXT`);
  await query(`ALTER TABLE contents ADD COLUMN IF NOT EXISTS description TEXT`);
  await query(`ALTER TABLE contents ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb`);
}

router.get('/', async (_req, res) => {
  try {
    await ensureColumns();

    const result = await query(`
      SELECT
        s.id,
        s.content_id,
        c.title,
        c.description,
        c.poster,
        c.backdrop,
        c.type AS content_type,
        c.metadata,
        s.url,
        s.url AS embed_url,
        s.source_type AS type,
        s.source_type AS provider,
        s.quality,
        s.language,
        s.is_primary,
        s.created_at
      FROM sources s
      LEFT JOIN contents c ON c.id = s.content_id
      ORDER BY s.created_at DESC
      LIMIT 300
    `);

    res.json({ items: result.rows });
  } catch (error) {
    console.error(error);
    res.json({ items: fallbackSources, fallback: true });
  }
});

router.post('/', async (req, res) => {
  const {
    title,
    url,
    embedUrl,
    provider,
    type,
    category,
    quality,
    language,
    poster,
    backdrop,
    description,
  } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL lipsă' });
  }

  const finalProvider = provider || detectProvider(url);
  const finalType = type || detectType(url);
  const finalSourceType = normalizeSourceType(finalProvider, finalType);
  const finalPoster = poster || getSourceThumbnail(url) || '';
  const finalTitle = title || `${finalProvider.toUpperCase()} Source`;
  const finalCategory = category || 'custom';

  const metadata = {
    provider: finalProvider,
    sourceType: finalSourceType,
    inputType: finalType,
    category: finalCategory,
    thumbnail: finalPoster,
    createdFrom: 'sources-api',
  };

  try {
    await ensureColumns();

    const content = await query(
      `
      INSERT INTO contents
      (title, description, poster, backdrop, type, metadata)
      VALUES ($1,$2,$3,$4,$5,$6)
      RETURNING *
      `,
      [
        finalTitle,
        description || '',
        finalPoster,
        backdrop || '',
        finalCategory,
        metadata,
      ]
    );

    const contentId = content.rows[0].id;

    const result = await query(
      `
      INSERT INTO sources
      (content_id, url, source_type, is_primary, quality, language)
      VALUES ($1,$2,$3,$4,$5,$6)
      RETURNING *
      `,
      [
        contentId,
        embedUrl || url,
        finalSourceType,
        true,
        quality || 'auto',
        language || 'ro',
      ]
    );

    res.status(201).json({
      id: result.rows[0].id,
      contentId,
      content_id: contentId,
      title: content.rows[0].title,
      description: content.rows[0].description,
      poster: content.rows[0].poster,
      backdrop: content.rows[0].backdrop,
      metadata: content.rows[0].metadata,
      url: result.rows[0].url,
      embedUrl: result.rows[0].url,
      embed_url: result.rows[0].url,
      provider: finalProvider,
      type: finalSourceType,
      source_type: finalSourceType,
      category: finalCategory,
      quality: result.rows[0].quality,
      language: result.rows[0].language,
      createdAt: result.rows[0].created_at,
    });
  } catch (error) {
    console.error(error);

    const item = {
      id: crypto.randomUUID(),
      title: finalTitle,
      description: description || '',
      poster: finalPoster,
      backdrop: backdrop || '',
      metadata,
      url,
      embedUrl: embedUrl || url,
      embed_url: embedUrl || url,
      provider: finalProvider,
      type: finalSourceType,
      source_type: finalSourceType,
      category: finalCategory,
      quality: quality || 'auto',
      language: language || 'ro',
      createdAt: new Date().toISOString(),
    };

    fallbackSources.unshift(item);
    res.status(201).json({ ...item, fallback: true });
  }
});



router.post('/migrate-provider', async (_req, res) => {
  await query(`ALTER TABLE sources ADD COLUMN IF NOT EXISTS provider TEXT DEFAULT ''`);
  await query(`UPDATE sources SET provider = source_type WHERE provider = '' OR provider IS NULL`);

  res.json({ ok: true });
});


router.post('/normalize-thumbnails', async (_req, res) => {
  try {
    await query(`ALTER TABLE sources ADD COLUMN IF NOT EXISTS poster TEXT DEFAULT ''`);

    const result = await query(`
      UPDATE sources
      SET poster =
        CASE
          WHEN url ILIKE '%/embed/%'
            THEN 'https://img.youtube.com/vi/' || split_part(split_part(url, '/embed/', 2), '?', 1) || '/hqdefault.jpg'
          WHEN url ILIKE '%watch?v=%'
            THEN 'https://img.youtube.com/vi/' || split_part(split_part(url, 'watch?v=', 2), '&', 1) || '/hqdefault.jpg'
          WHEN url ILIKE '%youtu.be/%'
            THEN 'https://img.youtube.com/vi/' || split_part(split_part(url, 'youtu.be/', 2), '?', 1) || '/hqdefault.jpg'
          ELSE poster
        END
      WHERE
        source_type = 'youtube'
        AND (poster IS NULL OR poster = '')
      RETURNING *
    `);

    res.json({
      ok: true,
      updated: result.rowCount,
      items: result.rows,
    });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Thumbnail normalize failed' });
  }
});

router.post('/normalize', async (_req, res) => {
  try {
    const result = await query(`
      UPDATE sources
      SET source_type = 'youtube', provider = 'youtube'
      WHERE
        (
          url ILIKE '%youtube.com%' OR
          url ILIKE '%youtu.be%' OR
          url ILIKE '%youtube-nocookie.com%'
        )
        AND source_type IS DISTINCT FROM 'youtube'
      RETURNING *
    `);

    res.json({
      ok: true,
      updated: result.rowCount,
      items: result.rows,
    });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Normalize failed' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    await ensureColumns();

    const result = await query(
      `
      SELECT
        s.id,
        s.content_id,
        c.title,
        c.description,
        c.poster,
        c.backdrop,
        c.type AS content_type,
        c.metadata,
        s.url,
        s.url AS embed_url,
        s.source_type AS type,
        s.source_type AS provider,
        s.quality,
        s.language,
        s.is_primary,
        s.created_at
      FROM sources s
      LEFT JOIN contents c ON c.id = s.content_id
      WHERE s.id = $1
      LIMIT 1
      `,
      [req.params.id]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ error: 'Source not found' });
    }

    res.json(result.rows[0]);
  } catch {
    const item = fallbackSources.find((x) => String(x.id) === String(req.params.id));

    if (!item) {
      return res.status(404).json({ error: 'Source not found' });
    }

    res.json(item);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await query('DELETE FROM sources WHERE id = $1', [req.params.id]);
    res.json({ ok: true });
  } catch {
    fallbackSources = fallbackSources.filter((x) => String(x.id) !== String(req.params.id));
    res.json({ ok: true, fallback: true });
  }
});

export default router;
