'use client';
import { API } from '../../lib/api';

import { useEffect, useState } from 'react';
import { Activity, CheckCircle2, XCircle } from 'lucide-react';



const checks = [
  ['Health', '/health'],
  ['Neon Sources', '/db/sources'],
  ['Neon Contents', '/db/contents'],
  ['Registry', '/registry'],
  ['Algolia', '/algolia/search?q=Iron%20Man'],
  ['Deezer', '/deezer/search?q=adele'],
  ['Wikipedia', '/wikipedia/summary?title=Iron%20Man'],
  ['RSS Anime', '/rss/anime'],
  ['F1', '/f1/current/driver-standings'],
  ['NBA', '/nba/players?q=lebron'],
  ['Football', '/football/standings?competition=PL'],
  ['OpenLigaDB', '/openligadb/teams?league=bl1&season=2025'],
  ['OMDb/TMDB/YouTube Metadata', '/metadata/search?q=Iron%20Man'],
  ['AI Metadata', '/ai-metadata/7'],
  ['Enrich API', '/ai-metadata/7'],
  ['Sitemap Scanner', '/sitemap/scan?url=https://www.imdb.com/sitemap.xml'],
  ['OpenSubtitles', '/subtitles/search?q=Iron%20Man'],
  ['Trakt', '/trakt/trending/movies?limit=1'],
];

export default function SystemHealthPage() {
  const [results, setResults] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  async function loadStats() {
    setStatsLoading(true);

    try {
      const res = await fetch(`${API}/stats`);
      const data = await res.json();
      setStats(data);
    } catch {
      setStats(null);
    }

    setStatsLoading(false);
  }

  useEffect(() => {
    loadStats();
  }, []);

  async function runChecks() {
    setLoading(true);

    const next = [];

    for (const [name, path] of checks) {
      const started = Date.now();

      try {
        const res = await fetch(`${API}${path}`);
        const json = await res.json();

        next.push({
          name,
          path,
          ok: res.ok && !json.error,
          status: res.status,
          ms: Date.now() - started,
          preview: json
        });
      } catch (error: any) {
        next.push({
          name,
          path,
          ok: false,
          status: 0,
          ms: Date.now() - started,
          preview: { error: error.message }
        });
      }
    }

    setResults(next);
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-black p-4 text-white sm:p-8">
      <section className="mb-6 rounded-3xl border border-white/10 bg-gradient-to-br from-[#6A4CFF]/35 to-[#00E0A8]/15 p-5 sm:p-8">
        <div className="mb-3 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-black">
          SYSTEM MONITOR
        </div>

        <h1 className="flex items-center gap-3 text-3xl font-black sm:text-5xl">
          <Activity />
          System Health
        </h1>

        <p className="mt-3 text-sm text-white/60 sm:text-base">
          Verifică rapid toate serviciile backend integrate în StreamVerse.
        </p>
      </section>


      <section className="mb-6 rounded-3xl border border-white/10 bg-white/[0.06] p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-2xl font-black">Platform Stats</h2>
          <button onClick={loadStats} className="rounded-2xl bg-white/10 px-4 py-2 text-sm font-black">
            {statsLoading ? 'Se actualizează...' : 'Refresh stats'}
          </button>
        </div>

        {stats ? (
          <>
            <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
              {[
                ['Sources', stats.totals?.sources || 0],
                ['Contents', stats.totals?.contents || 0],
                ['Favorites', stats.totals?.favorites || 0],
                ['History', stats.totals?.history || 0],
                ['Continue', stats.totals?.continueWatching || 0],
                ['Addons', stats.totals?.addons || 0],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl bg-black/40 p-4">
                  <div className="text-xs font-black uppercase text-white/40">{label}</div>
                  <div className="mt-2 text-3xl font-black">{value}</div>
                </div>
              ))}
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {(stats.providers || []).map((item: any) => (
                <div key={item.provider} className="rounded-2xl bg-black/40 p-4">
                  <div className="font-black uppercase">{item.provider}</div>
                  <div className="mt-2 text-sm text-white/50">{item.total} sources</div>
                </div>
              ))}
            </div>


            <div className="mt-5">
              <h3 className="mb-3 text-lg font-black">AI Recommendation Mix</h3>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {(stats.recommendationProviders || []).map((item: any) => (
                  <div key={`rec-${item.provider}`} className="rounded-2xl bg-[#6A4CFF]/10 p-4">
                    <div className="font-black uppercase text-[#C7BAFF]">{item.provider}</div>
                    <div className="mt-2 text-sm text-white/50">{item.total} recommended sources</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 text-xs text-white/35">
              Generated: {stats.generatedAt}
            </div>
          </>
        ) : (
          <div className="rounded-2xl bg-black/40 p-5 text-white/40">
            Stats indisponibile. Verifică backend-ul.
          </div>
        )}
      </section>

      <button
        onClick={runChecks}
        className="mb-6 rounded-2xl bg-[#6A4CFF] px-5 py-4 font-black"
      >
        {loading ? 'Se verifică...' : 'Rulează verificările'}
      </button>

      {results.find((x) => x.name === 'Registry')?.preview?.length > 0 && (
        <section className="mb-6 rounded-3xl border border-white/10 bg-white/[0.06] p-5">
          <h2 className="mb-4 text-2xl font-black">Toate API-urile din Registry</h2>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {results.find((x) => x.name === 'Registry')?.preview?.map((api: any) => (
              <div key={api.name} className="rounded-2xl bg-black/40 p-4">
                <div className="font-black">{api.name}</div>
                <div className="mt-1 text-xs text-white/50">{api.type}</div>
                <div className="mt-3 text-xs">
                  Status: <span className="font-black">{api.status}</span>
                </div>
                <div className="text-xs">
                  Configured: <span className="font-black">{api.configured ? 'DA' : 'NU'}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {results.map((item) => (
          <section
            key={item.name}
            className="rounded-3xl border border-white/10 bg-white/[0.06] p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-black">{item.name}</h2>
                <div className="mt-1 break-all text-xs text-white/40">{item.path}</div>
              </div>

              {item.ok ? (
                <CheckCircle2 className="text-[#00E0A8]" />
              ) : (
                <XCircle className="text-red-400" />
              )}
            </div>

            <div className="mt-4 flex gap-2 text-xs">
              <span className="rounded-full bg-white/10 px-3 py-1">
                HTTP {item.status}
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1">
                {item.ms} ms
              </span>
            </div>

            <pre className="mt-4 max-h-40 overflow-auto rounded-2xl bg-black/50 p-3 text-xs text-white/60">
              {JSON.stringify(item.preview, null, 2).slice(0, 900)}
            </pre>
          </section>
        ))}
      </div>
    </main>
  );
}
