'use client';

import { apiFetch } from '../../lib/apiClient';
import { useState } from 'react';
import Link from 'next/link';
import { Search, Play, X, Star } from 'lucide-react';

function poster(item: any) {
  return item.poster || item.thumbnail || item.metadata?.thumbnail || '';
}

function provider(item: any) {
  return item.provider || item.source_type || item.type || 'source';
}

function watchId(item: any) {
  return item.source_id || item.id;
}

export default function SearchPage() {
  const [q, setQ] = useState('');
  const [items, setItems] = useState<any[]>([]);
  const [type, setType] = useState('');
  const [activeProvider, setActiveProvider] = useState('');
  const [year, setYear] = useState('');
  const [loading, setLoading] = useState(false);

  async function runSearch(nextQ = q, nextType = type, nextProvider = activeProvider, nextYear = year) {
    setLoading(true);

    const params = new URLSearchParams();
    if (nextQ.trim()) params.set('q', nextQ.trim());
    if (nextType) params.set('type', nextType);
    if (nextProvider) params.set('provider', nextProvider);
    if (nextYear.trim()) params.set('year', nextYear.trim());
    params.set('limit', '40');

    try {
      const data = await apiFetch(`/search?${params.toString()}`);
      setItems(data.items || []);
    } catch {
      setItems([]);
    }

    setLoading(false);
  }

  const providers = ['', 'youtube', 'iframe', 'mp4', 'rumble', 'tiktok', 'vimeo', 'dailymotion', 'terabox'];
  const types = ['', 'movie', 'series', 'anime', 'music', 'sports', 'tv', 'custom'];

  return (
    <main className="min-h-screen bg-black p-6 pb-56 text-white md:p-10 md:pb-20">
      <section className="glass mb-8 rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-6 md:p-8">
        <div className="mb-3 inline-flex rounded-full bg-[#6A4CFF]/20 px-4 py-2 text-xs font-black uppercase text-[#B8A7FF]">
          UNIVERSAL SEARCH
        </div>

        <h1 className="flex items-center gap-3 text-4xl font-black md:text-5xl">
          <Search /> Search
        </h1>

        <div className="relative mt-8">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/40" size={22} />

          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              runSearch(e.target.value, type, activeProvider, year);
            }}
            autoFocus
            placeholder="Caută filme, seriale, anime, provider, an..."
            className="w-full rounded-[2rem] border border-white/10 bg-black/40 py-5 pl-14 pr-14 text-lg outline-none focus:border-[#6A4CFF]"
          />

          {q && (
            <button
              onClick={() => {
                setQ('');
                runSearch('', type, activeProvider, year);
              }}
              className="absolute right-5 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {loading && (
          <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-1/3 animate-pulse rounded-full bg-[#6A4CFF]" />
          </div>
        )}

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <select
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              runSearch(q, e.target.value, activeProvider, year);
            }}
            className="rounded-2xl border border-white/10 bg-black/60 px-4 py-3 font-bold text-white outline-none"
          >
            {types.map((x) => (
              <option key={x} value={x}>
                {x || 'All types'}
              </option>
            ))}
          </select>

          <select
            value={activeProvider}
            onChange={(e) => {
              setActiveProvider(e.target.value);
              runSearch(q, type, e.target.value, year);
            }}
            className="rounded-2xl border border-white/10 bg-black/60 px-4 py-3 font-bold text-white outline-none"
          >
            {providers.map((x) => (
              <option key={x} value={x}>
                {x || 'All providers'}
              </option>
            ))}
          </select>

          <input
            value={year}
            onChange={(e) => {
              setYear(e.target.value);
              runSearch(q, type, activeProvider, e.target.value);
            }}
            placeholder="Year: 2009"
            className="rounded-2xl border border-white/10 bg-black/60 px-4 py-3 font-bold text-white outline-none"
          />
        </div>
      </section>

      <section>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl font-black">Results</h2>
          <div className="rounded-full bg-white/10 px-4 py-2 text-sm font-black text-white/60">
            {items.length} found
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => {
            const image = poster(item);

            return (
              <Link
                key={`${item.id}-${item.content_id}`}
                href={`/watch/${watchId(item)}`}
                className="group overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] transition hover:-translate-y-1 hover:border-[#6A4CFF]"
              >
                <div className="relative aspect-[16/10] bg-white/5">
                  {image ? (
                    <img src={image} alt={item.title} className="h-full w-full object-cover transition group-hover:scale-105" />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Play className="text-white/30" size={44} />
                    </div>
                  )}

                  <div className="absolute left-3 top-3 rounded-full bg-black/70 px-3 py-1 text-xs font-black uppercase">
                    {provider(item)}
                  </div>

                  {typeof item.score === 'number' && (
                    <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-[#FFD54A] px-3 py-1 text-xs font-black text-black">
                      <Star size={12} fill="currentColor" />
                      {item.score}
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />
                </div>

                <div className="p-4">
                  <h3 className="line-clamp-2 text-lg font-black">
                    {item.title}
                  </h3>

                  {item.year && (
                    <p className="mt-2 text-sm text-white/50">
                      {item.year}
                    </p>
                  )}

                  {item.description && (
                    <p className="mt-3 line-clamp-3 text-sm text-white/40">
                      {item.description}
                    </p>
                  )}

                  <div className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-[#6A4CFF] px-4 py-3 font-black">
                    <Play size={16} />
                    Watch
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
