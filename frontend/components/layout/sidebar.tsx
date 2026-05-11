'use client';

import Link from 'next/link';
import { useState } from 'react';

const sections = [
  {
    title: 'Principal',
    items: [
      ['🏠', 'Acasă', '/'],
      ['🔎', 'Discover', '/discover'],
      ['▦', 'Library', '/library'],
      ['📚', 'Collections', '/collections'],
      ['🎞️', 'Studios', '/studios'],
      ['🕒', 'Continue Watching', '/continue-watching'],
      ['❤️', 'Watchlist', '/watchlist'],
      ['⌕', 'Căutare', '/search'],
    ],
  },
  {
    title: 'Media',
    items: [
      ['🔥', 'Trending', '/discover/trending-movie'],
      ['🆕', 'Noutăți', '/discover/new-releases'],
      ['🎬', 'Filme', '/discover/popular-movie'],
      ['📺', 'Seriale', '/discover/popular-series'],
      ['🇯🇵', 'Anime', '/discover/kitsu-trending-anime'],
      ['🧸', 'Kids', '/discover/kids'],
    ],
  },
  {
    title: 'Surse',
    items: [
      ['🎞️', 'TMDB', '/discover/tmdb-popular-movie'],
      ['⭐', 'IMDb', '/discover/imdb-movie'],
      ['🎭', 'Trakt', '/discover/trakt'],
      ['▶', 'YouTube', '/discover/movie-trailers'],
      ['🎵', 'Music', '/discover/music-videos'],
      ['📡', 'Live TV', '/live-tv'],
      ['▶️', 'Player', '/player'],
      ['🗄️', 'Sources', '/sources'],
      ['📥', 'Downloads', '/downloads'],
    ],
  },
  {
    title: 'Extra',
    items: [
      ['🧠', 'AI Hub', '/ai-hub'],
      ['🤖', 'AI Metadata', '/ai-metadata'],
      ['⚽', 'Sports', '/discover/sports'],
      ['📚', 'Courses', '/discover/video-courses'],
      ['🌍', 'Languages', '/languages'],
      ['⚙', 'Settings', '/settings'],
      ['🛠️', 'Admin', '/admin'],
      ['📊', 'API Registry', '/api-registry'],
      ['✅', 'System Health', '/system-health'],
      ['📰', 'News Hub', '/news-hub'],
      ['🗺️', 'Sitemap Scanner', '/sitemap-scanner'],
      ['💾', 'Backup', '/backup'],
    ],
  },
];

export default function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed left-2 top-16 z-50 rounded-xl border border-white/10 bg-black/80 px-3 py-2 text-sm backdrop-blur sm:left-4 sm:top-4 sm:text-base"
        >
          ☰
        </button>
      )}

      {open && (
        <button
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 h-full w-[260px] border-r border-white/10 bg-[#07070d]/95 backdrop-blur-2xl transition-transform duration-300 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/10 p-5">
          <div>
            <div className="text-xl font-black">StreamVerse</div>
            <div className="text-xs text-[#00E0A8]">Premium Streaming</div>
          </div>

          <button onClick={() => setOpen(false)} className="rounded-lg bg-white/10 px-2 py-1">
            ✕
          </button>
        </div>

        <div className="h-[calc(100vh-82px)] overflow-y-auto px-4 py-6 pb-32">
          {sections.map((section) => (
            <div key={section.title} className="mb-7">
              <div className="mb-3 px-2 text-[10px] font-black uppercase tracking-[0.25em] text-white/30">
                {section.title}
              </div>

              <div className="space-y-1">
                {section.items.map(([icon, label, href]) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-white/80 hover:bg-white/10 hover:text-white"
                  >
                    <span className="text-lg">{icon}</span>
                    <span>{label}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}

          <div className="mt-6 rounded-3xl border border-white/10 bg-gradient-to-br from-[#6A4CFF]/30 to-[#00E0A8]/10 p-5">
            <div className="font-black">StreamVerse+</div>
            <p className="mt-2 text-xs text-white/60">
              AI recommendations, live TV, addons și player universal premium.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
