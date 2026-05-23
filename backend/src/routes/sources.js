import { Router } from 'express';
import crypto from 'crypto';
import { query } from '../db/postgres.js';
import { getSourceThumbnail } from '../utils/thumbnails.js';
import { enrichWithTmdb } from '../services/tmdbService.js';

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

  if (clean.includes('youtube.com') || clean.includes('youtu.be')) return 'iframe';
  if (clean.includes('vimeo.com')) return 'iframe';
  if (clean.includes('dailymotion.com') || clean.includes('dai.ly')) return 'iframe';
  if (clean.includes('tiktok.com')) return 'iframe';
  if (clean.includes('terabox.com') || clean.includes('1024tera.com')) return 'iframe';
  if (clean.includes('rumble.com')) return 'iframe';
  if (clean.endsWith('.m3u8')) return 'hls';
  if (clean.endsWith('.mp4')) return 'mp4';
  if (clean.endsWith('.webm')) return 'webm';

  return 'external';
}

function normalizeSourceType(_provider, type) {
  if (['mp4', 'webm', 'hls', 'iframe', 'external'].includes(type)) return type;
  return 'external';
}

function normalizeText(value = '') {
  return String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function canonicalUrl(url = '') {
  try {
    const u = new URL(String(url).trim());
    u.hash = '';
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid', 'gclid'].forEach((p) => {
      u.searchParams.delete(p);
    });
    return u.toString().replace(/\/$/, '');
  } catch {
    return String(url || '').trim();
  }
}

function buildContentKey({ title, category, year, tmdbId, imdbId }) {
  if (tmdbId) return `tmdb:${tmdbId}`;
  if (imdbId) return `imdb:${imdbId}`;
  return `title:${normalizeText(title)}|category:${normalizeText(category)}|year:${year || ''}`;
}

async function ensureColumns() {
  await query(`ALTER TABLE contents ADD COLUMN IF NOT EXISTS poster TEXT`);
  await query(`ALTER TABLE contents ADD COLUMN IF NOT EXISTS backdrop TEXT`);
  await query(`ALTER TABLE contents ADD COLUMN IF NOT EXISTS description TEXT`);
  await query(`ALTER TABLE contents ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb`);
  await query(`ALTER TABLE contents ADD COLUMN IF NOT EXISTS content_key TEXT`);
  await query(`ALTER TABLE contents ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ`);
  await query(`ALTER TABLE sources ADD COLUMN IF NOT EXISTS canonical_url TEXT`);
  await query(`CREATE INDEX IF NOT EXISTS idx_contents_content_key ON contents(content_key)`);
  await query(`CREATE INDEX IF NOT EXISTS idx_sources_canonical_url ON sources(canonical_url)`);
}

router.get('/', async (req, res) => {
  try {
    await ensureColumns();

    const limit = Math.min(Math.max(parseInt(req.query.limit || '20', 10), 1), 100);

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
        jsonb_build_object('category', c.metadata->>'category', 'thumbnail', c.metadata->>'thumbnail', 'provider', c.metadata->>'provider') AS metadata,
        c.content_key,
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
      WHERE c.deleted_at IS NULL OR c.deleted_at IS NULL
      ORDER BY s.created_at DESC
      LIMIT $1
      `,
      [limit]
    );

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
    year,
    forceDuplicate = false,
  } = req.body;

  if (!url) return res.status(400).json({ error: 'URL lipsă' });

  const finalProvider = provider || detectProvider(url);
  const finalType = type || detectType(url);
  const finalSourceType = normalizeSourceType(finalProvider, finalType);
  const finalTitle = title || `${finalProvider.toUpperCase()} Source`;
  const finalCategory = category || 'custom';
  const finalUrl = embedUrl || url;
  const finalCanonicalUrl = canonicalUrl(finalUrl);

  const tmdb = await enrichWithTmdb(finalTitle, finalCategory).catch(() => null);

  const tmdbId = tmdb?.metadata?.tmdbId || tmdb?.metadata?.id || tmdb?.id || null;
  const imdbId = tmdb?.metadata?.imdbId || tmdb?.metadata?.imdb_id || null;
  const finalYear = year || tmdb?.year || tmdb?.metadata?.year || '';

  const contentKey = buildContentKey({
    title: finalTitle,
    category: finalCategory,
    year: finalYear,
    tmdbId,
    imdbId,
  });

  const finalPoster = poster || tmdb?.poster || getSourceThumbnail(url) || '';
  const finalBackdrop = backdrop || tmdb?.backdrop || '';
  const finalDescription = description || tmdb?.description || '';

  const metadata = {
    provider: finalProvider,
    sourceType: finalSourceType,
    inputType: finalType,
    category: finalCategory,
    year: finalYear,
    tmdbId,
    imdbId,
    contentKey,
    canonicalUrl: finalCanonicalUrl,
    thumbnail: finalPoster,
    createdFrom: 'sources-api',
    ...(tmdb?.metadata || {}),
  };

  try {
    await ensureColumns();

    if (!forceDuplicate) {
      const duplicate = await query(
        `
        SELECT
          c.id AS content_id,
          c.title,
          c.type,
          c.poster,
          c.description,
          c.content_key,
          s.id AS source_id,
          s.url
        FROM contents c
        LEFT JOIN sources s ON s.content_id = c.id
        WHERE c.deleted_at IS NULL
          AND (
            c.content_key = $1
            OR s.canonical_url = $2
            OR lower(c.title) = lower($3)
          )
        LIMIT 1
        `,
        [contentKey, finalCanonicalUrl, finalTitle]
      );

      if (duplicate.rows.length > 0) {
        return res.status(409).json({
          error: 'DUPLICATE_CONTENT',
          message: 'Acest content există deja în platformă. Șterge contentul existent dacă vrei să îl încarci din nou.',
          duplicate: duplicate.rows[0],
        });
      }
    }

    const content = await query(
      `
      INSERT INTO contents
      (title, description, poster, backdrop, type, metadata, content_key)
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      RETURNING *
      `,
      [finalTitle, finalDescription, finalPoster, finalBackdrop, tmdb?.type || finalCategory, metadata, contentKey]
    );

    const contentId = content.rows[0].id;

    const result = await query(
      `
      INSERT INTO sources
      (content_id, url, canonical_url, source_type, is_primary, quality, language)
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      RETURNING *
      `,
      [contentId, finalUrl, finalCanonicalUrl, finalSourceType, true, quality || 'auto', language || 'ro']
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
      content_key: contentKey,
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
      embedUrl: finalUrl,
      embed_url: finalUrl,
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
      WHERE source_type = 'youtube'
        AND (poster IS NULL OR poster = '')
      RETURNING *
    `);

    res.json({ ok: true, updated: result.rowCount, items: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Thumbnail normalize failed' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await ensureColumns();

    const source = await query(`SELECT content_id FROM sources WHERE id = $1 LIMIT 1`, [req.params.id]);
    await query(`DELETE FROM sources WHERE id = $1`, [req.params.id]);

    if (source.rows[0]?.content_id) {
      await query(`UPDATE contents SET deleted_at = NOW() WHERE id = $1`, [source.rows[0].content_id]);
    }

    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Delete failed' });
  }
});

export default router;
