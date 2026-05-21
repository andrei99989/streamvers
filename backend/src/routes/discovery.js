import { Router } from 'express';
import { query } from '../db/postgres.js';

const router = Router();

function tokenize(text = '') {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9ăâîșşțţ\s]/gi, ' ')
    .split(/\s+/)
    .filter(Boolean);
}


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

function dedupeItems(items) {
  const best = new Map();

  for (const item of items) {
    const ext = externalKey(item);

    const title = normalizeText(item.title);
    const provider = normalizeText(item.provider || item.type);
    const category = normalizeText(item.content_type || item.metadata?.category);

    const key = title || ext || `${provider}|${category}`;

    if (!key.trim()) continue;

    const previous = best.get(key);

    const itemQuality =
      Number(item.aiScore || 0) +
      (item.poster ? 5 : 0) +
      (item.description ? 2 : 0) +
      (item.metadata ? 1 : 0);

    const previousQuality = previous
      ? Number(previous.aiScore || 0) +
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

function scoreItem(item, tokens) {
  let score = 0;

  const haystack = [
    item.title,
    item.description,
    item.provider,
    item.type,
    item.content_type,
    item.metadata?.category,
  ]
    .join(' ')
    .toLowerCase();

  for (const token of tokens) {
    if (haystack.includes(token)) score += 8;

    if (item.title?.toLowerCase().includes(token)) {
      score += 20;
    }

    if (item.provider?.toLowerCase().includes(token)) {
      score += 12;
    }
  }

  if (item.provider === 'youtube') score += 3;
  if (item.poster) score += 2;

  return score;
}

router.get('/search', async (req, res) => {
  try {
    const q = String(req.query.q || '').trim();

    if (!q) {
      return res.json({
        ok: true,
        items: [],
      });
    }

    const tokens = tokenize(q);

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
        s.created_at
      FROM sources s
      LEFT JOIN contents c ON c.id = s.content_id
      ORDER BY s.created_at DESC
      LIMIT 500
    `);

    const scored = result.rows
      .map((item) => ({
        ...item,
        aiScore: scoreItem(item, tokens),
      }))
      .filter((item) => item.aiScore > 0);

    const items = dedupeItems(scored)
      .sort((a, b) => b.aiScore - a.aiScore)
      .slice(0, 50);

    res.json({
      ok: true,
      query: q,
      total: items.length,
      items,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

export default router;
