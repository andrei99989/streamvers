import { Router } from 'express';
import { query } from '../db/postgres.js';

const router = Router();

async function ensureAddons() {
  await query(`
    CREATE TABLE IF NOT EXISTS addons (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      url TEXT DEFAULT '',
      version TEXT DEFAULT '',
      type TEXT DEFAULT 'manifest',
      status TEXT DEFAULT 'enabled',
      manifest JSONB DEFAULT '{}'::jsonb,
      permissions JSONB DEFAULT '[]'::jsonb,
      metadata JSONB DEFAULT '{}'::jsonb,
      last_checked_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await query(`ALTER TABLE addons ADD COLUMN IF NOT EXISTS version TEXT DEFAULT ''`);
  await query(`ALTER TABLE addons ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'manifest'`);
  await query(`ALTER TABLE addons ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'enabled'`);
  await query(`ALTER TABLE addons ADD COLUMN IF NOT EXISTS manifest JSONB DEFAULT '{}'::jsonb`);
  await query(`ALTER TABLE addons ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '[]'::jsonb`);
  await query(`ALTER TABLE addons ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb`);
  await query(`ALTER TABLE addons ADD COLUMN IF NOT EXISTS last_checked_at TIMESTAMPTZ`);
  await query(`ALTER TABLE addons ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW()`);
}

function normalizeManifestUrl(url = '') {
  const value = String(url || '').trim();
  if (!value) return '';
  if (value.endsWith('/manifest')) return `${value}.json`;
  if (value.endsWith('/manifest.json')) return value;
  return `${value.replace(/\/$/, '')}/manifest.json`;
}

function addonBaseUrl(url = '') {
  return normalizeManifestUrl(url).replace(/\/manifest\.json$/, '');
}

async function fetchJson(url) {
  const response = await fetch(url);
  const text = await response.text();

  if (!response.ok) {
    const error = new Error(`Fetch failed ${response.status}`);
    error.status = response.status;
    error.details = text;
    throw error;
  }

  return JSON.parse(text || '{}');
}

async function getAddon(id) {
  await ensureAddons();

  const found = await query('SELECT * FROM addons WHERE id = $1', [id]);
  return found.rows[0] || null;
}

function addonPublic(addon) {
  return {
    id: addon.id,
    name: addon.name,
    version: addon.version,
    status: addon.status,
    url: addon.url,
    type: addon.type,
    manifest: addon.manifest || {},
    metadata: addon.metadata || {},
    lastCheckedAt: addon.last_checked_at,
    createdAt: addon.created_at,
    updatedAt: addon.updated_at,
  };
}

router.get('/', async (_req, res) => {
  await ensureAddons();

  const result = await query(`
    SELECT *
    FROM addons
    ORDER BY created_at DESC
  `);

  res.json({ items: result.rows.map(addonPublic) });
});

router.post('/', async (req, res) => {
  await ensureAddons();

  const {
    name = '',
    url = '',
    version = '',
    type = 'manifest',
    manifest = {},
    permissions = [],
  } = req.body || {};

  if (!name.trim()) {
    return res.status(400).json({ error: 'Addon name is required' });
  }

  const result = await query(
    `
    INSERT INTO addons (name, url, version, type, manifest, permissions, status, updated_at)
    VALUES ($1,$2,$3,$4,$5,$6,'enabled',NOW())
    RETURNING *
    `,
    [name.trim(), normalizeManifestUrl(url), version, type, manifest, permissions]
  );

  res.status(201).json(addonPublic(result.rows[0]));
});

router.post('/install', async (req, res) => {
  await ensureAddons();

  const { manifestUrl = '', manifest = null } = req.body || {};

  if (!manifestUrl && !manifest) {
    return res.status(400).json({ error: 'manifestUrl or manifest is required' });
  }

  const normalizedUrl = normalizeManifestUrl(manifestUrl);
  let data = manifest;

  if (!data && normalizedUrl) {
    try {
      data = await fetchJson(normalizedUrl);
    } catch (error) {
      return res.status(error.status || 400).json({
        error: 'Could not fetch manifest',
        details: error.details || error.message,
      });
    }
  }

  const name = data?.name || data?.id || 'Unnamed Addon';
  const version = data?.version || '';

  const result = await query(
    `
    INSERT INTO addons (name, url, version, type, manifest, permissions, status, last_checked_at, updated_at)
    VALUES ($1,$2,$3,'manifest',$4,$5,'enabled',NOW(),NOW())
    RETURNING *
    `,
    [name, normalizedUrl, version, data || {}, data?.permissions || []]
  );

  res.status(201).json(addonPublic(result.rows[0]));
});

router.get('/:id/catalogs', async (req, res) => {
  const addon = await getAddon(req.params.id);

  if (!addon) {
    return res.status(404).json({ error: 'Addon not found' });
  }

  const catalogs = addon.manifest?.catalogs || [];

  res.json({
    addon: addonPublic(addon),
    catalogs,
  });
});

router.get('/:id/catalog/:type/:catalogId', async (req, res) => {
  const addon = await getAddon(req.params.id);

  if (!addon) {
    return res.status(404).json({ error: 'Addon not found' });
  }

  if (!addon.url) {
    return res.status(400).json({ error: 'Addon URL missing' });
  }

  try {
    const catalogUrl = `${addonBaseUrl(addon.url)}/catalog/${encodeURIComponent(req.params.type)}/${encodeURIComponent(req.params.catalogId)}.json`;
    const data = await fetchJson(catalogUrl);

    res.json({
      addon: addonPublic(addon),
      catalogUrl,
      metas: data.metas || [],
    });
  } catch (error) {
    res.status(error.status || 500).json({
      error: 'Catalog fetch failed',
      details: error.details || error.message,
    });
  }
});

router.get('/:id/meta/:type/:metaId', async (req, res) => {
  const addon = await getAddon(req.params.id);

  if (!addon) {
    return res.status(404).json({ error: 'Addon not found' });
  }

  if (!addon.url) {
    return res.status(400).json({ error: 'Addon URL missing' });
  }

  try {
    const metaUrl = `${addonBaseUrl(addon.url)}/meta/${encodeURIComponent(req.params.type)}/${encodeURIComponent(req.params.metaId)}.json`;
    const data = await fetchJson(metaUrl);

    res.json({
      addon: addonPublic(addon),
      metaUrl,
      meta: data.meta || data,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      error: 'Meta fetch failed',
      details: error.details || error.message,
    });
  }
});

router.get('/:id/stream/:type/:metaId', async (req, res) => {
  const addon = await getAddon(req.params.id);

  if (!addon) {
    return res.status(404).json({ error: 'Addon not found' });
  }

  if (!addon.url) {
    return res.status(400).json({ error: 'Addon URL missing' });
  }

  try {
    const streamUrl = `${addonBaseUrl(addon.url)}/stream/${encodeURIComponent(req.params.type)}/${encodeURIComponent(req.params.metaId)}.json`;
    const data = await fetchJson(streamUrl);

    res.json({
      addon: addonPublic(addon),
      streamUrl,
      streams: data.streams || [],
    });
  } catch (error) {
    res.status(error.status || 500).json({
      error: 'Stream fetch failed',
      details: error.details || error.message,
    });
  }
});

router.get('/:id/subtitles/:type/:metaId', async (req, res) => {
  const addon = await getAddon(req.params.id);

  if (!addon) {
    return res.status(404).json({ error: 'Addon not found' });
  }

  if (!addon.url) {
    return res.status(400).json({ error: 'Addon URL missing' });
  }

  try {
    const subtitlesUrl = `${addonBaseUrl(addon.url)}/subtitles/${encodeURIComponent(req.params.type)}/${encodeURIComponent(req.params.metaId)}.json`;
    const data = await fetchJson(subtitlesUrl);

    res.json({
      addon: addonPublic(addon),
      subtitlesUrl,
      subtitles: data.subtitles || [],
    });
  } catch (error) {
    res.status(error.status || 500).json({
      error: 'Subtitles fetch failed',
      details: error.details || error.message,
    });
  }
});

router.post('/:id/health', async (req, res) => {
  const addon = await getAddon(req.params.id);

  if (!addon) {
    return res.status(404).json({ error: 'Addon not found' });
  }

  if (!addon.url) {
    return res.json({
      ok: false,
      status: 'missing-url',
      message: 'Addon has no manifest URL',
      addon: addonPublic(addon),
    });
  }

  try {
    const started = Date.now();
    const data = await fetchJson(addon.url);
    const latencyMs = Date.now() - started;

    await query(
      `
      UPDATE addons
      SET last_checked_at = NOW(),
          manifest = $2,
          metadata = COALESCE(metadata, '{}'::jsonb) || $3::jsonb,
          updated_at = NOW()
      WHERE id = $1
      `,
      [
        req.params.id,
        data || {},
        JSON.stringify({
          health: {
            ok: true,
            status: 200,
            latencyMs,
            checkedAt: new Date().toISOString(),
          },
        }),
      ]
    );

    res.json({ ok: true, status: 200, latencyMs, manifest: data });
  } catch (error) {
    await query(
      `
      UPDATE addons
      SET last_checked_at = NOW(),
          metadata = COALESCE(metadata, '{}'::jsonb) || $2::jsonb,
          updated_at = NOW()
      WHERE id = $1
      `,
      [
        req.params.id,
        JSON.stringify({
          health: {
            ok: false,
            error: error.message || 'Health check failed',
            checkedAt: new Date().toISOString(),
          },
        }),
      ]
    );

    res.json({ ok: false, error: error.message || 'Health check failed' });
  }
});

router.patch('/:id/toggle', async (req, res) => {
  await ensureAddons();

  const result = await query(
    `
    UPDATE addons
    SET status = CASE WHEN status = 'enabled' THEN 'disabled' ELSE 'enabled' END,
        updated_at = NOW()
    WHERE id = $1
    RETURNING *
    `,
    [req.params.id]
  );

  if (!result.rows[0]) {
    return res.status(404).json({ error: 'Addon not found' });
  }

  res.json(addonPublic(result.rows[0]));
});

router.delete('/:id', async (req, res) => {
  await ensureAddons();

  await query('DELETE FROM addons WHERE id = $1', [req.params.id]);

  res.json({ ok: true });
});

export default router;
