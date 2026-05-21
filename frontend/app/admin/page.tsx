'use client';
import { API } from '../../lib/api';

import { useEffect, useState } from 'react';
import { Shield, Database } from 'lucide-react';

export default function AdminPage() {
  const [stats, setStats] = useState<any>({
    sources: 0,
    library: 0,
    watchlist: 0,
    continueWatching: 0,
    addons: 0,
    downloads: 0,
    profiles: 0,
  });

  async function loadStats() {
    const [sources, favorites, cont, addons, downloads, profiles] =
      await Promise.all([
        fetch(`${API}/sources`).then((r) => r.json()),
        fetch(`${API}/favorites`).then((r) => r.json()),
        fetch(`${API}/continue`).then((r) => r.json()),
        fetch(`${API}/addons`).then((r) => r.json()),
        fetch(`${API}/downloads`).then((r) => r.json()),
        fetch(`${API}/profiles`).then((r) => r.json()),
      ]);

    setStats({
      sources: sources.items?.length || 0,
      library: favorites.items?.length || 0,
      watchlist: favorites.items?.length || 0,
      continueWatching: cont.items?.length || 0,
      addons: addons.items?.length || 0,
      downloads: downloads.items?.length || 0,
      profiles: profiles.items?.length || 0,
    });
  }

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <main className="min-h-screen bg-black p-6 text-white md:p-10">
      <section className="glass mb-8 rounded-[2.5rem] p-8">
        <h1 className="flex items-center gap-3 text-5xl font-black">
          <Shield />
          Admin
        </h1>

        <p className="mt-3 text-white/50">
          Statistici citite direct din Neon / PostgreSQL.
        </p>
      </section>

      <div className="grid gap-5 md:grid-cols-3">
        {Object.entries(stats).map(([key, value]) => (
          <div key={key} className="glass rounded-[2rem] p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#6A4CFF]/20 text-[#B8A7FF]">
              <Database />
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
    </main>
  );
}
