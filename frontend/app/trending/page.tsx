'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Flame, Star, Trophy, Play } from 'lucide-react';
import { apiFetch } from '../../lib/apiClient';

function poster(item: any) {
  return item.poster || item.backdrop || item.thumbnail || item.metadata?.thumbnail || '/placeholder-poster.svg';
}

function itemId(item: any) {
  return item.source_id || item.id;
}

function providerLabel(item: any) {
  return item.provider || item.type || item.content_type || 'source';
}

export default function TrendingPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        const res = await apiFetch('/trending?limit=50');
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
    <main className="min-h-screen overflow-x-hidden bg-black px-4 pb-32 pt-24 text-white md:px-10 md:pb-20 md:pt-10">
      <section className="mb-8 rounded-[2rem] border border-white/10 bg-gradient-to-br from-red-500/30 to-[#6A4CFF]/25 p-5 md:p-8">
        <div className="mb-3 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-black">
          TRENDING ENGINE
        </div>

        <h1 className="flex items-center gap-3 text-4xl font-black md:text-7xl">
          <Flame />
          Trending
        </h1>

        <p className="mt-4 max-w-3xl text-base leading-relaxed text-white/70 md:text-lg">
          Conținut popular calculat din Neon pe baza istoricului, favoritelor, continue watching și surselor recente.
        </p>
      </section>

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Info icon={<Flame />} title="Trending" />
        <Info icon={<Trophy />} title="Popularitate reală" />
        <Info icon={<Star />} title="Neon-backed" />
      </div>

      {loading ? (
        <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-8 text-white/50">
          Se încarcă trending...
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-8 text-white/50">
          Nu există încă suficiente date pentru trending.
        </div>
      ) : (
        <section>
          <h2 className="mb-4 text-2xl font-black">Trending acum</h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => {
              const image = poster(item);

              return (
                <Link
                  key={`${item.id}-${item.url || ''}`}
                  href={`/watch/${itemId(item)}`}
                  className="tap-card group overflow-hidden rounded-3xl border border-white/10 bg-white/10 transition hover:scale-[1.02]"
                >
                  <div className="relative h-52 overflow-hidden bg-white/5 md:h-64">
                    {image ? (
                      <img
                        src={image}
                        alt={item.title || 'Trending item'}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Play size={48} className="text-white/30" />
                      </div>
                    )}

                    <div className="absolute left-3 top-3 rounded-full bg-black/70 px-3 py-1 text-xs font-black uppercase">
                      {providerLabel(item)}
                    </div>

                    {typeof item.trending_score === 'number' && (
                      <div className="absolute right-3 top-3 rounded-full bg-[#00E0A8]/90 px-3 py-1 text-xs font-black text-black">
                        {item.trending_score}
                      </div>
                    )}
                  </div>

                  <div className="p-3">
                    <div className="line-clamp-1 text-sm font-black">
                      {item.title || 'Untitled'}
                    </div>

                    {item.description && (
                      <p className="mt-2 line-clamp-2 text-xs text-white/50">
                        {item.description}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}

function Info({ icon, title }: any) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 md:p-6">
      <div className="text-[#00E0A8]">{icon}</div>
      <div className="mt-3 text-xl font-black md:text-2xl">{title}</div>
      <div className="mt-2 text-white/50">Date reale din backend</div>
    </div>
  );
}
