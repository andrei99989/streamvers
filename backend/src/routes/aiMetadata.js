import express from 'express';
import { query } from '../db/postgres.js';

const router = express.Router();

async function wikiSummary(title) {
  try {
    const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

router.get('/:id', async (req, res) => {
  try {
    const result = await query(
      `
      SELECT c.*,
        COALESCE(json_agg(s.*) FILTER (WHERE s.id IS NOT NULL), '[]') AS sources
      FROM contents c
      LEFT JOIN sources s ON s.content_id = c.id
      WHERE c.id = $1
      GROUP BY c.id
      `,
      [req.params.id]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ error: 'Content inexistent' });
    }

    const content = result.rows[0];
    const wiki = await wikiSummary(content.title);

    const aiMetadata = {
      id: content.id,
      title: content.title,
      type: content.type,
      description: content.description || wiki?.extract || '',
      poster: content.poster || wiki?.thumbnail?.source || '',
      backdrop: content.backdrop || '',
      year: content.year || '',
      country: content.country || '',
      language: content.language || '',
      genres: content.genres || [],
      sources: content.sources || [],
      enrichment: {
        wikipedia: wiki
          ? {
              title: wiki.title,
              description: wiki.description,
              extract: wiki.extract,
              url: wiki.content_urls?.desktop?.page,
              image: wiki.thumbnail?.source
            }
          : null
      },
      aiReadyText: [
        `Title: ${content.title}`,
        `Type: ${content.type}`,
        `Description: ${content.description || wiki?.extract || ''}`,
        `Sources count: ${(content.sources || []).length}`
      ].join('\n')
    };

    res.json(aiMetadata);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
