import { Router } from 'express';
import { query } from '../db/postgres.js';

const router = Router();


function normalizeText(value = '') {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function externalKey(item) {
  const url = String(item.url || '').toLowerCase();

  const youtube =
    url.match(/youtu\.be\/([^?&/]+)/)?.[1] ||
    url.match(/[?&]v=([^?&/]+)/)?.[1] ||
    url.match(/youtube\.com\/embed\/([^?&/]+)/)?.[1];

  if (youtube) return `youtube:${youtube}`;

  const vimeo = url.match(/vimeo\.com\/(\d+)/)?.[1];
  if (vimeo) return `vimeo:${vimeo}`;

  const dailymotion =
    url.match(/dailymotion\.com\/video\/([^?_&/]+)/)?.[1] ||
    url.match(/dai\.ly\/([^?_&/]+)/)?.[1];

  if (dailymotion) return `dailymotion:${dailymotion}`;

  return url ? `url:${url.replace(/\?.*$/, '')}` : '';
}


function diversifyItems(items, limit = 30, maxPerProvider = 4) {
  const result = [];
  const providerCount = new Map();

  for (const item of items) {
    const provider = String(item.provider || item.type || 'unknown').toLowerCase();
    const count = providerCount.get(provider) || 0;

    if (count >= maxPerProvider) continue;

    result.push(item);
    providerCount.set(provider, count + 1);

    if (result.length >= limit) break;
  }

  if (result.length < limit) {
    for (const item of items) {
      if (result.some((x) => String(x.id) === String(item.id))) continue;
      result.push(item);
      if (result.length >= limit) break;
    }
  }

  return result;
}

function dedupeRecommendationItems(items) {
  const best = new Map();

  for (const item of items) {
    const title = normalizeText(item.title);
    const ext = externalKey(item);
    const key = title || ext;

    if (!key) continue;

    const previous = best.get(key);

    const itemQuality =
      Number(item.score || 0) +
      (item.poster ? 5 : 0) +
      (item.description ? 2 : 0) +
      (item.metadata ? 1 : 0);

    const previousQuality = previous
      ? Number(previous.score || 0) +
        (previous.poster ? 5 : 0) +
        (previous.description ? 2 : 0) +
        (previous.metadata ? 1 : 0)
      : -1;

    if (!previous || itemQuality > previousQuality) {
      best.set(key, item);
    }
  }

  return [...best.values()];
}

function addToken(map, key, weight = 1) {
  const value = String(key || '').trim().toLowerCase();
  if (!value) return;
  map.set(value, (map.get(value) || 0) + weight);
}

function prettyReason(value = '') {
  const text = String(value || '').toLowerCase();

  const map = {
    'provider youtube': 'YouTube',
    'type youtube': 'surse YouTube',
    'provider mp4': 'MP4',
    'type mp4': 'clipuri MP4',
    'provider iframe': 'iframe-uri',
    'type iframe': 'surse iframe',
    'provider dailymotion': 'Dailymotion',
    'type dailymotion': 'surse Dailymotion',
    'provider vimeo': 'Vimeo',
    'type vimeo': 'surse Vimeo',
    'provider tiktok': 'TikTok',
    'type tiktok': 'surse TikTok',
    'provider rumble': 'Rumble',
    'type rumble': 'surse Rumble',
    'content like custom': 'conținut personalizat',
    'content like movie': 'filme',
    'content like Movie': 'filme',
  };

  return map[text] || value;
}

function tokenize(text = '') {
  return String(text)
    .toLowerCase()
    .split(/[^a-z0-9ăâîșț]+/i)
    .filter((x) => x.length >= 3);
}

router.get('/', async (_req, res) => {
  try {
    const signals = new Map();

    const history = await query(`
      SELECT title, provider, source_type, metadata, watched_at AS ts
      FROM watch_history
      ORDER BY watched_at DESC
      LIMIT 80
    `);

    const favorites = await query(`
      SELECT title, provider, source_type, metadata, created_at AS ts
      FROM favorites
      ORDER BY created_at DESC
      LIMIT 80
    `);

    const cont = await query(`
      SELECT title, provider, source_type, metadata, updated_at AS ts
      FROM continue_watching
      ORDER BY updated_at DESC
      LIMIT 80
    `);

    for (const row of history.rows) {
      addToken(signals, row.provider, 5);
      addToken(signals, row.source_type, 4);
      addToken(signals, row.metadata?.category, 3);
      for (const t of tokenize(row.title)) addToken(signals, t, 1);
    }

    for (const row of favorites.rows) {
      addToken(signals, row.provider, 8);
      addToken(signals, row.source_type, 6);
      addToken(signals, row.metadata?.category, 5);
      for (const t of tokenize(row.title)) addToken(signals, t, 2);
    }

    for (const row of cont.rows) {
      addToken(signals, row.provider, 7);
      addToken(signals, row.source_type, 5);
      addToken(signals, row.metadata?.category, 4);
      for (const t of tokenize(row.title)) addToken(signals, t, 2);
    }

    const sources = await query(`
      SELECT
        s.id,
        s.content_id,
        c.title,
        c.description,
        COALESCE(NULLIF(c.poster, ''), NULLIF(s.poster, '')) AS poster,
        c.backdrop,
        c.type AS content_type,
        c.metadata,
        s.url,
        s.url AS embed_url,
        s.source_type AS type,
        COALESCE(NULLIF(s.provider, ''), s.source_type) AS provider,
        s.quality,
        s.language,
        s.created_at
      FROM sources s
      LEFT JOIN contents c ON c.id = s.content_id
      WHERE s.status IS NULL OR s.status = 'active'
      ORDER BY s.created_at DESC
      LIMIT 500
    `);

    const items = sources.rows
      .map((item) => {
        let score = 0;

        const fields = [
          item.provider,
          item.type,
          item.content_type,
          item.metadata?.category,
          item.title,
          item.description,
        ];

        for (const field of fields) {
          const text = String(field || '').toLowerCase();

          for (const [token, weight] of signals.entries()) {
            if (text === token) score += weight * 2;
            else if (text.includes(token)) score += weight;
          }
        }

        if (item.poster) score += 2;
        if (item.provider === 'youtube') score += 1;
        if (item.created_at) {
          const ageDays = (Date.now() - new Date(item.created_at).getTime()) / 86400000;
          if (ageDays < 7) score += 4;
          else if (ageDays < 30) score += 2;
        }

        const reasons = [];

        if (signals.has(String(item.provider || '').toLowerCase())) {
          reasons.push(`provider ${item.provider}`);
        }

        if (signals.has(String(item.type || '').toLowerCase())) {
          reasons.push(`type ${item.type}`);
        }

        if (signals.has(String(item.content_type || '').toLowerCase())) {
          reasons.push(`content like ${item.content_type}`);
        }

        return {
          ...item,
          score,
          reason:
            reasons.length > 0
              ? `Recomandat pentru că urmărești ${reasons.slice(0, 2).map(prettyReason).join(' și ')}`
              : score > 0
                ? 'Recomandat din activitatea ta'
                : 'Sursă adăugată recent',
        };
      })
      .sort((a, b) => b.score - a.score || new Date(b.created_at) - new Date(a.created_at));

    const deduped = diversifyItems(dedupeRecommendationItems(items), 30, 4);

    res.json({
      ok: true,
      signals: signals.size,
      items: deduped,
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Recommendations failed' });
  }
});

export default router;
