'use client';

import { useEffect, useState } from 'react';
import { Puzzle, CheckCircle2, XCircle, Plus, Search } from 'lucide-react';

const defaultAddons = [
  { name: 'TMDB Catalog', type: 'Movies / Series', status: 'active' },
  { name: 'OMDb Metadata', type: 'Metadata', status: 'active' },
  { name: 'YouTube Trailers', type: 'Trailers / Channels', status: 'active' },
  { name: 'Kitsu Anime', type: 'Anime', status: 'active' },
  { name: 'TVMaze Series', type: 'Series', status: 'active' },
  { name: 'OpenLibrary', type: 'Books / Courses', status: 'active' },
  { name: 'TheAudioDB', type: 'Music', status: 'active' },
  { name: 'TheSportsDB', type: 'Sports', status: 'active' },
];

export default function AddonsPage() {
  const [addons, setAddons] = useState<any[]>([]);
  const [q, setQ] = useState('');
  const [name, setName] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('streamverse_addons');
    setAddons(saved ? JSON.parse(saved) : defaultAddons);
  }, []);

  function save(next: any[]) {
    setAddons(next);
    localStorage.setItem('streamverse_addons', JSON.stringify(next));
  }

  function toggle(index: number) {
    const next = addons.map((a, i) =>
      i === index ? { ...a, status: a.status === 'active' ? 'disabled' : 'active' } : a
    );
    save(next);
  }

  function addAddon() {
    if (!name.trim()) return;
    save([{ name, type: 'Custom Source', status: 'active' }, ...addons]);
    setName('');
  }

  const filtered = addons.filter((a) =>
    a.name.toLowerCase().includes(q.toLowerCase()) ||
    a.type.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-black p-6 text-white md:p-10">
      <div className="mb-8">
        <div className="mb-3 inline-flex rounded-full bg-[#6A4CFF]/20 px-4 py-2 text-sm font-black text-[#B8A7FF]">
          SOURCE ENGINE
        </div>

        <h1 className="flex items-center gap-3 text-5xl font-black">
          <Puzzle />
          Addons
        </h1>

        <p className="mt-3 max-w-3xl text-white/50">
          Gestionează sursele active pentru Home, Discover, Search, Live TV, Anime, Sports și metadata.
        </p>
      </div>

      <div className="mb-6 grid gap-3 md:grid-cols-[1fr_auto]">
        <div className="flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-3">
          <Search size={18} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Caută addon..."
            className="w-full bg-transparent outline-none"
          />
        </div>

        <div className="flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Addon custom"
            className="rounded-2xl bg-white/10 px-4 py-3 outline-none"
          />

          <button onClick={addAddon} className="rounded-2xl bg-[#6A4CFF] px-5 font-black">
            <Plus size={18} />
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((addon, index) => (
          <div key={`${addon.name}-${index}`} className="rounded-3xl border border-white/10 bg-white/[0.06] p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-black">{addon.name}</h2>
                <p className="mt-1 text-sm text-white/50">{addon.type}</p>
              </div>

              {addon.status === 'active' ? (
                <CheckCircle2 className="text-[#00E0A8]" />
              ) : (
                <XCircle className="text-white/30" />
              )}
            </div>

            <button
              onClick={() => toggle(index)}
              className={`mt-5 w-full rounded-2xl px-4 py-3 font-black ${
                addon.status === 'active'
                  ? 'bg-[#00E0A8] text-black'
                  : 'bg-white/10 text-white'
              }`}
            >
              {addon.status === 'active' ? 'Active' : 'Disabled'}
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
