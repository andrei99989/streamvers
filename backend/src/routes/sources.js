import { Router } from 'express';
import crypto from 'crypto';
import { query } from '../db/postgres.js';
import { createTranscodeJob } from './stream.js';
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


function buildPlayerIntelligence(source = {}) {
  const url = String(source.url || '').toLowerCase();
  const type = String(source.source_type || source.type || detectType(url)).toLowerCase();
  const provider = String(source.provider || detectProvider(url)).toLowerCase();

  const flags = [];
  const capabilities = [];

  if (type === 'hls' || url.includes('.m3u8')) {
    capabilities.push('HLS');
    flags.push('adaptive-stream');
  }

  if (type === 'mp4' || url.split('?')[0].endsWith('.mp4')) {
    capabilities.push('MP4');
    flags.push('direct-video');
  }

  if (type === 'webm' || url.split('?')[0].endsWith('.webm')) {
    capabilities.push('WEBM');
    flags.push('direct-video');
  }

  if (type === 'iframe' || ['youtube', 'vimeo', 'dailymotion', 'tiktok', 'rumble', 'terabox'].includes(provider)) {
    capabilities.push('EMBED');
    flags.push('iframe-player');
  }

  if (url.includes('/shorts/') || provider === 'tiktok') {
    capabilities.push('SHORTS');
    flags.push('short-form');
  }

  if (url.includes('/live') || url.includes('livestream') || url.includes('m3u8')) {
    capabilities.push('LIVE');
  }

  const isStreamable = ['mp4', 'webm', 'hls', 'iframe'].includes(type) || capabilities.includes('EMBED');
  const supportsSubtitles = ['mp4', 'webm', 'hls'].includes(type);

  let score = 50;
  if (isStreamable) score += 25;
  if (supportsSubtitles) score += 10;
  if (capabilities.includes('HLS')) score += 10;
  if (capabilities.includes('EMBED')) score += 5;
  if (type === 'external') score -= 20;

  score = Math.max(0, Math.min(100, score));

  return {
    capabilities: [...new Set(capabilities)],
    is_streamable: isStreamable,
    supports_subtitles: supportsSubtitles,
    player_score: score,
    player_flags: [...new Set(flags)],
    recommended_player:
      type === 'hls' ? 'hls' :
      ['mp4', 'webm'].includes(type) ? 'native' :
      capabilities.includes('EMBED') ? 'embed' :
      'external',
  };
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


async function ensureOptimizationLogsTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS source_optimization_logs (
      id BIGSERIAL PRIMARY KEY,
      steps JSONB DEFAULT '[]'::jsonb,
      summary JSONB DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
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


router.get('/health', async (_req, res) => {
  try {
    await ensureColumns();

    const summary = await query(`
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE status IS NULL OR status = 'active')::int AS active,
        COUNT(*) FILTER (WHERE status IS NOT NULL AND status <> 'active')::int AS inactive,
        COUNT(*) FILTER (WHERE poster IS NULL OR poster = '')::int AS missing_poster,
        COUNT(*) FILTER (WHERE source_type = 'external')::int AS external,
        COUNT(*) FILTER (WHERE source_type IN ('mp4', 'webm', 'hls', 'iframe'))::int AS streamable
      FROM sources
    `);

    const byProvider = await query(`
      SELECT COALESCE(provider, source_type, 'unknown') AS provider, COUNT(*)::int AS total
      FROM sources
      GROUP BY COALESCE(provider, source_type, 'unknown')
      ORDER BY total DESC
    `);

    const byType = await query(`
      SELECT COALESCE(source_type, 'unknown') AS type, COUNT(*)::int AS total
      FROM sources
      GROUP BY COALESCE(source_type, 'unknown')
      ORDER BY total DESC
    `);

    const quality = await query(`
      WITH scored AS (
        SELECT
          id,
          GREATEST(
            0,
            100
            - CASE WHEN status IS NOT NULL AND status <> 'active' THEN 45 ELSE 0 END
            - CASE WHEN poster IS NULL OR poster = '' THEN 15 ELSE 0 END
            - CASE WHEN source_type = 'external' THEN 20 ELSE 0 END
            + CASE WHEN source_type IN ('mp4', 'webm', 'hls', 'iframe') THEN 10 ELSE 0 END
            + CASE WHEN provider IS NOT NULL AND provider <> '' THEN 5 ELSE 0 END
          )::int AS quality_score
        FROM sources
      )
      SELECT
        COALESCE(ROUND(AVG(quality_score))::int, 0) AS avg_score,
        COUNT(*) FILTER (WHERE quality_score >= 90)::int AS excellent,
        COUNT(*) FILTER (WHERE quality_score < 70)::int AS needs_fix
      FROM scored
    `);

    const worstSources = await query(`
      SELECT
        id,
        COALESCE(provider, source_type, 'unknown') AS provider,
        COALESCE(source_type, 'unknown') AS type,
        CASE WHEN poster IS NULL OR poster = '' THEN true ELSE false END AS missing_poster,
        GREATEST(
          0,
          100
          - CASE WHEN status IS NOT NULL AND status <> 'active' THEN 45 ELSE 0 END
          - CASE WHEN poster IS NULL OR poster = '' THEN 15 ELSE 0 END
          - CASE WHEN source_type = 'external' THEN 20 ELSE 0 END
          + CASE WHEN source_type IN ('mp4', 'webm', 'hls', 'iframe') THEN 10 ELSE 0 END
          + CASE WHEN provider IS NOT NULL AND provider <> '' THEN 5 ELSE 0 END
        )::int AS quality_score
      FROM sources
      ORDER BY quality_score ASC, id DESC
      LIMIT 8
    `);

    res.json({
      ok: true,
      summary: summary.rows[0] || {
        total: 0,
        active: 0,
        inactive: 0,
        missing_poster: 0,
        external: 0,
        streamable: 0,
      },
      quality: quality.rows[0] || {
        avg_score: 0,
        excellent: 0,
        needs_fix: 0,
      },
      worstSources: worstSources.rows,
      byProvider: byProvider.rows,
      byType: byType.rows,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('GET /sources/health failed', error);
    res.status(500).json({ ok: false, error: error.message || 'Source health failed' });
  }
});


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

    const items = result.rows.map((item) => ({
      ...item,
      player: buildPlayerIntelligence(item),
    }));

    res.json({ items });
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

    query(`
      UPDATE sources
      SET
        provider = COALESCE(NULLIF(provider, ''), source_type, 'source'),
        metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
          'contentKey', $1::text,
          'autoOptimized', true,
          'optimizedAt', NOW()
        )
      WHERE id = $2
    `, [contentKey, result.rows[0].id]).catch((error) => {
      console.error('auto optimize after source create failed', error);
    });

    const needsAutoTranscode = ['mkv', 'avi', 'mov'].some((ext) =>
      String(finalUrl || '').toLowerCase().split('?')[0].endsWith(`.${ext}`)
    );

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const transcodeJob = needsAutoTranscode
      ? createTranscodeJob({
          url: finalUrl,
          quality: '720p',
          baseUrl,
          onComplete: async (job) => {
            await query(
              `
              INSERT INTO sources
              (content_id, url, canonical_url, source_type, is_primary, quality, language, metadata)
              VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
              `,
              [
                contentId,
                job.hlsUrl,
                canonicalUrl(job.hlsUrl),
                'hls',
                false,
                job.quality || '720p',
                language || 'ro',
                {
                  provider: 'hls',
                  sourceType: 'hls',
                  transcodedFrom: finalUrl,
                  transcodeJobId: job.id,
                  contentKey,
                  autoCreated: true,
                },
              ]
            );
          },
        })
      : null;

    res.status(201).json({
      transcodeJob,
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



router.post('/merge-duplicates', async (_req, res) => {
  try {
    await ensureColumns();

    const groups = await query(`
      SELECT content_key, array_agg(id ORDER BY id DESC) AS ids
      FROM contents
      WHERE content_key IS NOT NULL AND content_key <> ''
      GROUP BY content_key
      HAVING COUNT(*) > 1
    `);

    let removed = 0;
    const merged = [];

    for (const group of groups.rows) {
      const ids = group.ids;
      const keepId = ids[0];
      const deleteIds = ids.slice(1);

      if (!deleteIds.length) continue;

      await query(
        `DELETE FROM sources WHERE content_id = ANY($1::int[])`,
        [deleteIds]
      );

      await query(
        `DELETE FROM contents WHERE id = ANY($1::int[])`,
        [deleteIds]
      );

      removed += deleteIds.length;
      merged.push({
        content_key: group.content_key,
        kept: keepId,
        deleted: deleteIds,
      });
    }

    res.json({
      ok: true,
      groups: groups.rows.length,
      removed,
      merged,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Merge duplicates failed' });
  }
});


router.post('/backfill-content-keys', async (_req, res) => {
  try {
    await ensureColumns();

    const rows = await query(`
      SELECT id, title, type, metadata, content_key
      FROM contents
      WHERE content_key IS NULL OR content_key = ''
      ORDER BY id ASC
    `);

    let updated = 0;
    const items = [];

    for (const row of rows.rows) {
      const metadata = row.metadata || {};
      const key = buildContentKey({
        title: row.title,
        category: metadata.category || row.type || 'custom',
        year: metadata.year || metadata.tmdb?.year || '',
        tmdbId: metadata.tmdbId || metadata.tmdb?.id || null,
        imdbId: metadata.imdbId || null,
      });

      if (!key) continue;

      await query(
        `UPDATE contents
         SET content_key = $1,
             metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object('contentKey', $1::text)
         WHERE id = $2`,
        [key, row.id]
      );

      updated++;
      items.push({ id: row.id, title: row.title, content_key: key });
    }

    res.json({ ok: true, scanned: rows.rows.length, updated, items });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Backfill content keys failed' });
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
  await query(`ALTER TABLE sources ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb`);

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


router.get('/by-content/:contentId', async (req, res) => {
  try {
    const contentId = String(req.params.contentId || '').trim();

    if (!contentId) {
      return res.status(400).json({ error: 'MISSING_CONTENT_ID' });
    }

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
        jsonb_build_object(
          'category', COALESCE(c.type, 'custom'),
          'provider', COALESCE(s.source_type, 'source'),
          'thumbnail', COALESCE(c.poster, c.backdrop, '')
        ) AS metadata,
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
      WHERE s.content_id = $1::int
      ORDER BY s.is_primary DESC, s.created_at DESC
      `,
      [contentId]
    );

    return res.json({ items: result.rows });
  } catch (error) {
    console.error('GET /sources/by-content/:contentId failed', error);
    return res.status(500).json({ error: 'CONTENT_SOURCES_LOOKUP_FAILED' });
  }
});


router.delete('/optimization-logs', async (_req, res) => {
  try {
    await ensureOptimizationLogsTable();

    const result = await query(`
      DELETE FROM source_optimization_logs
      RETURNING id
    `);

    res.json({ ok: true, deleted: result.rowCount });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Clear optimization logs failed' });
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





router.get('/optimization-logs', async (_req, res) => {
  try {
    await ensureOptimizationLogsTable();

    const result = await query(`
      SELECT
        id,
        steps,
        summary,
        created_at AS "createdAt"
      FROM source_optimization_logs
      ORDER BY created_at DESC
      LIMIT 50
    `);

    res.json({ items: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Optimization logs failed' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const id = String(req.params.id || '').trim();

    if (!id) {
      return res.status(400).json({ error: 'MISSING_ID' });
    }

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
        jsonb_build_object(
          'category', COALESCE(c.type, 'custom'),
          'provider', COALESCE(s.source_type, 'source'),
          'thumbnail', COALESCE(c.poster, c.backdrop, '')
        ) AS metadata,
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
      WHERE s.id = $1::int OR s.content_id = $1::int
      LIMIT 1
      `,
      [id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: 'SOURCE_NOT_FOUND' });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    console.error('GET /sources/:id failed', error);
    return res.status(500).json({ error: 'SOURCE_LOOKUP_FAILED' });
  }
});


router.post('/normalize', async (_req, res) => {
  try {
    await ensureColumns();

    const result = await query(`
      UPDATE sources
      SET
        provider = COALESCE(NULLIF(provider, ''), NULLIF(source_type, ''), 'source'),
        source_type = COALESCE(NULLIF(source_type, ''), NULLIF(provider, ''), 'external'),
        metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object('normalizedAt', NOW())
      WHERE provider IS NULL
         OR provider = ''
         OR source_type IS NULL
         OR source_type = ''
      RETURNING id
    `);

    res.json({ ok: true, updated: result.rowCount });
  } catch (error) {
    console.error('POST /sources/normalize failed', error);
    res.status(500).json({ error: error.message || 'Normalize providers failed' });
  }
});



router.post('/auto-optimize', async (_req, res) => {
  try {
    await ensureColumns();

    const normalized = await query(`
      UPDATE sources
      SET
        provider = COALESCE(NULLIF(provider, ''), NULLIF(source_type, ''), 'source'),
        source_type = COALESCE(NULLIF(source_type, ''), NULLIF(provider, ''), 'external'),
        metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object('autoOptimized', true, 'optimizedAt', NOW())
      WHERE provider IS NULL
         OR provider = ''
         OR source_type IS NULL
         OR source_type = ''
      RETURNING id
    `);

    const rows = await query(`
      SELECT
        s.id,
        COALESCE(c.title, 'untitled') AS title,
        COALESCE(c.type, 'custom') AS category
      FROM sources s
      LEFT JOIN contents c ON c.id = s.content_id
      WHERE s.metadata->>'contentKey' IS NULL
    `);

    let keys = 0;

    for (const row of rows.rows) {
      const key = buildContentKey(row.title, row.category, '');

      await query(
        `
        UPDATE sources
        SET metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object('contentKey', $1::text)
        WHERE id = $2
        `,
        [key, row.id]
      );

      keys++;
    }

    const thumbnails = await query(`
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
      WHERE (poster IS NULL OR poster = '')
        AND (url ILIKE '%youtube%' OR url ILIKE '%youtu.be/%')
      RETURNING id
    `);

    const steps = [
      { step: 'normalize-providers', updated: normalized.rowCount },
      { step: 'backfill-content-keys', updated: keys },
      { step: 'normalize-thumbnails', updated: thumbnails.rowCount },
    ];

    await ensureOptimizationLogsTable();
    await query(
      `
      INSERT INTO source_optimization_logs (steps, summary)
      VALUES ($1::jsonb, $2::jsonb)
      `,
      [
        JSON.stringify(steps),
        JSON.stringify({
          totalUpdated: steps.reduce((sum, item) => sum + Number(item.updated || 0), 0),
        }),
      ]
    );

    res.json({
      ok: true,
      steps,
    });
  } catch (error) {
    console.error('POST /sources/auto-optimize failed', error);
    res.status(500).json({ ok: false, error: error.message || 'Auto optimize failed' });
  }
});




export default router;
