'use client';
import { API } from '../../lib/api';

import { useEffect, useState } from 'react';
import { Activity, CheckCircle2, XCircle } from 'lucide-react';




function sanitizeHealthPreview(name: string, json: any) {
  const error = String(json?.error || '').toLowerCase();

  if (name === 'Trakt' || error.includes('cloudflare') || error.includes('attention required')) {
    return {
      error: 'Trakt blocked by Cloudflare on this environment',
      status: 'blocked',
      hint: 'Service is configured, dar request-ul este blocat de Cloudflare.',
    };
  }

  if (name === 'OpenSubtitles' || error.includes('opensubtitles_api_key')) {
    return {
      error: 'OpenSubtitles API key missing',
      status: 'missing-key',
      hint: 'Adaugă OPENSUBTITLES_API_KEY în .env ca să activezi subtitrările.',
    };
  }

  return json;
}

function isHealthOk(name: string, res: Response, json: any) {
  const preview = sanitizeHealthPreview(name, json);

  if (preview?.status === 'missing-key') return false;
  if (preview?.status === 'blocked') return false;

  return res.ok && !json?.error;
}




function registryBadge(status: string) {
  if (status === 'active') return 'bg-[#00E0A8]/20 text-[#00E0A8]';
  if (status === 'blocked') return 'bg-yellow-500/20 text-yellow-200';
  if (status === 'missing-key') return 'bg-orange-500/20 text-orange-200';
  if (status === 'not-implemented') return 'bg-white/10 text-white/50';
  if (status === 'broken') return 'bg-red-500/20 text-red-200';
  return 'bg-white/10 text-white/60';
}


function statusBadge(item: any) {
  const status = item.preview?.status || (item.ok ? 'active' : 'error');

  if (status === 'blocked') return 'bg-yellow-500/20 text-yellow-200';
  if (status === 'missing-key') return 'bg-orange-500/20 text-orange-200';
  if (status === 'broken' || status === 'error') return 'bg-red-500/20 text-red-200';
  return 'bg-[#00E0A8]/20 text-[#00E0A8]';
}

function statusText(item: any) {
  return item.preview?.status || (item.ok ? 'active' : 'error');
}


const checks = [
  ['Beta Health', '/health/beta'],
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
  const [healthFilter, setHealthFilter] = useState('all');
  const [healthSearch, setHealthSearch] = useState('');
  const [registrySearch, setRegistrySearch] = useState('');
  const [showPlatformStats, setShowPlatformStats] = useState(false);
  const [showRegistry, setShowRegistry] = useState(false);

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
    runChecks();
  }, []);

  async function runChecks() {
    setLoading(true);

    const next = [];

    for (const [name, path] of checks) {
      const started = Date.now();

      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 8000);

      try {
        const res = await fetch(`${API}${path}`, { signal: controller.signal });
        const json = await res.json();

        const preview = sanitizeHealthPreview(name, json);

        next.push({
          name,
          path,
          ok: isHealthOk(name, res, json),
          status: res.status,
          ms: Date.now() - started,
          preview
        });
      } catch (error: any) {
        const timedOut = error?.name === 'AbortError';

        next.push({
          name,
          path,
          ok: false,
          status: 0,
          ms: Date.now() - started,
          preview: {
            status: timedOut ? 'timeout' : 'error',
            error: timedOut ? 'Health check timed out after 8s' : error.message,
          }
        });
      } finally {
        window.clearTimeout(timeout);
      }
    }

    setResults(next);
    setLoading(false);
  }


  const healthSummary = {
    active: results.filter((item) => statusText(item) === 'active').length,
    blocked: results.filter((item) => statusText(item) === 'blocked').length,
    missingKey: results.filter((item) => statusText(item) === 'missing-key').length,
    errors: results.filter((item) => !['active', 'blocked', 'missing-key'].includes(statusText(item))).length,
  };


  const filteredResults = results.filter((item) => {
    const status = statusText(item);
    const query = healthSearch.trim().toLowerCase();

    const matchesFilter =
      healthFilter === 'all'
        ? true
        : healthFilter === 'errors'
          ? !['active', 'blocked', 'missing-key'].includes(status)
          : status === healthFilter;

    const matchesSearch =
      !query ||
      [
        item.name,
        item.path,
        status,
        item.preview?.error,
        item.preview?.hint,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(query);

    return matchesFilter && matchesSearch;
  });


  const registryItems = results.find((x) => x.name === 'Registry')?.preview || [];
  const filteredRegistryItems = registryItems.filter((api: any) => {
    const query = registrySearch.trim().toLowerCase();

    if (!query) return true;

    return [
      api.name,
      api.type,
      api.status,
      api.configured ? 'configured' : 'missing',
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .includes(query);
  });


  function exportHealthReport() {
    const report = {
      generatedAt: new Date().toISOString(),
      summary: healthSummary,
      stats,
      registry: registryItems,
      checks: results,
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: 'application/json',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `streamverse-health-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();

    URL.revokeObjectURL(url);
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


      {results.find((x) => x.name === 'Beta Health')?.preview?.readiness && (
        <section className="mb-6 rounded-3xl border border-[#00E0A8]/30 bg-[#00E0A8]/10 p-5">
          <div className="text-xs font-black uppercase text-[#00E0A8]">
            StreamVerse Milestone
          </div>

          <div className="mt-2 text-3xl font-black">
            {results.find((x) => x.name === 'Beta Health')?.preview?.milestone}
          </div>

          <div className="mt-3 flex flex-wrap gap-2 text-sm font-black">
            <span className="rounded-full bg-[#00E0A8] px-4 py-2 text-black">
              {results.find((x) => x.name === 'Beta Health')?.preview?.readiness?.percent}% Ready
            </span>
            <span className="rounded-full bg-white/10 px-4 py-2">
              {results.find((x) => x.name === 'Beta Health')?.preview?.readiness?.status}
            </span>
            <span className="rounded-full bg-white/10 px-4 py-2">
              Quality {results.find((x) => x.name === 'Beta Health')?.preview?.quality?.avg_score || 0}%
            </span>
          </div>
        </section>
      )}

      <section className="mb-6 grid gap-3 md:grid-cols-4">
        {[
          ['Active', healthSummary.active, 'text-[#00E0A8]'],
          ['Blocked', healthSummary.blocked, 'text-yellow-200'],
          ['Missing Key', healthSummary.missingKey, 'text-orange-200'],
          ['Errors', healthSummary.errors, 'text-red-200'],
        ].map(([label, value, color]) => (
          <div key={label} className="rounded-3xl border border-white/10 bg-white/[0.06] p-5">
            <div className="text-xs font-black uppercase text-white/40">{label}</div>
            <div className={`mt-2 text-4xl font-black ${color}`}>{value}</div>
          </div>
        ))}
      </section>

      <section className="mb-6 rounded-3xl border border-white/10 bg-white/[0.06] p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-black">Platform Stats</h2>
            <div className="mt-1 text-sm text-white/40">
              {stats ? `${stats.totals?.sources || 0} sources · ${stats.totals?.contents || 0} contents` : 'Stats loading'}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button onClick={loadStats} className="rounded-2xl bg-white/10 px-4 py-2 text-sm font-black">
              {statsLoading ? 'Se actualizează...' : 'Refresh stats'}
            </button>
            <button onClick={() => setShowPlatformStats((value) => !value)} className="rounded-2xl bg-white/10 px-4 py-2 text-sm font-black">
              {showPlatformStats ? 'Hide Stats' : 'Show Stats'}
            </button>
          </div>
        </div>

        {showPlatformStats && stats ? (
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

      <input
        value={healthSearch}
        onChange={(e) => setHealthSearch(e.target.value)}
        placeholder="Search health checks... trakt, subtitles, neon, youtube"
        className="mb-4 w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 font-bold outline-none focus:border-[#6A4CFF]"
      />

      <div className="mb-6 flex flex-wrap gap-3">
        <button
          onClick={runChecks}
          className="rounded-2xl bg-[#6A4CFF] px-5 py-4 font-black"
        >
          {loading ? 'Se verifică...' : 'Rulează verificările'}
        </button>

        <button
          onClick={exportHealthReport}
          disabled={results.length === 0}
          className="rounded-2xl bg-white px-5 py-4 font-black text-black disabled:opacity-50"
        >
          Export Report
        </button>

        {[
          ['all', 'All'],
          ['active', 'Active'],
          ['blocked', 'Blocked'],
          ['missing-key', 'Missing Key'],
          ['errors', 'Errors'],
        ].map(([value, label]) => (
          <button
            key={value}
            onClick={() => setHealthFilter(value)}
            className={`rounded-2xl px-5 py-4 font-black ${
              healthFilter === value ? 'bg-[#00E0A8] text-black' : 'bg-white/10 text-white'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {registryItems.length > 0 && (
        <section className="mb-6 rounded-3xl border border-white/10 bg-white/[0.06] p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-black">Toate API-urile din Registry</h2>
              <div className="mt-1 text-sm font-bold text-white/40">
                {filteredRegistryItems.length}/{registryItems.length} rezultate
              </div>
            </div>

            <button
              onClick={() => setShowRegistry((value) => !value)}
              className="rounded-2xl bg-white/10 px-5 py-3 font-black"
            >
              {showRegistry ? 'Hide Registry' : 'Show Registry'}
            </button>
          </div>

          {showRegistry && (
            <>
          <input
            value={registrySearch}
            onChange={(e) => setRegistrySearch(e.target.value)}
            placeholder="Search registry... tmdb, subtitles, active, missing-key"
            className="mb-4 w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 font-bold outline-none focus:border-[#6A4CFF]"
          />

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {filteredRegistryItems.map((api: any) => (
              <div key={api.name} className="rounded-2xl bg-black/40 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-black">{api.name}</div>
                    <div className="mt-1 text-xs text-white/50">{api.type}</div>
                  </div>
                  <span className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-black uppercase ${registryBadge(api.status)}`}>
                    {api.status}
                  </span>
                </div>

                <div className="mt-3 text-xs text-white/50">
                  Configured: <span className="font-black text-white">{api.configured ? 'DA' : 'NU'}</span>
                </div>
              </div>
            ))}
          </div>
            </>
          )}
        </section>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredResults.map((item) => (
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
                <CheckCircle2 className="shrink-0 text-[#00E0A8]" />
              ) : (
                <XCircle className="shrink-0 text-red-400" />
              )}
            </div>

            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <span className={`rounded-full px-3 py-1 font-black uppercase ${statusBadge(item)}`}>
                {statusText(item)}
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1">
                HTTP {item.status}
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1">
                {item.ms} ms
              </span>
            </div>

            {item.preview?.error && (
              <div className="mt-4 rounded-2xl bg-black/40 p-3 text-sm text-red-200">
                {item.preview.error}
              </div>
            )}

            {item.preview?.hint && (
              <div className="mt-2 rounded-2xl bg-white/5 p-3 text-xs text-white/50">
                {item.preview.hint}
              </div>
            )}

            <details className="mt-4">
              <summary className="cursor-pointer text-xs font-black uppercase text-white/40">
                Raw response
              </summary>
              <pre className="mt-3 max-h-40 overflow-auto rounded-2xl bg-black/50 p-3 text-xs text-white/60">
                {JSON.stringify(item.preview, null, 2).slice(0, 900)}
              </pre>
            </details>
          </section>
        ))}
      </div>
    </main>
  );
}
