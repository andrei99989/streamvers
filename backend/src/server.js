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

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*', credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(rateLimit({ windowMs: 60_000, limit: 180 }));

app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    name: 'StreamVerse API',
    metadata: {
      omdb: Boolean(process.env.OMDB_API_KEY),
      tmdb: Boolean(process.env.TMDB_API_KEY),
      youtube: Boolean(process.env.YOUTUBE_API_KEY)
    }
  });
});

app.use('/auth', authRoutes);
app.use('/profiles', profileRoutes);
app.use('/movies', movieRoutes);
app.use('/upload', uploadRoutes);
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

const port = process.env.PORT || 4000;

connectDB()
  .then(() => {
    app.listen(port, () => console.log(`API on :${port}`));
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
