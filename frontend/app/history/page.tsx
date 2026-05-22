'use client';

import { apiDelete, apiFetch } from '../../lib/apiClient';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { History, Play, Trash2 } from 'lucide-react';

export default function HistoryPage() {
  const [items, setItems] = useState<any[]>([]);

  async function loadItems() {
    const data = await apiFetch('/history');
    setItems(data.items || []);
  }

  async function clearHistory() {
    await apiDelete('/history');
    setItems([]);
  }

  useEffect(() => {
    loadItems();
  }, []);

  return (
    <main className="min-h-screen bg-black p-6 pb-56 text-white md:p-10 md:pb-20">
      <section className="glass mb-8 rounded-[2.5rem] p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="flex items-center gap-3 text-5xl font-black">
            <History />
            History
          </h1>

          <button
            onClick={clearHistory}
            className="inline-flex items-center gap-2 rounded-2xl bg-red-500 px-5 py-4 font-black"
          >
            <Trash2 size={18} />
            Clear
          </button>
        </div>
      </section>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/watch/${item.source_id || item.id}`}
            className="glass overflow-hidden rounded-[2rem]"
          >
            {item.poster ? (
              <img src={item.poster} alt={item.title} className="h-56 w-full object-cover" />
            ) : (
              <div className="flex h-56 items-center justify-center bg-white/5">
                <Play size={48} className="text-white/40" />
              </div>
            )}

            <div className="p-5">
              <h2 className="line-clamp-2 text-2xl font-black">{item.title}</h2>
              <p className="mt-2 text-sm text-white/40">
                {item.provider || item.source_type || 'source'}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
