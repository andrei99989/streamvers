'use client';

import { apiDelete, apiFetch } from '../../lib/apiClient';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Library, Play, Trash2 } from 'lucide-react';

export default function LibraryPage() {
  const [items, setItems] = useState<any[]>([]);

  async function loadItems() {
    const data = await apiFetch('/library');
    setItems(data.items || []);
  }

  async function removeItem(id: string) {
    await apiDelete(`/library/${id}`);
    setItems((prev) => prev.filter((x) => String(x.id) !== String(id)));
  }

  useEffect(() => {
    loadItems();
  }, []);

  return (
    <main className="min-h-screen bg-black p-6 pb-56 text-white md:p-10 md:pb-20">
      <section className="glass mb-8 rounded-[2.5rem] p-8">
        <h1 className="flex items-center gap-3 text-5xl font-black">
          <Library />
          Library
        </h1>
      </section>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <div key={item.id} className="glass overflow-hidden rounded-[2rem]">
            {item.poster ? (
              <img src={item.poster} alt={item.title} className="h-56 w-full object-cover" />
            ) : (
              <div className="flex h-56 items-center justify-center bg-white/5">
                <Play size={48} className="text-white/40" />
              </div>
            )}

            <div className="p-5">
              <h2 className="line-clamp-2 text-2xl font-black">{item.title}</h2>

              <div className="mt-5 flex gap-3">
                <Link
                  href={`/watch/${item.source_id || item.id}`}
                  className="rounded-2xl bg-[#6A4CFF] px-4 py-3 font-black"
                >
                  Play
                </Link>

                <button
                  onClick={() => removeItem(item.id)}
                  className="inline-flex items-center gap-2 rounded-2xl bg-red-500 px-4 py-3 font-black"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
