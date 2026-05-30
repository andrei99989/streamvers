import fs from 'fs/promises';
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import { connectDB } from './config/db.js';

import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profiles.js';
import movieRoutes from './routes/movies.js';
import uploadRoutes from './routes/upload.js';
import searchRoutes from './routes/search.js';
import streamRoutes from './routes/stream.js';
import aiRoutes from './routes/ai.js';
import dbRoutes from './routes/db.js';
import registryRoutes from './routes/registry.js';
import algoliaRoutes from './routes/algolia.js';
import traktRoutes from './routes/trakt.js';
import subtitleRoutes from './routes/subtitles.js';
import deezerRoutes from './routes/deezer.js';
import wikipediaRoutes from './routes/wikipedia.js';
import rssRoutes from './routes/rss.js';
import f1Routes from './routes/f1.js';
import nbaRoutes from './routes/nba.js';
import footballRoutes from './routes/football.js';
import openLigaRoutes from './routes/openligadb.js';
import sitemapRoutes from './routes/sitemap.js';
import aiMetadataRoutes from './routes/aiMetadata.js';
import enrichRoutes from './routes/enrich.js';
import metadataRoutes from './routes/metadata.routes.js';
import historyRoutes from './routes/history.js';
import continueRoutes from './routes/continue.js';
import favoritesRoutes from './routes/favorites.js';
import profilesRoutes from './routes/profiles.js';
import settingsRoutes from './routes/settings.js';
import libraryRoutes from './routes/library.js';
import downloadsRoutes from './routes/downloads.js';
import addonsRoutes from './routes/addons.js';
import trendingRoutes from './routes/trending.js';
import statsRoutes from './routes/stats.js';
import discoveryRoutes from './routes/discovery.js';
import recommendationsRoutes from './routes/recommendations.js';
import sourcesRoutes from './routes/sources.js';
import stremioAddonRoutes from './routes/stremioAddon.js';
import searchRecentRoutes from './routes/searchRecent.js';

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*', credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(rateLimit({ windowMs: 60_000, limit: 180 }));


app.get('/addons-marketplace', async (_req, res) => {
  try {
    const file = new URL('../storage/addons-marketplace.json', import.meta.url);
    const text = await fs.readFile(file, 'utf8');
    const items = JSON.parse(text || '[]');

    res.json({
      items,
      total: items.length,
      source: 'backend/storage/addons-marketplace.json',
    });
  } catch (error) {
    res.status(500).json({
      error: 'Marketplace config failed',
      details: error.message,
      items: [],
    });
  }
});

app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    name: 'StreamVerse API',
    metadata: {
      omdb: Boolean(process.env.OMDB_API_KEY),
      tmdb: Boolean(process.env.TMDB_API_KEY),
      youtube: Boolean(process.env.YOUTUBE_API_KEY)
    },
    smartEngine: {
      enabled: true,
      intervalMs: SMART_ENGINE_INTERVAL_MS,
      intervalMinutes: Math.round(SMART_ENGINE_INTERVAL_MS / 60000)
    }
  });
});


app.get('/health/beta', async (_req, res) => {
  try {
    const memory = process.memoryUsage();

    const [statsRes, sourceHealthRes] = await Promise.all([
      fetch(`http://localhost:${port}/stats/admin`).then((r) => r.json()).catch(() => null),
      fetch(`http://localhost:${port}/sources/health`).then((r) => r.json()).catch(() => null),
    ]);

    res.json({
      ok: true,
      milestone: 'StreamVerse Beta v1',
      readiness: {
        percent: 99,
        status: 'beta-ready',
      },
      api: {
        name: 'StreamVerse API',
        uptimeSeconds: Math.round(process.uptime()),
        memoryMb: Math.round(memory.rss / 1024 / 1024),
      },
      smartEngine: {
        enabled: true,
        intervalMs: SMART_ENGINE_INTERVAL_MS,
        intervalMinutes: Math.round(SMART_ENGINE_INTERVAL_MS / 60000),
      },
      stats: statsRes?.totals || {},
      sourceHealth: sourceHealthRes?.summary || {},
      quality: sourceHealthRes?.quality || {},
      providers: sourceHealthRes?.byProvider || [],
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message || 'Beta health failed' });
  }
});


app.use('/auth', authRoutes);
app.use('/movies', movieRoutes);
app.use('/upload', uploadRoutes);
app.use('/search/recent', searchRecentRoutes);
app.use('/search', searchRoutes);
app.use('/stream', streamRoutes);
app.use('/ai', aiRoutes);
app.use('/db', dbRoutes);
app.use('/registry', registryRoutes);
app.use('/algolia', algoliaRoutes);
app.use('/trakt', traktRoutes);
app.use('/subtitles', subtitleRoutes);
app.use('/deezer', deezerRoutes);
app.use('/wikipedia', wikipediaRoutes);
app.use('/rss', rssRoutes);
app.use('/f1', f1Routes);
app.use('/nba', nbaRoutes);
app.use('/football', footballRoutes);
app.use('/openligadb', openLigaRoutes);
app.use('/sitemap', sitemapRoutes);
app.use('/ai-metadata', aiMetadataRoutes);
app.use('/enrich', enrichRoutes);
app.use('/metadata', metadataRoutes);
app.use('/history', historyRoutes);
app.use('/continue', continueRoutes);
app.use('/favorites', favoritesRoutes);
app.use('/profiles', profilesRoutes);
app.use('/settings', settingsRoutes);
app.use('/library', libraryRoutes);
app.use('/downloads', downloadsRoutes);
app.use('/addons', addonsRoutes);
app.use('/stats', statsRoutes);
app.use('/trending', trendingRoutes);
app.use('/discovery', discoveryRoutes);
app.use('/recommendations', recommendationsRoutes);
app.use('/sources', sourcesRoutes);
app.use('/stremio-addon', stremioAddonRoutes);

const port = process.env.PORT || 4000;

const SMART_ENGINE_INTERVAL_MS = Number(process.env.SMART_ENGINE_INTERVAL_MS || 30 * 60 * 1000);

async function runSmartEngineSchedule() {
  try {
    const url = `http://localhost:${port}/sources/auto-optimize`;
    await fetch(url, { method: 'POST' });
    console.info('Smart Engine scheduled optimization completed');
  } catch (error) {
    console.error('Smart Engine scheduled optimization failed', error);
  }
}


connectDB()
  .then(() => {
    app.listen(port, () => {
      console.info(`API on :${port}`);
      setInterval(runSmartEngineSchedule, SMART_ENGINE_INTERVAL_MS);
    });
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
