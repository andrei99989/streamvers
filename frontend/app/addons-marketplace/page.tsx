'use client';

import { useState } from 'react';
import { Download, Puzzle, ShieldCheck, Star } from 'lucide-react';
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

export default function AddonsMarketplacePage() {
  const [message, setMessage] = useState('');

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
      await apiPost('/addons/install', { manifestUrl: addon.manifestUrl });
      showMessage(`✅ ${addon.name} instalat`);
    } catch (error: any) {
      showMessage(`❌ Install failed: ${error?.message || 'unknown'}`);
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
          <Puzzle className="text-[#B8A7FF]" size={34} />
        </div>

        <div>
          <h1 className="text-4xl font-black md:text-5xl">
            Addon Marketplace
          </h1>
          <p className="mt-2 text-white/60">
            Instalează rapid addons compatibile StreamVerse/Stremio-like.
          </p>
        </div>
      </div>

      <section className="mb-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5">
          <div className="text-sm font-black uppercase text-white/40">Ready</div>
          <div className="mt-2 text-4xl font-black text-[#00E0A8]">
            {marketplaceAddons.filter((addon) => addon.status === 'Ready').length}
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5">
          <div className="text-sm font-black uppercase text-white/40">Integrated</div>
          <div className="mt-2 text-4xl font-black text-[#B8A7FF]">
            {marketplaceAddons.filter((addon) => addon.status === 'Integrated').length}
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5">
          <div className="text-sm font-black uppercase text-white/40">Coming Next</div>
          <div className="mt-2 text-4xl font-black">
            {marketplaceAddons.filter((addon) => addon.status === 'Placeholder').length}
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {marketplaceAddons.map((addon) => (
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
