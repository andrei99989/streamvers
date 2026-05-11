'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import UniversalPlayer from '../../components/player/UniversalPlayer';
import { Play, Trash2, Library, Database } from 'lucide-react';

const API = 'http://127.0.0.1:4000';

export default function SourcesPage() {
  const [sources, setSources] = useState<any[]>([]);
  const [active, setActive] = useState<any>(null);

  useEffect(() => {
    fetch(`${API}/db/sources`)
      .then((r) => r.json())
      .then(setSources)
      .catch(() => setSources(JSON.parse(localStorage.getItem('streamverse_sources') || '[]')));
  }, []);

  function save(next: any[]) {
    setSources(next);
    localStorage.setItem('streamverse_sources', JSON.stringify(next));
  }

  function remove(id: any) {
    fetch(`${API}/db/sources/${id}`, { method: 'DELETE' }).catch(() => null);
    save(sources.filter((x) => x.id !== id));
    if (active?.id === id) setActive(null);
  }

  function addToLibrary(item: any) {
    const saved = JSON.parse(localStorage.getItem('streamverse_library') || '[]');

    const libraryItem = {
      id: item.id,
      title: item.title,
      subtitle: `${item.source_type || item.type} • custom source`,
      source: 'custom',
      image: '',
      url: item.url
    };

    localStorage.setItem('streamverse_library', JSON.stringify([libraryItem, ...saved]));
    alert('Adăugat în Library');
  }

  return (
    <main className="min-h-screen bg-black p-6 text-white md:p-10">
      <div className="mb-8">
        <div className="mb-3 inline-flex rounded-full bg-[#6A4CFF]/20 px-4 py-2 text-sm font-black text-[#B8A7FF]">
          CUSTOM SOURCES
        </div>

        <h1 className="flex items-center gap-3 text-5xl font-black">
          <Database />
          Sources
        </h1>

        <p className="mt-3 max-w-3xl text-white/50">
          Sursele salvate din Upload: iframe, MP4, WebM și HLS.
        </p>
      </div>

      <div className="mb-6 flex gap-3">
        <Link href="/upload" className="rounded-2xl bg-[#6A4CFF] px-5 py-3 font-black">
          + Upload URL
        </Link>
      </div>

      {active && (
        <section className="mb-8 rounded-3xl border border-white/10 bg-white/[0.06] p-5">
          <h2 className="mb-4 text-3xl font-black">{active.title}</h2>
          <div className="aspect-video overflow-hidden rounded-2xl bg-black">
            <UniversalPlayer url={active.url} />
          </div>
        </section>
      )}

      {sources.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center text-white/50">
          Nu ai surse salvate încă.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {sources.map((item) => (
            <div key={item.id} className="rounded-3xl border border-white/10 bg-white/[0.06] p-5">
              <div className="mb-3 rounded-full bg-white/10 px-3 py-1 text-xs font-black uppercase w-fit">
                {item.source_type || item.type}
              </div>

              <h2 className="line-clamp-2 text-xl font-black">{item.title}</h2>
              <p className="mt-2 line-clamp-2 text-sm text-white/40">{item.url}</p>

              <div className="mt-5 flex flex-wrap gap-2">
                <button onClick={() => setActive(item)} className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 font-black text-black">
                  <Play size={16} />
                  Play
                </button>

                <button onClick={() => addToLibrary(item)} className="inline-flex items-center gap-2 rounded-2xl bg-[#6A4CFF] px-4 py-3 font-black">
                  <Library size={16} />
                  Library
                </button>

                <button onClick={() => remove(item.id)} className="inline-flex items-center gap-2 rounded-2xl bg-red-500 px-4 py-3 font-black">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
