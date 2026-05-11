'use client';

import { useEffect, useState } from 'react';
import { Music, Play, Search } from 'lucide-react';

const API = 'http://127.0.0.1:4000';

export default function MusicHubPage() {
  const [q, setQ] = useState('adele');
  const [tracks, setTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function searchMusic(value = q) {
    if (!value.trim()) return;

    setLoading(true);

    try {
      const res = await fetch(`${API}/deezer/search?q=${encodeURIComponent(value)}`);
      const json = await res.json();
      setTracks(json.data || []);
    } catch {
      setTracks([]);
    }

    setLoading(false);
  }

  useEffect(() => {
    searchMusic('adele');
  }, []);

  return (
    <main className="min-h-screen bg-black p-6 text-white md:p-10">
      <section className="mb-8 rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#6A4CFF]/35 to-[#00E0A8]/15 p-8">
        <div className="mb-3 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-black">
          DEEZER MUSIC ENGINE
        </div>

        <h1 className="flex items-center gap-3 text-5xl font-black md:text-7xl">
          <Music />
          Music Hub
        </h1>

        <p className="mt-4 max-w-3xl text-white/70">
          Caută artiști, albume, melodii și ascultă preview-uri audio Deezer.
        </p>
      </section>

      <div className="mb-8 flex gap-3 rounded-3xl border border-white/10 bg-white/[0.06] p-3">
        <Search className="mt-3 text-white/50" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && searchMusic()}
          placeholder="Caută muzică..."
          className="w-full bg-transparent px-3 outline-none"
        />

        <button
          onClick={() => searchMusic()}
          className="rounded-2xl bg-[#6A4CFF] px-5 py-3 font-black"
        >
          {loading ? '...' : 'Caută'}
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-5">
        {tracks.map((track) => (
          <div key={track.id} className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06]">
            <img
              src={track.album?.cover_big || track.album?.cover_medium}
              alt={track.title}
              className="h-56 w-full object-cover"
            />

            <div className="p-4">
              <div className="line-clamp-1 font-black">{track.title}</div>
              <div className="mt-1 line-clamp-1 text-sm text-white/50">
                {track.artist?.name} • {track.album?.title}
              </div>

              {track.preview && (
                <audio controls src={track.preview} className="mt-4 w-full" />
              )}

              <a
                href={track.link}
                target="_blank"
                className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-black text-black"
              >
                <Play size={16} />
                Deezer
              </a>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
