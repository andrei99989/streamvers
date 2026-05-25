'use client';

import { apiFetch } from '../../lib/apiClient';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Activity, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';

export default function TranscodingPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function loadJobs() {
    setLoading(true);
    const data = await apiFetch('/stream/jobs').catch(() => ({ items: [] }));
    setItems(data.items || []);
    setLoading(false);
  }


  async function retryJob(jobId: string) {
    await apiFetch(`/stream/jobs/${jobId}/retry`, { method: 'POST' }).catch(() => null);
    await loadJobs();
  }

  useEffect(() => {
    loadJobs();
    const timer = setInterval(loadJobs, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <main className="min-h-screen bg-black p-6 pb-56 text-white md:p-10 md:pb-20">
      <section className="mb-8 rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-8">
        <h1 className="flex items-center gap-3 text-5xl font-black">
          <Activity className="text-[#00E0A8]" /> Transcoding Jobs
        </h1>

        <button
          onClick={loadJobs}
          className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-[#00E0A8] px-5 py-3 font-black text-black"
        >
          <RefreshCw size={18} /> {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </section>

      {items.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center text-white/50">
          Nu există joburi FFmpeg active.
        </div>
      ) : (
        <div className="grid gap-4">
          {items.map((job) => (
            <div key={job.id} className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5">
              <div className="flex flex-wrap items-center gap-3">
                {job.status === 'completed' ? (
                  <CheckCircle2 className="text-[#00E0A8]" />
                ) : job.status === 'failed' ? (
                  <XCircle className="text-red-400" />
                ) : (
                  <Activity className="text-[#B8A7FF]" />
                )}

                <div className="text-xl font-black">{job.status}</div>
                <div className="rounded-full bg-white/10 px-3 py-1 text-xs font-black uppercase text-white/60">
                  {job.quality || 'auto'}
                </div>
                <div className="ml-auto text-sm text-white/40">{job.progress || 0}%</div>
              </div>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-[#6A4CFF]" style={{ width: `${job.progress || 0}%` }} />
              </div>

              <p className="mt-4 break-all text-xs text-white/40">{job.url}</p>

              <div className="mt-4 flex flex-wrap gap-3">
                {job.hlsUrl && (
                  <Link href={`/player?url=${encodeURIComponent(job.hlsUrl)}`} className="inline-block rounded-2xl bg-white px-5 py-3 font-black text-black">
                    Open HLS
                  </Link>
                )}

                {job.status === 'failed' && (
                  <button onClick={() => retryJob(job.id)} className="rounded-2xl bg-[#00E0A8] px-5 py-3 font-black text-black">
                    Retry
                  </button>
                )}
              </div>

              {job.error && <div className="mt-3 text-sm text-red-300">{job.error}</div>}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
