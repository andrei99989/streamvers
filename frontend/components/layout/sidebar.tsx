'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
      ['🧩', 'Addons', '/addons'],
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
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed left-2 top-16 z-[9999] rounded-xl border border-white/10 bg-black/80 px-3 py-2 text-sm backdrop-blur sm:left-4 sm:top-4 sm:text-base"
        >
          ☰
        </button>
      )}

      {open && (
        <button
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-[80] bg-black/80 backdrop-blur-sm"
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-[90] h-full w-[82vw] max-w-[320px] overflow-hidden border-r border-white/10 bg-[#050510]/95 shadow-[0_0_50px_rgba(0,0,0,.8)] backdrop-blur-3xl transition-transform duration-300 sm:w-[320px] ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/10 p-6">
          <div>
            <div className="text-3xl font-black leading-none">StreamVerse</div>
            <div className="mt-2 text-lg text-[#00E0A8]">Premium Streaming</div>
          </div>

          <button
            onClick={() => setOpen(false)}
            className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-3xl"
          >
            ×
          </button>
        </div>

        <div className="min-h-screen overflow-visible px-6 py-7 pb-[260px]">
          {sections.map((section) => (
            <div key={section.title} className="mb-8">
              <div className="mb-4 px-2 text-[13px] font-black uppercase tracking-[0.35em] text-white/30">
                {section.title}
              </div>

              <div className="space-y-2">
                {section.items.map(([icon, label, href]) => {
                  const active =
                    pathname === href ||
                    (href !== '/' && pathname.startsWith(href));

                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-5 rounded-3xl px-5 py-4 text-xl font-black transition-all duration-300 ${
                        active
                          ? 'bg-white/10 text-white shadow-[0_0_30px_rgba(106,76,255,.25)]'
                          : 'text-white/70 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <span className="text-3xl">{icon}</span>
                      <span>{label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="mt-8 rounded-3xl border border-white/10 bg-gradient-to-br from-[#6A4CFF]/30 to-[#00E0A8]/10 p-7">
            <div className="text-2xl font-black">StreamVerse+</div>
            <p className="mt-4 text-lg leading-relaxed text-white/60">
              AI recommendations, live TV, addons și player universal premium.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
