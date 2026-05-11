'use client';

import { useEffect, useState } from 'react';
import { Download, Trash2, HardDrive } from 'lucide-react';

export default function DownloadsPage() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('streamverse_downloads');
    setItems(saved ? JSON.parse(saved) : []);
  }, []);

  function addDemo() {
    const item = {
      id: Date.now(),
      title: 'Demo Download',
      size: Math.floor(Math.random() * 900) + 300,
      type: 'Movie',
      image: `https://picsum.photos/400/600?random=${Date.now()}`
    };

    const next = [item, ...items];
    setItems(next);
    localStorage.setItem('streamverse_downloads', JSON.stringify(next));
  }

  function remove(id: number) {
    const next = items.filter((x) => x.id !== id);
    setItems(next);
    localStorage.setItem('streamverse_downloads', JSON.stringify(next));
  }

  const total = items.reduce((sum, item) => sum + Number(item.size || 0), 0);

  return (
    <main className="min-h-screen bg-black p-6 text-white md:p-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="mb-3 inline-flex rounded-full bg-[#00E0A8]/20 px-4 py-2 text-sm font-black text-[#00E0A8]">
            OFFLINE MANAGER
          </div>

          <h1 className="flex items-center gap-3 text-5xl font-black">
            <Download />
            Downloads
          </h1>

          <p className="mt-3 text-white/50">
            Filme și episoade salvate pentru vizionare offline.
          </p>
        </div>

        <button onClick={addDemo} className="rounded-2xl bg-[#6A4CFF] px-5 py-3 font-black">
          + Demo Download
        </button>
      </div>

      <section className="mb-8 rounded-3xl border border-white/10 bg-white/[0.06] p-6">
        <div className="flex items-center gap-3">
          <HardDrive className="text-[#00E0A8]" />
          <div>
            <div className="text-sm text-white/50">Spațiu ocupat</div>
            <div className="text-3xl font-black">{total} MB</div>
          </div>
        </div>
      </section>

      {items.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center text-white/50">
          Nu ai descărcări încă.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-5">
          {items.map((item) => (
            <div key={item.id} className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06]">
              <img src={item.image} className="h-60 w-full object-cover" />

              <div className="p-4">
                <div className="font-black">{item.title}</div>
                <div className="mt-1 text-sm text-white/50">{item.type} • {item.size} MB</div>

                <button
                  onClick={() => remove(item.id)}
                  className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-red-500 px-4 py-3 font-black"
                >
                  <Trash2 size={16} />
                  Șterge
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
