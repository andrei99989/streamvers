'use client';
import { API } from '../../lib/api';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { UserRound, Play, Clock3 } from 'lucide-react';

export default function AccountPage() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);

  async function loadData() {
    const [profilesRes, continueRes] = await Promise.all([
      fetch(`${API}/profiles`).then((r) => r.json()),
      fetch(`${API}/continue`).then((r) => r.json()),
    ]);

    setProfiles(profilesRes.items || []);
    setHistory(continueRes.items || []);
  }

  useEffect(() => {
    loadData();
  }, []);

  const mainProfile = profiles[0];

  return (
    <main className="min-h-screen bg-black p-6 text-white md:p-10">
      <section className="glass mb-8 rounded-[2.5rem] p-8">
        <h1 className="flex items-center gap-3 text-5xl font-black">
          <UserRound />
          Account
        </h1>

        <div className="mt-6 rounded-3xl bg-white/5 p-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-[#6A4CFF] text-3xl font-black">
            {mainProfile?.name?.[0]?.toUpperCase() || 'S'}
          </div>

          <h2 className="mt-4 text-3xl font-black">
            {mainProfile?.name || 'StreamVerse User'}
          </h2>

          <p className="mt-2 text-white/50">
            Date sincronizate în Neon / PostgreSQL.
          </p>

          <Link
            href="/profiles"
            className="mt-5 inline-flex rounded-2xl bg-[#6A4CFF] px-5 py-3 font-black"
          >
            Manage Profiles
          </Link>
        </div>
      </section>

      <section>
        <h2 className="mb-5 flex items-center gap-3 text-3xl font-black">
          <Clock3 />
          Continue Watching
        </h2>

        {history.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-white/50">
            Nu ai activitate încă.
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {history.map((item) => (
              <Link
                key={item.id}
                href={`/watch/${item.source_id}`}
                className="glass overflow-hidden rounded-[2rem]"
              >
                {item.poster ? (
                  <img
                    src={item.poster}
                    alt={item.title}
                    className="h-48 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-48 items-center justify-center bg-white/5">
                    <Play size={50} className="text-white/40" />
                  </div>
                )}

                <div className="p-5">
                  <h3 className="line-clamp-2 text-xl font-black">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-sm text-white/50">
                    Progress: {item.progress || 0}s
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
