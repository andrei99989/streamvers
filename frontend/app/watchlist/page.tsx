'use client';

import { apiDelete, apiFetch } from '../../lib/apiClient';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, Play, Trash2 } from 'lucide-react';

function getPoster(item: any) {
  if (item.poster && String(item.poster).trim()) return item.poster;

  const url = String(item.url || '');
  let id = '';

  if (url.includes('youtu.be/')) id = url.split('youtu.be/')[1]?.split('?')[0] || '';
  if (url.includes('watch?v=')) id = url.split('watch?v=')[1]?.split('&')[0] || '';
  if (url.includes('/embed/')) id = url.split('/embed/')[1]?.split('?')[0] || '';

  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : '';
}

export default function WatchlistPage() {
  const [items, setItems] = useState<any[]>([]);

  async function loadItems() {
    const data = await apiFetch('/favorites');
    setItems(data.items || []);
  }

  async function removeItem(id: string) {
    await apiDelete(`/favorites/${id}`);
    setItems((prev) => prev.filter((x) => String(x.id) !== String(id)));
  }

  useEffect(() => {
    loadItems();
  }, []);

  return (
    <main className="min-h-screen bg-black p-6 pb-36 text-white md:p-10 md:pb-20">
      <section className="mb-8 rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-red-500/20 to-white/[0.03] p-8">
        <div className="mb-3 inline-flex rounded-full bg-red-500/20 px-4 py-2 text-sm font-black text-red-300">
          FAVORITES
        </div>

        <h1 className="flex items-center gap-3 text-5xl font-black">
          <Heart className="text-red-400" />
          Watchlist
        </h1>

        <p className="mt-3 text-white/50">
          Filmele și sursele salvate ca favorite.
        </p>
      </section>

      {items.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center text-white/50">
          Watchlist este gol.
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => {
            const poster = getPoster(item);
            const provider = item.provider || item.source_type || item.sourceType || 'source';

            return (
              <div
                key={item.id}
                className="group overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] transition duration-300 hover:-translate-y-1 hover:border-red-400 hover:shadow-[0_0_40px_rgba(239,68,68,0.25)]"
              >
                <div className="relative h-56 overflow-hidden bg-white/5">
                  {poster ? (
                    <img
                      src={poster}
                      alt={item.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center text-white/40">
                      <Play size={52} />
                      <div className="mt-2 text-xs font-black uppercase">{provider}</div>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                  <div className="absolute left-4 top-4 rounded-full bg-black/70 px-3 py-1 text-xs font-black uppercase">
                    {provider}
                  </div>
                </div>

                <div className="p-5">
                  <h2 className="line-clamp-2 min-h-[4rem] text-2xl font-black">
                    {item.title || 'Untitled'}
                  </h2>

                  <p className="mt-2 line-clamp-2 break-all text-sm text-white/40">
                    {item.url}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <Link
                      href={`/watch/${item.source_id || item.sourceId || item.id}`}
                      className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 font-black text-black"
                    >
                      <Play size={16} />
                      Play
                    </Link>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="inline-flex items-center gap-2 rounded-2xl bg-red-500 px-5 py-3 font-black"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
