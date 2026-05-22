'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { LibraryBig, Play } from 'lucide-react';
import { apiFetch } from '../../lib/apiClient';

function poster(item: any) {
  return item.poster || item.backdrop || item.thumbnail || item.metadata?.thumbnail || '';
}

function itemId(item: any) {
  return item.source_id || item.id;
}

function collectionKey(item: any) {
  return (
    item.metadata?.collection ||
    item.metadata?.category ||
    item.content_type ||
    item.provider ||
    item.type ||
    'General'
  );
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function CollectionsPage() {
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
      const key = String(collectionKey(item) || 'General');
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    }

    return Array.from(map.entries()).slice(0, 24);
  }, [sources]);

  return (
    <main className="min-h-screen overflow-x-hidden bg-black px-4 pb-32 pt-24 text-white md:px-10 md:pb-20 md:pt-10">
      <section className="mb-8 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 md:p-8">
        <div className="mb-3 inline-flex rounded-full bg-[#6A4CFF]/20 px-4 py-2 text-sm font-black text-[#B8A7FF]">
          COLLECTION HUB
        </div>

        <h1 className="flex items-center gap-3 text-4xl font-black md:text-7xl">
          <LibraryBig />
          Colecții
        </h1>

        <p className="mt-4 max-w-3xl text-base leading-relaxed text-white/70 md:text-lg">
          Colecții generate din categorii, provideri și metadata reale salvate în backend.
        </p>
      </section>

      {loading ? (
        <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-8 text-white/50">
          Se încarcă colecțiile...
        </div>
      ) : groups.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-8 text-white/50">
          Nu există încă surse salvate.
        </div>
      ) : (
        <div className="space-y-10">
          {groups.map(([name, items]) => {
            const first = items[0];
            const image = first ? poster(first) : '';

            return (
              <section key={name}>
                <div className="mb-5 flex items-center justify-between gap-3">
                  <h2 className="text-3xl font-black sm:text-4xl">{name}</h2>

                  <Link
                    href={`/discover/${slugify(name)}`}
                    className="rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-white/70 hover:bg-white/20"
                  >
                    Vezi
                  </Link>
                </div>

                <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
                  {items.slice(0, 12).map((item) => {
                    const itemImage = poster(item) || image;

                    return (
                      <Link
                        key={`${name}-${item.id}-${item.source_id || item.url || ''}`}
                        href={`/watch/${itemId(item)}`}
                        className="group overflow-hidden rounded-3xl border border-white/10 bg-white/10 transition hover:scale-[1.02]"
                      >
                        <div className="relative aspect-[16/10] overflow-hidden bg-white/5">
                          {itemImage ? (
                            <img
                              src={itemImage}
                              alt={item.title || name}
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
            );
          })}
        </div>
      )}
    </main>
  );
}
