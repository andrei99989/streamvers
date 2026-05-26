'use client';

import { API } from '../../lib/api';
import { useEffect, useState } from 'react';
import { Database, Download, Heart, Layers3, PlayCircle, Puzzle, RefreshCw, Shield, Users } from 'lucide-react';

export default function AdminPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function loadStats() {
    setLoading(true);

    try {
      const res = await fetch(`${API}/stats`);
      const json = await res.json();
      setStats(json);
    } catch {
      setStats(null);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadStats();
  }, []);

  const cards = [
    ['sources', stats?.totals?.sources || 0, Database],
    ['library', stats?.totals?.contents || 0, Layers3],
    ['watchlist', stats?.totals?.favorites || 0, Heart],
    ['continueWatching', stats?.totals?.continueWatching || 0, PlayCircle],
    ['addons', stats?.totals?.addons || 0, Puzzle],
    ['downloads', stats?.totals?.downloads || 0, Download],
    ['profiles', stats?.totals?.profiles || 0, Users],
  ];

  return (
    <main className="min-h-screen bg-black p-6 text-white md:p-10">
      <section className="glass mb-8 rounded-[2.5rem] p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-3 text-5xl font-black">
              <Shield />
              Admin
            </h1>

            <p className="mt-3 text-white/50">
              Statistici live citite din /stats.
            </p>
          </div>

          <button
            onClick={loadStats}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#00E0A8] px-5 py-4 font-black text-black"
          >
            <RefreshCw size={18} />
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </section>

      <div className="grid gap-5 md:grid-cols-3 xl:grid-cols-4">
        {cards.map(([key, value, Icon]: any) => (
          <div key={key} className="glass rounded-[2rem] p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#6A4CFF]/20 text-[#B8A7FF]">
              <Icon />
            </div>

            <div className="text-sm uppercase tracking-[0.25em] text-white/40">
              {key}
            </div>

            <div className="mt-2 text-5xl font-black">
              {String(value)}
            </div>
          </div>
        ))}
      </div>

      {stats?.providers?.length > 0 && (
        <section className="glass mt-8 rounded-[2rem] p-6">
          <h2 className="mb-5 text-2xl font-black">Source Providers</h2>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {stats.providers.map((provider: any) => (
              <div key={provider.provider} className="rounded-2xl bg-black/30 p-4">
                <div className="font-black uppercase">{provider.provider}</div>
                <div className="mt-2 text-sm text-white/50">{provider.total} sources</div>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
