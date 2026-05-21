'use client';

import Link from 'next/link';
import { useState } from 'react';

const sections = [
  {
    title: 'Principal',
    items: [
      ['/', 'Acasă', '⌂'],
      ['/trending', 'Trending / Popular / Top Rated', '🔥'],
      ['/new-releases', 'Noutăți', '🆕'],
      ['/movies', 'Filme', '🎬'],
      ['/series', 'Seriale', '📺'],
      ['/continue-watching', 'Continue Watching', '🕒'],
      ['/watchlist', 'Favorite / Watchlist', '❤️']
    ]
  },
  {
    title: 'Descoperire',
    items: [
      ['/discover', 'Discover', '✦'],
      ['/library', 'Library', '▦'],
      ['/collections', 'Colecții / Franchises', '📚'],
      ['/studios', 'Studios', '🎞️'],
      ['/countries', 'Țări', '🌍'],
      ['/languages', 'Limbi / Subtitrări', '💬']
    ]
  },
  {
    title: 'Hub-uri',
    items: [
      ['/ai-hub', 'AI Hub', '🧠'],
      ['/anime-hub', 'Anime Hub', '🇯🇵'],
      ['/kids-hub', 'Kids Hub', '🧸'],
      ['/documentary-hub', 'Documentary Hub', '🎥'],
      ['/sports-hub', 'Sports Hub', '⚽'],
      ['/music-hub', 'Music Videos Hub', '🎵']
    ]
  },
  {
    title: 'Streaming',
    items: [
      ['/live-tv', 'Live TV', '◉'],
      ['/addons', 'Addons', '▣'],
      ['/upload', 'Upload', '＋'],
      ['/downloads', 'Downloads', '📥']
    ]
  },
  {
    title: 'Explore',
    items: [
      ['/explore/random', 'Random Movie', '🎲'],
      ['/explore/wheel', 'Wheel Picker', '🎡'],
      ['/explore/surprise', 'Surprise Me', '🧭']
    ]
  },
  {
    title: 'Cont & Admin',
    items: [
      ['/profiles', 'Profiluri', '☻'],
      ['/account', 'Cont / Abonament', '👤'],
      ['/settings', 'Settings', '⚙'],
      ['/admin', 'Admin', '🛠️']
    ]
  }
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);

  async function searchAlgolia(value: string) {
    setQuery(value);
    if (value.length < 2) return setResults([]);

    try {
      const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
      const apiKey = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY;
      const index = process.env.NEXT_PUBLIC_ALGOLIA_INDEX || 'movies';

      const res = await fetch(`https://${appId}-dsn.algolia.net/1/indexes/${index}/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Algolia-API-Key': apiKey || '',
          'X-Algolia-Application-Id': appId || ''
        },
        body: JSON.stringify({ query: value, hitsPerPage: 8 })
      });

      const data = await res.json();
      setResults(data.hits || []);
    } catch {
      setResults([]);
    }
  }

  return (
    <div className="min-h-screen bg-[#05050a] text-white">
      <header className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between border-b border-white/10 bg-black/45 px-4 backdrop-blur-md">
        <button onClick={() => setOpen(true)} className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xl hover:bg-white/20">
          ☰
        </button>

        <Link href="/" className="text-lg font-black">StreamVerse</Link>

        <div className="relative w-[55%] max-w-lg">
          <input
            value={query}
            onChange={(e) => searchAlgolia(e.target.value)}
            placeholder="Caută cu Algolia..."
            className="w-full rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm outline-none placeholder:text-white/40 focus:border-[#6A4CFF]"
          />

          {results.length > 0 && (
            <div className="absolute top-12 w-full overflow-hidden rounded-2xl border border-white/10 bg-[#0f0f16] shadow-2xl">
              {results.map((item) => (
                <Link href="/" key={item.objectID} className="block border-b border-white/5 px-4 py-3 hover:bg-white/10">
                  <div className="font-bold">{item.title || item.name || 'Rezultat'}</div>
                  <div className="text-xs text-white/50">{item.type || 'Movie'}</div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </header>

      <aside className={`fixed bottom-0 left-0 top-0 z-[60] w-80 transform border-r border-white/10 bg-[#07070d] transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between border-b border-white/10 p-5">
          <div>
            <h1 className="text-xl font-black">StreamVerse</h1>
            <p className="text-xs text-[#00E0A8]">Premium Streaming</p>
          </div>
          <button onClick={() => setOpen(false)} className="rounded-xl bg-white/10 px-3 py-2">✕</button>
        </div>

        <div className="min-h-screen overflow-visible px-4 py-6 pb-40">
          {sections.map((section) => (
            <div key={section.title} className="mb-8">
              <h2 className="mb-3 px-3 text-xs font-bold uppercase tracking-[0.2em] text-white/30">{section.title}</h2>
              <div className="space-y-2">
                {section.items.map(([href, label, icon]) => (
                  <Link key={href} href={href} onClick={() => setOpen(false)} className="flex items-center gap-4 rounded-2xl px-4 py-4 font-semibold hover:bg-white/10">
                    <span className="text-2xl">{icon}</span>
                    <span>{label}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </aside>

      {open && <button onClick={() => setOpen(false)} className="fixed inset-0 z-[55] bg-black/60" />}
      <main className="pt-16">{children}</main>
    </div>
  );
}
