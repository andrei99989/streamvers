import express from 'express';
import { algoliasearch } from 'algoliasearch';
import { query } from '../db/postgres.js';

const router = express.Router();

const INDEX_NAME = 'streamverse_contents';

function getAdminClient() {
  if (!process.env.ALGOLIA_APP_ID || !process.env.ALGOLIA_ADMIN_KEY) {
    throw new Error('Algolia nu este configurat complet');
  }

  return algoliasearch(process.env.ALGOLIA_APP_ID, process.env.ALGOLIA_ADMIN_KEY);
}

function getSearchClient() {
  if (!process.env.ALGOLIA_APP_ID || !process.env.ALGOLIA_SEARCH_KEY) {
    throw new Error('Algolia search key lipsește');
  }

  return algoliasearch(process.env.ALGOLIA_APP_ID, process.env.ALGOLIA_SEARCH_KEY);
}

router.post('/sync', async (_req, res) => {
  try {
    const client = getAdminClient();

    const result = await query(`
      SELECT c.*,
        COALESCE(json_agg(s.*) FILTER (WHERE s.id IS NOT NULL), '[]') AS sources
      FROM contents c
      LEFT JOIN sources s ON s.content_id = c.id
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `);

    const objects = result.rows.map((item) => ({
      objectID: String(item.id),
      id: item.id,
      title: item.title,
      description: item.description,
      poster: item.poster,
      backdrop: item.backdrop,
      type: item.type,
      year: item.year,
      country: item.country,
      language: item.language,
      genres: item.genres || [],
      metadata: item.metadata || {},
      sourcesCount: Array.isArray(item.sources) ? item.sources.length : 0,
      created_at: item.created_at
    }));

    await client.saveObjects({
      indexName: INDEX_NAME,
      objects
    });

    res.json({
      ok: true,
      index: INDEX_NAME,
      synced: objects.length
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

router.get('/search', async (req, res) => {
  try {
    const q = String(req.query.q || '');
    const client = getSearchClient();

    const result = await client.searchSingleIndex({
      indexName: INDEX_NAME,
      searchParams: {
        query: q,
        hitsPerPage: 30
      }
    });

    res.json({
      ok: true,
      index: INDEX_NAME,
      query: q,
      hits: result.hits
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

export default router;
