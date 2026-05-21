import 'dotenv/config';
import { query } from '../db/postgres.js';

async function init() {
  await query(`
    CREATE TABLE IF NOT EXISTS contents (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      poster TEXT,
      backdrop TEXT,
      type TEXT DEFAULT 'movie',
      year TEXT,
      country TEXT,
      language TEXT,
      genres TEXT[],
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS sources (
      id SERIAL PRIMARY KEY,
      content_id INTEGER REFERENCES contents(id) ON DELETE CASCADE,
      url TEXT NOT NULL,
      source_type TEXT NOT NULL,
      is_primary BOOLEAN DEFAULT false,
      quality TEXT,
      language TEXT,
      status TEXT DEFAULT 'active',
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS subtitles (
      id SERIAL PRIMARY KEY,
      content_id INTEGER REFERENCES contents(id) ON DELETE CASCADE,
      url TEXT NOT NULL,
      language TEXT DEFAULT 'ro',
      format TEXT DEFAULT 'vtt',
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS library (
      id SERIAL PRIMARY KEY,
      content_id INTEGER REFERENCES contents(id) ON DELETE CASCADE,
      profile_id TEXT DEFAULT 'default',
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS watchlist (
      id SERIAL PRIMARY KEY,
      content_id INTEGER REFERENCES contents(id) ON DELETE CASCADE,
      profile_id TEXT DEFAULT 'default',
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  console.info('PostgreSQL tables created successfully');
  process.exit(0);
}

init().catch((err) => {
  console.error(err);
  process.exit(1);
});
