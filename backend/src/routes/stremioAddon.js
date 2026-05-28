import { Router } from 'express';
import { query } from '../db/postgres.js';

const router = Router();

const OPENSUBTITLES_API = 'https://api.opensubtitles.com/api/v1';

function openSubtitlesHeaders() {
  if (!process.env.OPENSUBTITLES_API_KEY) return null;

  return {
    'Api-Key': process.env.OPENSUBTITLES_API_KEY,
    'Content-Type': 'application/json',
    'User-Agent': 'StreamVerse v1',
  };
}

async function getContentTitleByAddonId(addonId = '') {
  const result = await query(
    `
    SELECT title
    FROM contents
    WHERE deleted_at IS NULL
      AND (
        ('streamverse:' || id::text) = $1
        OR content_key = $1
        OR metadata->>'imdbId' = $1
        OR metadata->>'imdb_id' = $1
        OR ('tmdb:' || COALESCE(metadata->>'tmdbId', metadata->>'tmdb_id', metadata->>'id')) = $1
      )
    LIMIT 1
    `,
    [addonId]
  );

  return result.rows[0]?.title || addonId.replace('streamverse:', '');
}


function normalizeSubtitleText(value = '') {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function subtitleMatchesTitle(subtitle = {}, title = '') {
  const target = normalizeSubtitleText(title);
  const name = normalizeSubtitleText(subtitle.name || '');
  const url = normalizeSubtitleText(subtitle.url || '');

  if (!target) return true;
  if (name === target) return true;
  if (name.includes(`${target} 2008`)) return true;
  if (name.includes(`batman ${target}`)) return true;
  if (url.includes(target.replaceAll(' ', '-'))) return true;

  return false;
}

function mapOpenSubtitles(item = {}) {
  const attr = item.attributes || {};
  const files = attr.files || [];
  const firstFile = files[0] || {};

  return {
    id: String(item.id || firstFile.file_id || ''),
    lang: attr.language || 'en',
    url: attr.url || attr.download_url || '',
    name: attr.release || attr.feature_details?.title || 'OpenSubtitles',
  };
}


const manifest = {
  id: 'com.streamverse.local',
  version: '1.0.0',
  name: 'StreamVerse Local',
  description: 'StreamVerse Stremio-like addon: catalogs, metadata, streams and subtitles.',
  resources: ['catalog', 'meta', 'stream', 'subtitles'],
  types: ['movie', 'series', 'channel', 'tv'],
  catalogs: [
    { type: 'movie', id: 'streamverse-movies', name: 'StreamVerse Movies' },
    { type: 'series', id: 'streamverse-series', name: 'StreamVerse Series' },
    { type: 'channel', id: 'streamverse-sources', name: 'StreamVerse Sources' },
  ],
  idPrefixes: ['streamverse:', 'tmdb:', 'imdb:', 'tt'],
  behaviorHints: {
    configurable: false,
    configurationRequired: false,
  },
};

function normalizeType(type = '') {
  const value = String(type || '').toLowerCase();

  if (['movie', 'movies', 'film', 'films'].includes(value)) return 'movie';
  if (['series', 'show', 'shows', 'tvseries'].includes(value)) return 'series';
  if (['channel', 'tv', 'live'].includes(value)) return 'channel';

  return 'movie';
}

function stremioId(row = {}) {
  const metadata = row.metadata || {};

  if (metadata.imdbId || metadata.imdb_id) return metadata.imdbId || metadata.imdb_id;

  if (metadata.tmdbId || metadata.tmdb_id || metadata.id) {
    return `tmdb:${metadata.tmdbId || metadata.tmdb_id || metadata.id}`;
  }

  return `streamverse:${row.id}`;
}

function mapMetaPreview(row = {}) {
  const metadata = row.metadata || {};

  return {
    id: stremioId(row),
    type: normalizeType(row.type || row.content_type || metadata.category),
    name: row.title || 'Untitled',
    poster: row.poster || metadata.thumbnail || metadata.poster || '',
    background: row.backdrop || metadata.backdrop || row.poster || '',
    description: row.description || metadata.overview || metadata.description || '',
    releaseInfo: metadata.year ? String(metadata.year) : undefined,
  };
}

function mapStream(row = {}) {
  const type = String(row.source_type || row.type || '').toLowerCase();
  const provider = String(row.provider || type || 'source').toUpperCase();
  const isDirect = ['mp4', 'webm', 'hls'].includes(type);

  return {
    name: `StreamVerse ${provider}`,
    title: `${row.quality || 'Auto'} · ${row.language || 'ro'} · ${type || 'source'}`,
    url: isDirect ? row.url : undefined,
    externalUrl: isDirect ? undefined : row.url,
    behaviorHints: {
      notWebReady: !isDirect,
    },
  };
}

router.get(['/manifest.json', '/manifest'], (_req, res) => {
  res.json(manifest);
});

router.get(['/catalog/:type/:id.json', '/catalog/:type/:id'], async (req, res) => {
  try {
    const type = normalizeType(req.params.type);

    if (type === 'channel') {
      const result = await query(`
        SELECT DISTINCT ON (c.id)
          c.id,
          c.title,
          c.description,
          c.poster,
          c.backdrop,
          COALESCE(c.type, 'channel') AS type,
          c.metadata
        FROM contents c
        LEFT JOIN sources s ON s.content_id = c.id
        WHERE c.deleted_at IS NULL
          AND (
            LOWER(COALESCE(c.type, '')) IN ('channel', 'tv', 'live')
            OR LOWER(COALESCE(c.metadata->>'category', '')) IN ('channel', 'tv', 'live')
            OR LOWER(COALESCE(s.provider, '')) IN ('youtube', 'iframe', 'hls', 'rumble', 'twitch')
            OR LOWER(COALESCE(s.source_type, '')) IN ('iframe', 'hls')
          )
        ORDER BY c.id DESC
        LIMIT 100
      `);

      return res.json({
        metas: result.rows.map((row) => ({
          ...mapMetaPreview(row),
          type: 'channel',
        })),
      });
    }

    const result = await query(
      `
      SELECT id, title, description, poster, backdrop, type, metadata
      FROM contents
      WHERE deleted_at IS NULL
        AND (
          LOWER(COALESCE(type, '')) = $1
          OR LOWER(COALESCE(metadata->>'category', '')) = $1
        )
      ORDER BY id DESC
      LIMIT 100
      `,
      [type]
    );

    res.json({ metas: result.rows.map(mapMetaPreview) });
  } catch (error) {
    res.status(500).json({ metas: [], error: error.message || 'Catalog failed' });
  }
});

router.get(['/meta/:type/:id.json', '/meta/:type/:id'], async (req, res) => {
  try {
    const id = String(req.params.id || '');

    const result = await query(
      `
      SELECT id, title, description, poster, backdrop, type, metadata, content_key
      FROM contents
      WHERE deleted_at IS NULL
        AND (
          ('streamverse:' || id::text) = $1
          OR content_key = $1
          OR metadata->>'imdbId' = $1
          OR metadata->>'imdb_id' = $1
          OR ('tmdb:' || COALESCE(metadata->>'tmdbId', metadata->>'tmdb_id', metadata->>'id')) = $1
        )
      LIMIT 1
      `,
      [id]
    );

    if (!result.rows.length) {
      return res.json({ meta: null });
    }

    const row = result.rows[0];
    const metadata = row.metadata || {};

    res.json({
      meta: {
        ...mapMetaPreview(row),
        genres: metadata.genres || [],
        runtime: metadata.runtime || undefined,
        imdbRating: metadata.rating || metadata.imdbRating || undefined,
      },
    });
  } catch (error) {
    res.status(500).json({ meta: null, error: error.message || 'Meta failed' });
  }
});

router.get(['/stream/:type/:id.json', '/stream/:type/:id'], async (req, res) => {
  try {
    const id = String(req.params.id || '');

    const result = await query(
      `
      SELECT
        s.id,
        s.url,
        s.source_type,
        s.provider,
        s.quality,
        s.language,
        c.id AS content_id,
        c.content_key,
        c.metadata
      FROM sources s
      LEFT JOIN contents c ON c.id = s.content_id
      WHERE c.deleted_at IS NULL
        AND (
          ('streamverse:' || c.id::text) = $1
          OR c.content_key = $1
          OR c.metadata->>'imdbId' = $1
          OR c.metadata->>'imdb_id' = $1
          OR ('tmdb:' || COALESCE(c.metadata->>'tmdbId', c.metadata->>'tmdb_id', c.metadata->>'id')) = $1
        )
      ORDER BY s.is_primary DESC, s.id DESC
      LIMIT 20
      `,
      [id]
    );

    res.json({
      streams: result.rows.map(mapStream).filter((item) => item.url || item.externalUrl),
    });
  } catch (error) {
    res.status(500).json({ streams: [], error: error.message || 'Streams failed' });
  }
});

router.get(['/subtitles/:type/:id.json', '/subtitles/:type/:id'], async (req, res) => {
  try {
    const headers = openSubtitlesHeaders();

    if (!headers) {
      return res.json({
        subtitles: [],
        warning: 'OPENSUBTITLES_API_KEY missing',
      });
    }

    const id = String(req.params.id || '');
    const title = await getContentTitleByAddonId(id);
    const languages = String(req.query.languages || 'ro,en');

    const url = `${OPENSUBTITLES_API}/subtitles?query=${encodeURIComponent(title)}&languages=${encodeURIComponent(languages)}`;
    const response = await fetch(url, { headers });
    const data = await response.json().catch(() => ({ data: [] }));

    if (!response.ok) {
      return res.status(response.status).json({
        subtitles: [],
        error: data?.message || 'OpenSubtitles error',
      });
    }

    const subtitles = (data.data || [])
      .map(mapOpenSubtitles)
      .filter((item) => item.id && item.lang)
      .filter((item) => subtitleMatchesTitle(item, title))
      .slice(0, 20);

    return res.json({ subtitles });
  } catch (error) {
    return res.status(500).json({
      subtitles: [],
      error: error.message || 'Subtitles failed',
    });
  }
});

export default router;
