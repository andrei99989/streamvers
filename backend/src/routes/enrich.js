import express from 'express';
import { query } from '../db/postgres.js';

const router = express.Router();

async function wikiSummary(title) {
  const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`);
  if (!res.ok) return null;
  return res.json();
}

router.post('/content/:id', async (req, res) => {
  try {
    const contentRes = await query('SELECT * FROM contents WHERE id = $1', [req.params.id]);
    const content = contentRes.rows[0];

    if (!content) {
      return res.status(404).json({ error: 'Content inexistent' });
    }

    const wiki = await wikiSummary(content.title);

    if (!wiki) {
      return res.status(404).json({ error: 'Nu am găsit enrichment Wikipedia' });
    }

    const updated = await query(
      `
      UPDATE contents
      SET
        description = COALESCE(NULLIF($1, ''), description),
        poster = COALESCE(NULLIF($2, ''), poster),
        metadata = COALESCE(metadata, '{}') || $3::jsonb
      WHERE id = $4
      RETURNING *
      `,
      [
        wiki.extract || '',
        wiki.thumbnail?.source || '',
        JSON.stringify({
          wikipedia: {
            title: wiki.title,
            description: wiki.description,
            extract: wiki.extract,
            url: wiki.content_urls?.desktop?.page,
            image: wiki.thumbnail?.source
          },
          enrichedAt: new Date().toISOString()
        }),
        req.params.id
      ]
    );

    res.json({
      ok: true,
      content: updated.rows[0],
      wikipedia: wiki
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
