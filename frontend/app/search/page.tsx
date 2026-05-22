'use client';
import { apiFetch } from '../../lib/apiClient';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, Play, Filter, X } from 'lucide-react';

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
  const [aiItems, setAiItems] = useState<any[]>([]);
  const [aiMode, setAiMode] = useState(false);
  const [activeProvider, setActiveProvider] = useState('all');
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
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

    load();

    try {
      apiFetch('/search/recent').then((data) => setRecentSearches(data.items || [])).catch(() => setRecentSearches([]));
    } catch {
      setRecentSearches([]);
    }
  }, []);

  const providers = useMemo(() => {
    const set = new Set<string>();

    for (const item of items) {
      set.add(provider(item));
    }

    return ['all', ...Array.from(set)];
  }, [items]);

  const results = useMemo(() => {
    const value = q.trim().toLowerCase();

    return items.filter((item) => {
      const itemProvider = provider(item);

      const matchesProvider =
        activeProvider === 'all' || itemProvider === activeProvider;

      const category = String(item.content_type || item.metadata?.category || item.type || '').toLowerCase();

      const matchesTab =
        activeTab === 'all' ||
        (activeTab === 'movies' && ['movie', 'movies', 'film', 'films'].some((x) => category.includes(x))) ||
        (activeTab === 'series' && ['series', 'tv', 'show'].some((x) => category.includes(x))) ||
        (activeTab === 'anime' && category.includes('anime')) ||
        (activeTab === 'sources');

      const matchesText =
        !value ||
        [
          item.title,
          item.url,
          itemProvider,
          item.content_type,
          item.metadata?.category,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(value);

      return matchesProvider && matchesText && matchesTab;
    });
  }, [q, items, activeProvider, activeTab]);

  async function runAiSearch(value: string) {
    const clean = value.trim();

    if (clean.length < 2) {
      setAiItems([]);
      setAiMode(false);
      return;
    }

    try {
      const data = await apiFetch(`/discovery/search?q=${encodeURIComponent(clean)}`);
      setAiItems(data.items || []);
      setAiMode(Boolean(data.items?.length));
    } catch {
      setAiItems([]);
      setAiMode(false);
    }
  }

  function onSearch(value: string) {
    setLoading(true);
    setQ(value);
    runAiSearch(value);

    const clean = value.trim();

    if (clean.length >= 2) {
      const next = [
        clean,
        ...recentSearches.filter((x) => x.toLowerCase() !== clean.toLowerCase()),
      ].slice(0, 8);

      setRecentSearches(next);
      apiFetch('/search/recent', {
        method: 'POST',
        body: JSON.stringify({ items: next }),
      }).catch(() => null);
    }

    window.setTimeout(() => {
      setLoading(false);
    }, 150);
  }

  function clearRecentSearches() {
    setRecentSearches([]);
    apiFetch('/search/recent', { method: 'DELETE' }).catch(() => null);
  }

  const visibleResults = aiMode ? aiItems : results;

  return (
    <main className="min-h-screen bg-black p-6 pb-36 text-white md:p-10 md:pb-20">
      <section className="hero-glow glass mb-8 rounded-[2.5rem] p-8">
        <div className="mb-3 inline-flex rounded-full bg-[#6A4CFF]/20 px-4 py-2 text-xs font-black uppercase text-[#B8A7FF]">
          GLOBAL SEARCH
        </div>

        <h1 className="flex items-center gap-3 text-5xl font-black">
          <Search />
          Search
        </h1>

        <div className="relative mt-8">
          <Search
            className="absolute left-5 top-1/2 -translate-y-1/2 text-white/40"
            size={22}
          />

          <input
            value={q}
            onChange={(e) => onSearch(e.target.value)}
            autoFocus
            placeholder="Caută filme, surse, provider, categorie..."
            className="w-full rounded-[2rem] border border-white/10 bg-black/40 py-5 pl-14 pr-14 text-lg outline-none focus:border-[#6A4CFF]"
          />

          {q && (
            <button
              onClick={() => onSearch('')}
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

        <div className="hide-scrollbar mt-6 flex gap-2 overflow-x-auto">
          {[
            ['all', 'All'],
            ['movies', 'Movies'],
            ['series', 'Series'],
            ['anime', 'Anime'],
            ['sources', 'Sources'],
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`rounded-full px-5 py-3 text-sm font-black uppercase transition ${
                activeTab === key
                  ? 'bg-white text-black'
                  : 'bg-white/10 text-white/60'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="hide-scrollbar mt-5 flex gap-2 overflow-x-auto">
          {providers.map((p) => (
            <button
              key={p}
              onClick={() => setActiveProvider(p)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-black uppercase transition ${
                activeProvider === p
                  ? 'bg-[#6A4CFF] text-white'
                  : 'bg-white/10 text-white/60'
              }`}
            >
              <Filter size={14} />
              {p}
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
              <div className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-white/40">
                Trending searches
              </div>

              <div className="flex flex-wrap gap-2">
                {items.slice(0, 8).map((item) => {
                  const term = item.title || provider(item);

                  return (
                    <button
                      key={`${item.id || item.source_id}-${term}`}
                      onClick={() => onSearch(term)}
                      className="rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-white/70 transition hover:bg-[#6A4CFF] hover:text-white"
                    >
                      {term}
                    </button>
                  );
                })}

                {items.length === 0 && (
                  <span className="text-sm text-white/35">
                    Sugestiile apar după ce există surse salvate.
                  </span>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="text-xs font-black uppercase tracking-[0.2em] text-white/40">
                  Recent searches
                </div>

                {recentSearches.length > 0 && (
                  <button onClick={clearRecentSearches} className="text-xs font-bold text-red-300">
                    Clear
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {recentSearches.length === 0 ? (
                  <span className="text-sm text-white/35">Nicio căutare recentă.</span>
                ) : (
                  recentSearches.map((term) => (
                    <button
                      key={term}
                      onClick={() => onSearch(term)}
                      className="rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-white/70 transition hover:bg-white/20"
                    >
                      {term}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

        <p className="mt-4 text-white/40">
          {visibleResults.length} rezultate găsite
        </p>
      </section>

      <section className="sticky top-0 z-40 -mx-6 mb-4 border-b border-white/10 bg-black/95 px-6 py-4 backdrop-blur-xl md:-mx-10 md:px-10">
        <div className="relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/40" size={20} />

          <input
            value={q}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Caută cu AI: filme, surse, provider, mood..."
            className="w-full rounded-2xl border border-white/10 bg-white/10 py-4 pl-12 pr-12 text-base font-bold text-white outline-none placeholder:text-white/35 focus:border-[#6A4CFF]"
          />

          {q && (
            <button
              onClick={() => onSearch('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {q && (
          <div className="mt-3 text-xs font-bold text-[#B8A7FF]">
            AI Semantic Search activ pentru: {q}
          </div>
        )}
      </section>

      <div className="sticky top-0 z-30 -mx-6 mb-6 border-y border-white/10 bg-black/90 px-6 py-3 backdrop-blur-xl md:-mx-10 md:px-10">
        <div className="hide-scrollbar flex gap-2 overflow-x-auto">
          {[
            ['all', 'All'],
            ['movies', 'Movies'],
            ['series', 'Series'],
            ['anime', 'Anime'],
            ['sources', 'Sources'],
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`rounded-full px-5 py-3 text-sm font-black uppercase transition ${
                activeTab === key
                  ? 'bg-white text-black'
                  : 'bg-white/10 text-white/60'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {visibleResults.length === 0 ? (
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-10 text-center text-white/50">
          Nu există rezultate pentru această căutare.
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {visibleResults.map((item) => {
            const itemProvider = provider(item);
            const image = poster(item);

            return (
              <Link
                key={`${item.id}-${item.source_id || ''}`}
                href={`/watch/${watchId(item)}`}
                className={`group netflix-card card-hover provider-${itemProvider} overflow-hidden rounded-[2rem] glass`}
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-black">
                  {image ? (
                    <img
                      src={image}
                      alt={item.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-white/5">
                      <Play size={60} className="text-white/40" />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                  <div className="absolute left-4 top-4 rounded-full bg-black/70 px-3 py-1 text-xs font-black uppercase">
                    {itemProvider}
                  </div>

                  {typeof item.aiScore === 'number' && (
                    <div className="absolute right-4 top-4 rounded-full bg-[#6A4CFF] px-3 py-1 text-xs font-black uppercase">
                      AI Search Result · {item.aiScore}
                    </div>
                  )}

                  <div className="absolute inset-0 flex items-center justify-center opacity-0 transition duration-300 group-hover:opacity-100">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 text-black shadow-2xl">
                      <Play size={32} fill="currentColor" />
                    </div>
                  </div>
                </div>

                <div className="relative z-10 p-5">
                  <h2 className="line-clamp-2 text-2xl font-black">
                    {item.title}
                  </h2>

                  <p className="mt-3 line-clamp-2 break-all text-sm text-white/40">
                    {item.url}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
