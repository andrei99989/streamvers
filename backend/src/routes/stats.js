import { Router } from 'express';
import { query } from '../db/postgres.js';

const router = Router();

async function countTable(table) {
  try {
    const result = await query(`SELECT COUNT(*)::int AS total FROM ${table}`);
    return result.rows[0]?.total || 0;
  } catch {
    return 0;
  }
}

router.get('/', async (_req, res) => {
  try {
    const [
      sources,
      contents,
      favorites,
      history,
      continueWatching,
      addons,
    ] = await Promise.all([
      countTable('sources'),
      countTable('contents'),
      countTable('favorites'),
      countTable('watch_history'),
      countTable('continue_watching'),
      countTable('addons'),
    ]);

    const providers = await query(`
      SELECT COALESCE(provider, source_type, 'unknown') AS provider, COUNT(*)::int AS total
      FROM sources
      GROUP BY COALESCE(provider, source_type, 'unknown')
      ORDER BY total DESC
      LIMIT 12
    `);

    const recommendationProviders = await query(`
      SELECT COALESCE(provider, source_type, 'unknown') AS provider, COUNT(*)::int AS total
      FROM sources
      WHERE status IS NULL OR status = 'active'
      GROUP BY COALESCE(provider, source_type, 'unknown')
      ORDER BY total DESC
      LIMIT 12
    `);

    res.json({
      ok: true,
      totals: {
        sources,
        contents,
        favorites,
        history,
        continueWatching,
        addons,
      },
      providers: providers.rows,
      recommendationProviders: recommendationProviders.rows,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Stats failed' });
  }
});

export default router;
