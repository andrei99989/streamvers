'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import Sidebar from '../../../components/Sidebar';
import UniversalPlayer from '../../../components/UniversalPlayer';
import { API } from '../../../lib/api';

const demoSource = {
  url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  type: 'iframe' as const,
  provider: 'youtube.com',
};

export default function WatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [data, setData] = useState<any>(null);
  const [savedItem, setSavedItem] = useState<any>(null);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('streamverse_continue') || '[]');
    const current = saved.find((item: any) => String(item.id) === String(id)) || saved[0];

    if (current) {
      setSavedItem(current);
    }

    if (!id.startsWith('demo')) {
      fetch(`${API}/stream/${id}`)
        .then((r) => r.json())
        .then(setData)
        .catch(() => null);
    }
  }, [id]);

  const source =
    data?.primary ||
    (savedItem?.trailerUrl
      ? {
          url: savedItem.trailerUrl,
          type: 'iframe' as const,
          provider: 'youtube.com',
        }
      : demoSource);

  const movie = data?.movie || {
    title: savedItem?.title || 'Demo Stream',
    description: savedItem?.subtitle || 'Preview player universal.',
  };

  return (
    <main className="min-h-screen bg-ink pl-0 text-white md:pl-20">
      <Sidebar />

      <section className="mx-auto max-w-6xl space-y-6 px-6 py-10">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-4 md:p-6">
          <UniversalPlayer source={source} title={movie.title} />
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
          <div className="mb-3 inline-flex rounded-full bg-[#6A4CFF] px-4 py-2 text-xs font-black uppercase tracking-[0.25em]">
            Now Playing
          </div>

          <h1 className="text-4xl font-black md:text-6xl">{movie.title}</h1>
          <p className="mt-3 max-w-3xl text-white/60">{movie.description}</p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/continue-watching" className="rounded-2xl bg-white/10 px-5 py-3 font-bold">
              Continue Watching
            </Link>

            <Link href="/library" className="rounded-2xl bg-white/10 px-5 py-3 font-bold">
              Library
            </Link>

            <Link href="/search" className="rounded-2xl bg-[#6A4CFF] px-5 py-3 font-bold">
              Search More
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
