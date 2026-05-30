'use client';

import { useMemo, useState } from 'react';
import {
  Download,
  Filter,
  Puzzle,
  Search,
  ShieldCheck,
  Star,
} from 'lucide-react';
import { apiPost } from '../../lib/apiClient';

const marketplaceAddons = [
  {
    name: 'StreamVerse Local',
    description: 'Addon local StreamVerse cu catalogs, meta, streams și subtitles.',
    manifestUrl: 'http://localhost:4000/stremio-addon/manifest.json',
    version: '1.0.0',
    category: 'Official',
    status: 'Ready',
  },
  {
    name: 'Cinemeta',
    description: 'Metadata oficial Stremio pentru filme și seriale.',
    manifestUrl: 'https://v3-cinemeta.strem.io/manifest.json',
    version: '3.0.14',
    category: 'Metadata',
    status: 'Ready',
  },
  {
    name: 'OpenSubtitles',
    description: 'Subtitles provider pentru RO/EN și alte limbi.',
    manifestUrl: '',
    version: 'API',
    category: 'Subtitles',
    status: 'Integrated',
  },
  {
    name: 'Torrentio',
    description: 'Streaming addon popular. Necesită verificare separat.',
    manifestUrl: '',
    version: 'Community',
    category: 'Streams',
    status: 'Placeholder',
  },
  {
    name: 'Trakt',
    description: 'Trending, watchlist și discovery metadata.',
    manifestUrl: '',
    version: 'Community',
    category: 'Discovery',
    status: 'Placeholder',
  },
  {
    name: 'TMDB',
    description: 'Metadata filme/seriale prin TheMovieDB.',
    manifestUrl: '',
    version: 'API',
    category: 'Metadata',
    status: 'Placeholder',
  },
];


const featuredAddons = [
  'StreamVerse Local',
  'Cinemeta',
  'OpenSubtitles',
  'TMDB',
];

const categories = [
  'All',
  'Official',
  'Metadata',
  'Streams',
  'Subtitles',
  'Discovery',
];

export default function AddonsMarketplacePage() {
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredAddons = useMemo(() => {
    const q = search.trim().toLowerCase();

    return marketplaceAddons.filter((addon) => {
      const matchesCategory =
        activeCategory === 'All' || addon.category === activeCategory;

      const matchesSearch =
        !q ||
        addon.name.toLowerCase().includes(q) ||
        addon.description.toLowerCase().includes(q) ||
        addon.category.toLowerCase().includes(q) ||
        addon.status.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [search, activeCategory]);

  function showMessage(text: string) {
    setMessage(text);
    setTimeout(() => setMessage(''), 2500);
  }

  async function install(addon: any) {
    if (!addon.manifestUrl) {
      showMessage('⚠️ Addon încă nu are manifest URL configurat');
      return;
    }

    try {
      await apiPost('/addons/install', {
        manifestUrl: addon.manifestUrl,
      });

      showMessage(`✅ ${addon.name} instalat`);
    } catch (error: any) {
      showMessage(
        `❌ Install failed: ${error?.message || 'unknown'}`
      );
    }
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-black p-4 pb-56 text-white md:p-10">
      {message && (
        <div className="fixed left-1/2 top-6 z-[9999] max-w-[90vw] -translate-x-1/2 rounded-2xl border border-white/10 bg-black/90 px-6 py-4 font-black shadow-2xl">
          {message}
        </div>
      )}

      <div className="mb-10 flex items-center gap-4">
        <div className="rounded-3xl bg-[#6A4CFF]/20 p-4">
          <Puzzle
            className="text-[#B8A7FF]"
            size={34}
          />
        </div>

        <div>
          <h1 className="text-4xl font-black md:text-5xl">
            Addon Marketplace
          </h1>

          <p className="mt-2 text-white/60">
            Caută, filtrează și instalează addons
            compatibile StreamVerse/Stremio-like.
          </p>

          <a
            href="/addons"
            className="mt-4 inline-flex rounded-2xl bg-white/10 px-5 py-3 text-sm font-black text-white transition hover:bg-white/20"
          >
            Open Addons Manager
          </a>
        </div>
      </div>

      <section className="mb-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5">
          <div className="text-sm font-black uppercase text-white/40">
            Ready
          </div>

          <div className="mt-2 text-4xl font-black text-[#00E0A8]">
            {
              marketplaceAddons.filter(
                (addon) => addon.status === 'Ready'
              ).length
            }
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5">
          <div className="text-sm font-black uppercase text-white/40">
            Integrated
          </div>

          <div className="mt-2 text-4xl font-black text-[#B8A7FF]">
            {
              marketplaceAddons.filter(
                (addon) => addon.status === 'Integrated'
              ).length
            }
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5">
          <div className="text-sm font-black uppercase text-white/40">
            Visible
          </div>

          <div className="mt-2 text-4xl font-black">
            {filteredAddons.length}
          </div>
        </div>
      </section>


      <section className="mb-8">
        <div className="mb-4 flex items-center gap-2">
          <Star className="text-yellow-400" size={22} />
          <h2 className="text-2xl font-black">
            Featured Addons
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {marketplaceAddons
            .filter((addon) => featuredAddons.includes(addon.name))
            .map((addon) => (
              <div
                key={`featured-${addon.name}`}
                className="rounded-[2rem] border border-yellow-500/20 bg-gradient-to-br from-yellow-500/10 to-transparent p-5"
              >
                <div className="mb-2 flex items-center gap-2">
                  <Star size={16} className="text-yellow-400" />
                  <span className="text-xs font-black uppercase text-yellow-300">
                    Featured
                  </span>
                </div>

                <h3 className="text-xl font-black">
                  {addon.name}
                </h3>

                <p className="mt-2 text-sm text-white/60">
                  {addon.description}
                </p>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <div className="text-xs text-white/40">
                    {addon.category}
                  </div>

                  <button
                    onClick={() => install(addon)}
                    className="rounded-2xl bg-yellow-400 px-4 py-2 text-xs font-black text-black"
                  >
                    Install
                  </button>
                </div>
              </div>
            ))}
        </div>
      </section>

      <section className="mb-8 rounded-[2rem] border border-white/10 bg-white/[0.04] p-5">
        <div className="mb-4 flex items-center gap-2">
          <Search size={18} />
          <span className="font-black">
            Search & Filters
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-[1fr_auto]">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40"
            />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search addons..."
              className="w-full rounded-2xl border border-white/10 bg-black/40 py-4 pl-12 pr-5 outline-none"
            />
          </div>

          <div className="flex items-center gap-2 rounded-2xl bg-black/40 px-4 py-3 text-white/60">
            <Filter size={16} />
            {activeCategory}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`rounded-full px-4 py-2 text-sm font-black ${
                activeCategory === category
                  ? 'bg-[#00E0A8] text-black'
                  : 'bg-white/10 text-white/70'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {filteredAddons.map((addon) => (
          <div
            key={addon.name}
            className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 transition hover:border-[#6A4CFF]"
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-2xl font-black">{addon.name}</h2>
                <p className="mt-1 text-sm text-white/50">{addon.category}</p>
              </div>

              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black text-white/60">
                {addon.version}
              </span>
            </div>

            <p className="min-h-20 text-white/60">
              {addon.description}
            </p>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm text-[#00E0A8]">
                {addon.status === 'Ready' ? <ShieldCheck size={16} /> : <Star size={16} />}
                {addon.status}
              </div>

              <button
                onClick={() => install(addon)}
                className="flex items-center gap-2 rounded-2xl bg-[#00E0A8] px-5 py-3 font-black text-black"
              >
                <Download size={16} />
                Install
              </button>
            </div>

            <div className="mt-4 break-all text-xs text-white/35">
              {addon.manifestUrl || 'Manifest URL not configured yet'}
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
