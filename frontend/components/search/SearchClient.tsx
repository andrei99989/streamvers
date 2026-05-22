'use client';
import { apiFetch, apiPost } from '../../lib/apiClient';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, Play, Plus } from 'lucide-react';

function poster(item: any) {
  return item.poster || item.thumbnail || item.metadata?.thumbnail || '';
}

function provider(item: any) {
  return item.provider || item.source_type || item.type || 'source';
}

function watchId(item: any) {
  return item.source_id || item.id;
}

export default function SearchClient() {
  const [q, setQ] = useState('');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);

    try {
      const [sources, history, favorites, cont] = await Promise.all([
        apiFetch('/sources'),
        apiFetch('/history'),
        apiFetch('/favorites'),
        apiFetch('/continue'),
      ]);

      const merged = [
        ...(sources.items || []),
        ...(history.items || []),
        ...(favorites.items || []),
        ...(cont.items || []),
      ];

      const unique = new Map();

      for (const item of merged) {
        const id = String(item.source_id || item.id);
        if (!unique.has(id)) unique.set(id, item);
      }

      setItems([...unique.values()]);
    } catch {
      setItems([]);
    }

    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const results = useMemo(() => {
    const value = q.trim().toLowerCase();

    if (!value) return items;

    return items.filter((item) =>
      [
        item.title,
        item.url,
        provider(item),
        item.content_type,
        item.metadata?.category,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(value)
    );
  }, [q, items]);

  async function addToLibrary(item: any) {
    await apiPost('/library', {
        sourceId: String(watchId(item)),
        contentId: String(item.content_id || ''),
        title: item.title || 'Untitled',
        url: item.url || '',
        provider: provider(item),
        sourceType: item.source_type || item.type || provider(item),
        poster: poster(item),
        metadata: item.metadata || {},
      });
  }

  return (
    <main className="min-h-screen bg-black p-6 pb-56 text-white md:p-10 md:pb-20">
      <section className="hero-glow glass mb-8 rounded-[2.5rem] p-8">
        <div className="mb-3 inline-flex rounded-full bg-[#6A4CFF]/20 px-4 py-2 text-xs font-black uppercase text-[#B8A7FF]">
          NEON SEARCH
        </div>

        <h1 className="flex items-center gap-3 text-5xl font-black md:text-7xl">
          <Search />
          Căutare Universală
        </h1>

        <div className="relative mt-8">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/40" size={22} />

          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Caută în sursele sincronizate Neon..."
            className="w-full rounded-[2rem] border border-white/10 bg-black/40 py-5 pl-14 pr-5 text-lg outline-none focus:border-[#6A4CFF]"
          />
        </div>

        <p className="mt-4 text-white/40">
          {loading ? 'Se încarcă...' : `${results.length} rezultate`}
        </p>
      </section>

      {results.length === 0 ? (
        <div className="glass rounded-[2rem] p-10 text-center text-white/50">
          Nu există rezultate în Neon.
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {results.map((item) => (
            <div
              key={`${item.id}-${item.source_id || ''}`}
              className="group overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] transition hover:-translate-y-1 hover:border-[#6A4CFF]"
            >
              <Link href={`/watch/${watchId(item)}`}>
                <div className="relative aspect-[16/10] overflow-hidden bg-black">
                  {poster(item) ? (
                    <img
                      src={poster(item)}
                      alt={item.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-white/5">
                      <Play size={60} className="text-white/40" />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                  <div className="absolute left-4 top-4 rounded-full bg-black/70 px-3 py-1 text-xs font-black uppercase">
                    {provider(item)}
                  </div>
                </div>
              </Link>

              <div className="p-5">
                <Link href={`/watch/${watchId(item)}`}>
                  <h2 className="line-clamp-2 text-2xl font-black hover:text-[#B8A7FF]">
                    {item.title}
                  </h2>
                </Link>

                <p className="mt-2 line-clamp-2 break-all text-sm text-white/40">
                  {item.url}
                </p>

                <button
                  onClick={() => addToLibrary(item)}
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#6A4CFF] px-4 py-2 text-sm font-black"
                >
                  <Plus size={16} />
                  Library
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
