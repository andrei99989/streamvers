'use client';

import { apiFetch } from '../../lib/apiClient';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Activity, Database, Gauge, MemoryStick, RefreshCw, Server, Settings, Video } from 'lucide-react';

export default function AdminDashboardPage() {
  const [health, setHealth] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [sourceHealth, setSourceHealth] = useState<any>(null);
  const [sources, setSources] = useState<any[]>([]);
  const [betaHealth, setBetaHealth] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [optimizeMessage, setOptimizeMessage] = useState('');

  async function loadDashboard() {
    setLoading(true);

    const [healthData, statsData, jobsData, logsData, sourceHealthData, betaHealthData, sourcesData] = await Promise.all([
      apiFetch('/health').catch(() => null),
      apiFetch('/stats/admin').catch(() => null),
      apiFetch('/stream/jobs').catch(() => ({ items: [] })),
      apiFetch('/sources/optimization-logs').catch(() => ({ items: [] })),
      apiFetch('/sources/health').catch(() => null),
      apiFetch('/health/beta').catch(() => null),
      apiFetch('/sources?limit=100').catch(() => ({ items: [] })),
    ]);

    setHealth(healthData);
    setStats(statsData);
    setJobs(jobsData.items || []);
    setLogs(logsData.items || []);
    setSourceHealth(sourceHealthData);
    setBetaHealth(betaHealthData);
    setSources(sourcesData.items || []);
    setLoading(false);
  }


  async function runSmartOptimize() {
    setOptimizing(true);
    setOptimizeMessage('⏳ Smart Optimize rulează...');

    try {
      const result = await apiFetch('/sources/auto-optimize', { method: 'POST' });
      const totalUpdated = (result.steps || []).reduce((sum: number, step: any) => sum + (step.updated || 0), 0);

      setOptimizeMessage(`✅ Smart Optimize complet · total updated ${totalUpdated}`);
      await loadDashboard();
    } catch (error: any) {
      setOptimizeMessage(`❌ Smart Optimize failed: ${error?.message || 'unknown error'}`);
    } finally {
      setOptimizing(false);
    }
  }


  async function clearSmartLogs() {
    await apiFetch('/sources/optimization-logs', { method: 'DELETE' }).catch(() => null);
    setLogs([]);
    setOptimizeMessage('✅ Smart Engine logs cleared');
    await loadDashboard();
  }

  useEffect(() => {
    loadDashboard();
  }, []);


  const playerSummary = sources.reduce(
    (acc: any, item: any) => {
      const player = item.player || {};
      const recommended = player.recommended_player || 'external';
      const score = Number(player.player_score || 0);

      acc.total += 1;
      acc.scoreTotal += score;
      acc[recommended] = (acc[recommended] || 0) + 1;

      if ((player.capabilities || []).includes('HLS')) acc.hls += 1;
      if ((player.capabilities || []).includes('MP4')) acc.mp4 += 1;
      if ((player.capabilities || []).includes('EMBED')) acc.embed += 1;

      return acc;
    },
    {
      total: 0,
      scoreTotal: 0,
      native: 0,
      embed: 0,
      hls: 0,
      external: 0,
      mp4: 0,
    }
  );

  const avgPlayerScore = playerSummary.total
    ? Math.round(playerSummary.scoreTotal / playerSummary.total)
    : 0;

  return (
    <main className="min-h-screen bg-black p-6 pb-56 text-white md:p-10 md:pb-20">
      <section className="mb-8 rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-[#6A4CFF]/35 to-[#00E0A8]/15 p-8">
        <div className="mb-3 flex flex-wrap gap-3">
          <div className="inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-black">
            ADMIN CONTROL CENTER
          </div>

          {betaHealth?.readiness?.status && (
            <div className="inline-flex rounded-full bg-[#00E0A8] px-4 py-2 text-sm font-black text-black">
              {betaHealth.milestone} · {betaHealth.readiness.percent}% · {betaHealth.readiness.status}
            </div>
          )}
        </div>

        <h1 className="flex items-center gap-3 text-4xl font-black md:text-6xl">
          <Gauge className="text-[#00E0A8]" /> Admin Dashboard
        </h1>

        <p className="mt-3 max-w-3xl text-white/60">
          Health, Smart Engine, Sources și Transcoding Jobs într-un singur loc.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={loadDashboard}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#00E0A8] px-5 py-3 font-black text-black"
          >
            <RefreshCw size={18} /> {loading ? 'Refreshing...' : 'Refresh Dashboard'}
          </button>

          <button
            onClick={runSmartOptimize}
            disabled={optimizing}
            className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 font-black text-black disabled:opacity-50"
          >
            {optimizing ? 'Optimizing...' : 'Run Smart Optimize'}
          </button>
        </div>

        {optimizeMessage && (
          <div className="mt-4 rounded-2xl border border-white/10 bg-black/30 px-5 py-3 text-sm font-bold text-white/70">
            {optimizeMessage}
          </div>
        )}
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5">
          <Activity className="text-[#00E0A8]" />
          <div className="mt-3 text-sm font-black uppercase text-white/40">API</div>
          <div className="mt-1 text-3xl font-black">{health?.ok ? 'Online' : 'Offline'}</div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5">
          <Settings className="text-[#00E0A8]" />
          <div className="mt-3 text-sm font-black uppercase text-white/40">Smart Engine</div>
          <div className="mt-1 text-3xl font-black">{health?.smartEngine?.enabled ? 'Active' : 'Checking'}</div>
          <div className="mt-1 text-xs text-white/40">Every {health?.smartEngine?.intervalMinutes || 30} min</div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5">
          <Server className="text-[#B8A7FF]" />
          <div className="mt-3 text-sm font-black uppercase text-white/40">Uptime</div>
          <div className="mt-1 text-3xl font-black">{stats?.uptime?.human || '0h 0m'}</div>
          <div className="mt-1 text-xs text-white/40">{stats?.uptime?.seconds || 0}s</div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5">
          <MemoryStick className="text-[#B8A7FF]" />
          <div className="mt-3 text-sm font-black uppercase text-white/40">Memory</div>
          <div className="mt-1 text-3xl font-black">{stats?.memory?.rssMb || 0} MB</div>
          <div className="mt-1 text-xs text-white/40">Heap {stats?.memory?.heapUsedMb || 0}/{stats?.memory?.heapTotalMb || 0} MB</div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5">
          <Database className="text-[#B8A7FF]" />
          <div className="mt-3 text-sm font-black uppercase text-white/40">Sources</div>
          <div className="mt-1 text-3xl font-black">{stats?.totals?.sources || 0}</div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5">
          <Video className="text-[#B8A7FF]" />
          <div className="mt-3 text-sm font-black uppercase text-white/40">Transcoding Jobs</div>
          <div className="mt-1 text-3xl font-black">{jobs.length}</div>
        </div>
      </section>

      <section className="mt-6 rounded-[2rem] border border-white/10 bg-white/[0.04] p-5">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-black">Source Health</h2>
            <div className="mt-1 text-sm text-white/40">
              Monitorizare rapidă pentru providers, posters și streamable sources.
            </div>
          </div>

          <Link href="/sources" className="rounded-xl bg-white/10 px-4 py-2 text-sm font-black">
            Manage Sources
          </Link>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {[
            ['Total', sourceHealth?.summary?.total || 0],
            ['Active', sourceHealth?.summary?.active || 0],
            ['Missing Posters', sourceHealth?.summary?.missing_poster || 0],
            ['Quality Score', `${sourceHealth?.quality?.avg_score || 0}%`],
            ['Needs Fix', sourceHealth?.quality?.needs_fix || 0],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl bg-black/30 p-4">
              <div className="text-xs font-black uppercase text-white/40">{label}</div>
              <div className="mt-2 text-3xl font-black">{value}</div>
            </div>
          ))}
        </div>

        {(sourceHealth?.worstSources || []).length > 0 && (
          <div className="mt-5">
            <h3 className="mb-3 text-lg font-black">Lowest Quality Sources</h3>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {(sourceHealth?.worstSources || []).slice(0, 8).map((item: any) => (
                <div key={item.id} className="rounded-2xl bg-black/30 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-black">#{item.id}</div>
                    <div className="rounded-full bg-white/10 px-3 py-1 text-xs font-black">
                      {item.quality_score}%
                    </div>
                  </div>

                  <div className="mt-2 text-sm text-white/50">
                    {item.provider} · {item.type}
                  </div>

                  {item.missing_poster && (
                    <div className="mt-2 text-xs font-bold text-orange-200">
                      Missing poster
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {(sourceHealth?.byProvider || []).slice(0, 8).map((provider: any) => (
            <div key={provider.provider} className="rounded-2xl bg-black/30 p-4">
              <div className="font-black uppercase">{provider.provider}</div>
              <div className="mt-2 text-sm text-white/50">{provider.total} sources</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-[2rem] border border-[#6A4CFF]/20 bg-[#6A4CFF]/10 p-5">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-black">Player Intelligence v1.1</h2>
            <div className="mt-1 text-sm text-white/50">
              Detectare automată pentru native video, embed, HLS și external fallback.
            </div>
          </div>

          <div className="rounded-full bg-[#6A4CFF] px-4 py-2 text-sm font-black">
            Avg Player Score {avgPlayerScore}%
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {[
            ['Native', playerSummary.native || 0],
            ['Embed', playerSummary.embed || 0],
            ['HLS', playerSummary.hls || 0],
            ['MP4', playerSummary.mp4 || 0],
            ['External', playerSummary.external || 0],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl bg-black/30 p-4">
              <div className="text-xs font-black uppercase text-white/40">{label}</div>
              <div className="mt-2 text-3xl font-black">{value}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-[2rem] border border-[#00E0A8]/20 bg-[#00E0A8]/10 p-5">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-black">StreamVerse Beta v1 Release Notes</h2>
            <div className="mt-1 text-sm text-white/50">
              Milestone stabil pentru administrare, monitorizare și smart source orchestration.
            </div>
          </div>

          <div className="rounded-full bg-[#00E0A8] px-4 py-2 text-sm font-black text-black">
            {betaHealth?.readiness?.percent || 99}% Ready
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {[
            'Live Admin Stats',
            'System Health Auto Checks',
            'Source Health Monitor',
            'Source Quality Score',
            'Smart Optimize Action',
            'Clear Smart Logs',
            'Beta Health Endpoint',
            'Registry Status UI',
          ].map((item) => (
            <div key={item} className="rounded-2xl bg-black/30 p-4 font-black">
              ✅ {item}
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 grid gap-4 xl:grid-cols-2">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-black">Recent Transcoding</h2>
            <Link href="/transcoding" className="rounded-xl bg-white/10 px-4 py-2 text-sm font-black">
              Open
            </Link>
          </div>

          <div className="grid gap-3">
            {jobs.slice(0, 5).map((job) => (
              <div key={job.id} className="rounded-2xl bg-black/30 p-4">
                <div className="font-black">{job.status} · {job.progress || 0}%</div>
                <div className="mt-1 break-all text-xs text-white/40">{job.url}</div>
              </div>
            ))}

            {jobs.length === 0 && <div className="text-white/40">Nu există joburi.</div>}
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-black">Smart Engine Logs</h2>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={clearSmartLogs}
                disabled={logs.length === 0}
                className="rounded-xl bg-red-500/20 px-4 py-2 text-sm font-black text-red-200 disabled:opacity-50"
              >
                Clear Logs
              </button>

              <Link href="/sources" className="rounded-xl bg-white/10 px-4 py-2 text-sm font-black">
                Sources
              </Link>
            </div>
          </div>

          <div className="grid gap-3">
            {logs.slice(0, 5).map((log) => (
              <div key={log.id} className="rounded-2xl bg-black/30 p-4">
                <div className="font-black">#{log.id} · total updated {log.summary?.totalUpdated || 0}</div>
                <div className="mt-1 text-xs text-white/40">{new Date(log.createdAt).toLocaleString()}</div>
              </div>
            ))}

            {logs.length === 0 && <div className="text-white/40">Nu există loguri.</div>}
          </div>
        </div>
      </section>
    </main>
  );
}
