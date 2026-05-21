'use client';
import { API } from '../../lib/api';

import { useEffect, useState } from 'react';
import { Newspaper, Film, Tv, Sparkles, Cpu } from 'lucide-react';



const tabs = [
  { id: 'movies', label: 'Movies', icon: <Film size={18} /> },
  { id: 'tv', label: 'TV', icon: <Tv size={18} /> },
  { id: 'anime', label: 'Anime', icon: <Sparkles size={18} /> },
  { id: 'tech', label: 'Tech', icon: <Cpu size={18} /> },
];

export default function NewsHubPage() {
  const [active, setActive] = useState('anime');
  const [feed, setFeed] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function loadFeed(type: string) {
    setLoading(true);
    setActive(type);

    try {
      const res = await fetch(`${API}/rss/${type}`);
      const json = await res.json();
      setFeed(json);
    } catch {
      setFeed(null);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadFeed('anime');
  }, []);

  return (
    <main className="min-h-screen bg-black p-6 text-white md:p-10">
      <section className="mb-8 rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#6A4CFF]/35 to-[#00E0A8]/15 p-8">
        <div className="mb-3 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-black">
          RSS FEEDS ENGINE
        </div>

        <h1 className="flex items-center gap-3 text-5xl font-black">
          <Newspaper />
          News Hub
        </h1>

        <p className="mt-4 max-w-3xl text-white/60">
          Știri și noutăți din movies, TV, anime și tech prin RSS feeds.
        </p>
      </section>

      <div className="mb-6 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => loadFeed(tab.id)}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 font-black ${
              active === tab.id ? 'bg-[#6A4CFF]' : 'bg-white/10 text-white/60'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mb-6">
        <h2 className="text-3xl font-black">
          {loading ? 'Se încarcă...' : feed?.title || 'Feed'}
        </h2>
        {feed?.link && (
          <a href={feed.link} target="_blank" className="text-sm text-[#00E0A8]">
            {feed.link}
          </a>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {(feed?.items || []).map((item: any, i: number) => (
          <a
            key={i}
            href={item.link}
            target="_blank"
            className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 transition hover:scale-[1.01] hover:border-[#6A4CFF]"
          >
            <div className="text-xs text-white/40">{item.pubDate || 'RSS'}</div>
            <h3 className="mt-3 line-clamp-2 text-xl font-black">{item.title}</h3>
            <p className="mt-3 line-clamp-4 text-sm text-white/50">
              {item.contentSnippet || item.content || 'Fără descriere'}
            </p>
          </a>
        ))}
      </div>
    </main>
  );
}
