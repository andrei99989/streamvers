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
  await query(`ALTER TABLE addons ADD COLUMN IF NOT EXISTS last_checked_at TIMESTAMPTZ`);
  await query(`ALTER TABLE addons ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW()`);
}

router.get('/', async (_req, res) => {
  await ensureAddons();

  const result = await query(`
    SELECT *
    FROM addons
    ORDER BY created_at DESC
  `);

  res.json({ items: result.rows });
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
    [name.trim(), url, version, type, manifest, permissions]
  );

  res.status(201).json(result.rows[0]);
});




router.get('/:id/meta/:type/:metaId', async (req, res) => {
  await ensureAddons();

  const found = await query('SELECT * FROM addons WHERE id = $1', [req.params.id]);
  const addon = found.rows[0];

  if (!addon) {
    return res.status(404).json({ error: 'Addon not found' });
  }

  if (!addon.url) {
    return res.status(400).json({ error: 'Addon URL missing' });
  }

  const baseUrl = addon.url.replace(/\/manifest\.json$/, '');
  const metaUrl = `${baseUrl}/meta/${encodeURIComponent(req.params.type)}/${encodeURIComponent(req.params.metaId)}.json`;

  const response = await fetch(metaUrl);

  if (!response.ok) {
    return res.status(response.status).json({
      error: 'Meta fetch failed',
      status: response.status,
      metaUrl,
    });
  }

  const data = await response.json();

  res.json({
    addon: {
      id: addon.id,
      name: addon.name,
      url: addon.url,
    },
    metaUrl,
    meta: data.meta || data,
  });
});

router.get('/:id/catalog/:type/:catalogId', async (req, res) => {
  await ensureAddons();

  const found = await query('SELECT * FROM addons WHERE id = $1', [req.params.id]);
  const addon = found.rows[0];

  if (!addon) {
    return res.status(404).json({ error: 'Addon not found' });
  }

  if (!addon.url) {
    return res.status(400).json({ error: 'Addon URL missing' });
  }

  const baseUrl = addon.url.replace(/\/manifest\.json$/, '');
  const catalogUrl = `${baseUrl}/catalog/${encodeURIComponent(req.params.type)}/${encodeURIComponent(req.params.catalogId)}.json`;

  const response = await fetch(catalogUrl);

  if (!response.ok) {
    return res.status(response.status).json({
      error: 'Catalog fetch failed',
      status: response.status,
      catalogUrl,
    });
  }

  const data = await response.json();

  res.json({
    addon: {
      id: addon.id,
      name: addon.name,
      url: addon.url,
    },
    catalogUrl,
    metas: data.metas || [],
  });
});

router.get('/:id/catalogs', async (req, res) => {
  await ensureAddons();

  const found = await query('SELECT * FROM addons WHERE id = $1', [req.params.id]);
  const addon = found.rows[0];

  if (!addon) {
    return res.status(404).json({ error: 'Addon not found' });
  }

  const catalogs = addon.manifest?.catalogs || [];

  res.json({
    addon: {
      id: addon.id,
      name: addon.name,
      version: addon.version,
      status: addon.status,
      url: addon.url,
    },
    catalogs,
  });
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

  res.json(result.rows[0]);
});

router.post('/install', async (req, res) => {
  await ensureAddons();

  const { manifestUrl = '', manifest = null } = req.body || {};

  if (!manifestUrl && !manifest) {
    return res.status(400).json({ error: 'manifestUrl or manifest is required' });
  }

  let data = manifest;

  if (!data && manifestUrl) {
    const response = await fetch(manifestUrl);
    if (!response.ok) {
      return res.status(400).json({ error: 'Could not fetch manifest' });
    }
    data = await response.json();
  }

  const name = data?.name || data?.id || 'Unnamed Addon';
  const version = data?.version || '';

  const result = await query(
    `
    INSERT INTO addons (name, url, version, type, manifest, permissions, status, last_checked_at, updated_at)
    VALUES ($1,$2,$3,'manifest',$4,$5,'enabled',NOW(),NOW())
    RETURNING *
    `,
    [name, manifestUrl, version, data || {}, data?.permissions || []]
  );

  res.status(201).json(result.rows[0]);
});


router.post('/:id/health', async (req, res) => {
  await ensureAddons();

  const found = await query('SELECT * FROM addons WHERE id = $1', [req.params.id]);
  const addon = found.rows[0];

  if (!addon) {
    return res.status(404).json({ error: 'Addon not found' });
  }

  if (!addon.url) {
    return res.json({
      ok: false,
      status: 'missing-url',
      message: 'Addon has no manifest URL',
      addon,
    });
  }

  try {
    const started = Date.now();
    const response = await fetch(addon.url);
    const latencyMs = Date.now() - started;

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
            ok: response.ok,
            status: response.status,
            latencyMs,
            checkedAt: new Date().toISOString(),
          },
        }),
      ]
    );

    res.json({
      ok: response.ok,
      status: response.status,
      latencyMs,
    });
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

    res.json({
      ok: false,
      error: error.message || 'Health check failed',
    });
  }
});

router.delete('/:id', async (req, res) => {
  await ensureAddons();

  await query('DELETE FROM addons WHERE id = $1', [req.params.id]);

  res.json({ ok: true });
});

export default router;
