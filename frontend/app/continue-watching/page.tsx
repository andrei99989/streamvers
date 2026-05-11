'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Play, Trash2 } from 'lucide-react';

export default function ContinueWatchingPage() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    setItems(JSON.parse(localStorage.getItem('streamverse_continue') || '[]'));
  }, []);

  function clearAll() {
    localStorage.removeItem('streamverse_continue');
    setItems([]);
  }

  return (
    <main className="min-h-screen bg-black p-6 text-white md:p-10">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-5xl font-black">Continue Watching</h1>
          <p className="mt-2 text-white/50">Reia rapid ce ai început.</p>
        </div>

        <button onClick={clearAll} className="rounded-2xl bg-white/10 px-5 py-3 font-bold">
          <Trash2 size={18} />
        </button>
      </div>

      {items.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center text-white/50">
          Nu ai nimic început încă.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          {items.map((item, i) => (
            <Link key={i} href={item.href || '/'} className="overflow-hidden rounded-3xl bg-white/10">
              <img src={item.image} className="h-60 w-full object-cover" />
              <div className="p-4">
                <div className="font-black">{item.title}</div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full bg-[#00E0A8]" style={{ width: `${item.progress || 35}%` }} />
                </div>
                <div className="mt-2 flex items-center gap-2 text-xs text-white/50">
                  <Play size={12} /> {item.progress || 35}% vizionat
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
