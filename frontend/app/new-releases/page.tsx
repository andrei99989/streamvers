'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles, Film, Tv, CalendarPlus, Play } from 'lucide-react';
import { apiFetch } from '../../lib/apiClient';

function poster(item: any) {
  return item.poster || item.backdrop || item.thumbnail || item.metadata?.thumbnail || '';
}

function itemId(item: any) {
  return item.source_id || item.id;
}

function dateValue(item: any) {
  return new Date(item.created_at || item.updated_at || 0).getTime();
}

export default function NewReleasesPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        const res = await apiFetch('/sources');
        const sorted = [...(res.items || [])]
          .sort((a, b) => dateValue(b) - dateValue(a))
          .slice(0, 40);

        if (alive) setItems(sorted);
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
      <section className="mb-8 rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#6A4CFF]/40 to-[#00E0A8]/10 p-6 md:p-8">
        <div className="mb-3 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-black">
          NEW RELEASES
        </div>

        <h1 className="flex items-center gap-3 text-4xl font-black md:text-7xl">
          <Sparkles />
          Noutăți
        </h1>

        <p className="mt-4 max-w-3xl text-base leading-relaxed text-white/70 md:text-lg">
          Cele mai noi surse adăugate în backend.
        </p>
      </section>

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Info icon={<Film />} title="Filme noi" />
        <Info icon={<Tv />} title="Surse noi" />
        <Info icon={<CalendarPlus />} title="Adăugate recent" />
      </div>

      {loading ? (
        <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-8 text-white/50">
          Se încarcă noutățile...
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-8 text-white/50">
          Nu există încă surse adăugate.
        </div>
      ) : (
        <section>
          <h2 className="mb-5 text-3xl font-black sm:text-4xl">Adăugate recent</h2>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((item) => {
              const image = poster(item);

              return (
                <Link
                  key={`${item.id}-${item.source_id || item.url || ''}`}
                  href={`/watch/${itemId(item)}`}
                  className="group overflow-hidden rounded-3xl border border-white/10 bg-white/10 transition hover:scale-[1.02]"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-white/5">
                    {image ? (
                      <img
                        src={image}
                        alt={item.title || 'New release'}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Play size={42} className="text-white/30" />
                      </div>
                    )}

                    <div className="absolute left-2 top-2 rounded-full bg-black/70 px-2 py-1 text-[10px] font-black uppercase">
                      {item.provider || item.type || 'source'}
                    </div>
                  </div>

                  <div className="p-3">
                    <div className="line-clamp-1 text-sm font-black">
                      {item.title || 'Untitled'}
                    </div>
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
