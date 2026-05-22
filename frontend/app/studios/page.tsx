'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Building2, Play } from 'lucide-react';
import { apiFetch } from '../../lib/apiClient';

function poster(item: any) {
  return item.poster || item.backdrop || item.thumbnail || item.metadata?.thumbnail || '';
}

function itemId(item: any) {
  return item.source_id || item.id;
}

export default function StudiosPage() {
  const [sources, setSources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        const res = await apiFetch('/sources');
        if (alive) setSources(res.items || []);
      } catch {
        if (alive) setSources([]);
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();

    return () => {
      alive = false;
    };
  }, []);

  const groups = useMemo(() => {
    const map = new Map<string, any[]>();

    for (const item of sources) {
      const key = item.metadata?.studio || item.metadata?.provider || item.provider || item.type || 'Unknown';
      const label = String(key || 'Unknown');

      if (!map.has(label)) map.set(label, []);
      map.get(label)!.push(item);
    }

    return Array.from(map.entries()).slice(0, 12);
  }, [sources]);

  return (
    <main className="min-h-screen overflow-x-hidden bg-black px-4 pb-32 pt-24 text-white md:px-10 md:pb-20 md:pt-10">
      <section className="mb-8 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 md:p-8">
        <div className="mb-3 inline-flex rounded-full bg-[#00E0A8]/20 px-4 py-2 text-sm font-black text-[#00E0A8]">
          STUDIO CATALOG
        </div>

        <h1 className="flex items-center gap-3 text-4xl font-black md:text-7xl">
          <Building2 />
          Studios
        </h1>

        <p className="mt-4 max-w-3xl text-base leading-relaxed text-white/70 md:text-lg">
          Conținut grupat după provider/studio din date reale salvate în backend.
        </p>
      </section>

      {loading ? (
        <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-8 text-white/50">
          Se încarcă studiourile...
        </div>
      ) : groups.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-8 text-white/50">
          Nu există încă surse salvate.
        </div>
      ) : (
        <div className="space-y-10">
          {groups.map(([studio, items]) => (
            <section key={studio}>
              <h2 className="mb-5 text-3xl font-black sm:text-4xl">{studio}</h2>

              <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
                {items.slice(0, 12).map((item) => {
                  const image = poster(item);

                  return (
                    <Link
                      key={`${studio}-${item.id}-${item.source_id || item.url || ''}`}
                      href={`/watch/${itemId(item)}`}
                      className="group overflow-hidden rounded-3xl border border-white/10 bg-white/10 transition hover:scale-[1.02]"
                    >
                      <div className="relative aspect-[16/10] overflow-hidden bg-white/5">
                        {image ? (
                          <img
                            src={image}
                            alt={item.title || studio}
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Play size={42} className="text-white/30" />
                          </div>
                        )}
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
          ))}
        </div>
      )}
    </main>
  );
}
