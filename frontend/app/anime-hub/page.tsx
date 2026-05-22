'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles, Star, Flame, CalendarDays, Play } from 'lucide-react';
import { apiFetch } from '../../lib/apiClient';

function poster(item: any) {
  return item.poster || item.backdrop || item.thumbnail || item.metadata?.thumbnail || '';
}

function itemId(item: any) {
  return item.source_id || item.id;
}

function providerLabel(item: any) {
  return item.provider || item.type || item.content_type || 'anime';
}

export default function AnimeHubPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        const res = await apiFetch('/recommendations?category=anime&limit=40');
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
      <section className="mb-10 rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#6A4CFF]/40 to-[#00E0A8]/10 p-8">
        <div className="mb-3 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-black">
          ANIME ENGINE
        </div>

        <h1 className="flex items-center gap-3 text-5xl font-black md:text-7xl">
          <Sparkles />
          Anime Hub
        </h1>

        <p className="mt-4 max-w-3xl text-white/70">
          Recomandări anime generate din date reale salvate în backend.
        </p>
      </section>

      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <Info icon={<Flame />} title="Trending" />
        <Info icon={<Star />} title="Recomandări" />
        <Info icon={<CalendarDays />} title="Dinamic" />
      </div>

      {loading ? (
        <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-8 text-white/50">
          Se încarcă anime hub...
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-8 text-white/50">
          Nu există încă date anime salvate.
        </div>
      ) : (
        <section>
          <h2 className="mb-4 text-2xl font-black">Anime recomandat</h2>

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
                        alt={item.title || 'Anime item'}
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
                  </div>

                  <div className="p-4">
                    <div className="line-clamp-2 min-h-[3rem] font-black">
                      {item.title || 'Untitled'}
                    </div>

                    {item.reason && (
                      <p className="mt-2 line-clamp-2 text-xs text-[#C7BAFF]">
                        {item.reason}
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
    <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-6">
      <div className="text-[#00E0A8]">{icon}</div>
      <div className="mt-4 text-2xl font-black">{title}</div>
      <div className="mt-2 text-white/50">Date reale din backend</div>
    </div>
  );
}
