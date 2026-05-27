import { Router } from 'express';
import { query } from '../db/postgres.js';

const router = Router();

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

router.get(['/subtitles/:type/:id.json', '/subtitles/:type/:id'], async (_req, res) => {
  res.json({ subtitles: [] });
});

export default router;
