'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Clapperboard, Play } from 'lucide-react';
import { apiFetch } from '../../lib/apiClient';

function poster(item: any) {
  return item.poster || item.backdrop || item.thumbnail || item.metadata?.thumbnail || '';
}

function itemId(item: any) {
  return item.source_id || item.id;
}

export default function MoviesPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        const res = await apiFetch('/recommendations?category=movie&limit=40');
        if (alive) setItems(res.items || []);
      } catch {
        if (alive) setItems([]);
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <main className="min-h-screen bg-black p-6 text-white md:p-10">
      <section className="mb-10 rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#6A4CFF]/30 to-white/5 p-8">
        <div className="mb-3 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-black">
          MOVIE ENGINE
        </div>
        <h1 className="flex items-center gap-3 text-5xl font-black md:text-7xl">
          <Clapperboard />
          Movies
        </h1>
        <p className="mt-4 max-w-3xl text-white/70">
          Filme recomandate din date reale salvate în backend.
        </p>
      </section>

      {loading ? (
        <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-8 text-white/50">
          Se încarcă filme...
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-8 text-white/50">
          Nu există încă filme salvate.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
          {items.map((item) => {
            const image = poster(item);

            return (
              <Link
                key={`${item.id}-${item.source_id || item.url || ''}`}
                href={`/watch/${itemId(item)}`}
                className="group overflow-hidden rounded-3xl border border-white/10 bg-white/10 transition hover:scale-[1.02]"
              >
                <div className="relative h-64 overflow-hidden bg-white/5">
                  {image ? (
                    <img
                      src={image}
                      alt={item.title || 'Movie'}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Play size={48} className="text-white/30" />
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <div className="line-clamp-2 min-h-[3rem] font-black">
                    {item.title || 'Untitled'}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
