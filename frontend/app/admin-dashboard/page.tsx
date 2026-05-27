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
  const [loading, setLoading] = useState(false);

  async function loadDashboard() {
    setLoading(true);

    const [healthData, statsData, jobsData, logsData] = await Promise.all([
      apiFetch('/health').catch(() => null),
      apiFetch('/stats/admin').catch(() => null),
      apiFetch('/stream/jobs').catch(() => ({ items: [] })),
      apiFetch('/sources/optimization-logs').catch(() => ({ items: [] })),
    ]);

    setHealth(healthData);
    setStats(statsData);
    setJobs(jobsData.items || []);
    setLogs(logsData.items || []);
    setLoading(false);
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  return (
    <main className="min-h-screen bg-black p-6 pb-56 text-white md:p-10 md:pb-20">
      <section className="mb-8 rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-[#6A4CFF]/35 to-[#00E0A8]/15 p-8">
        <div className="mb-3 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-black">
          ADMIN CONTROL CENTER
        </div>

        <h1 className="flex items-center gap-3 text-4xl font-black md:text-6xl">
          <Gauge className="text-[#00E0A8]" /> Admin Dashboard
        </h1>

        <p className="mt-3 max-w-3xl text-white/60">
          Health, Smart Engine, Sources și Transcoding Jobs într-un singur loc.
        </p>

        <button
          onClick={loadDashboard}
          className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-[#00E0A8] px-5 py-3 font-black text-black"
        >
          <RefreshCw size={18} /> {loading ? 'Refreshing...' : 'Refresh Dashboard'}
        </button>
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
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-black">Smart Engine Logs</h2>
            <Link href="/sources" className="rounded-xl bg-white/10 px-4 py-2 text-sm font-black">
              Sources
            </Link>
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
