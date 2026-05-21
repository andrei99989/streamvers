'use client';
import { API } from '../../lib/api';

import ProgressCard from '../../components/ProgressCard';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Play, Trash2, Clock3 } from 'lucide-react';

export default function ContinueWatchingPage() {
  const [items, setItems] = useState<any[]>([]);

  async function loadItems() {
    try {
      const res = await fetch(`${API}/continue`);
      const data = await res.json();
      setItems((data.items || []).sort((a: any, b: any) => new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime()));
    } catch {
      setItems([]);
    }
  }

  async function clearAll() {
    await fetch(`${API}/continue`, { method: 'DELETE' });
    setItems([]);
  }

  async function removeItem(id: string) {
    await fetch(`${API}/continue/${id}`, { method: 'DELETE' });
    setItems((prev) => prev.filter((x) => String(x.id) !== String(id)));
  }

  useEffect(() => {
    loadItems();
  }, []);

  function formatTime(value: number) {
    const total = Math.max(0, Math.floor(Number(value || 0)));
    const m = Math.floor(total / 60);
    const sec = total % 60;

    return `${m}:${String(sec).padStart(2, '0')}`;
  }

  return (
    <main className="min-h-screen bg-black p-6 pb-36 text-white md:p-10 md:pb-20">
      <section className="mb-8 rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/10 to-white/[0.03] p-6 md:p-8">
        <div className="mb-3 inline-flex rounded-full bg-[#00E0A8]/20 px-4 py-2 text-sm font-black text-[#00E0A8]">
          RESUME
        </div>

        <h1 className="flex items-center gap-3 text-5xl font-black">
          <Clock3 />
          Continue Watching
        </h1>

        <p className="mt-3 max-w-3xl text-white/50">
          Reia rapid conținutul salvat în Neon / PostgreSQL.
        </p>

        <button
          onClick={clearAll}
          className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-red-500 px-5 py-3 font-black"
        >
          <Trash2 size={18} />
          Curăță tot
        </button>
      </section>

      {items.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center text-white/50">
          Nu ai nimic în Continue Watching.
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => {
            const percent =
              item.duration > 0
                ? Math.min(100, Math.round((item.progress / item.duration) * 100))
                : item.progress || 1;

              const completed = Boolean(item.metadata?.completed);

            function formatTime(value: number) {
    const total = Math.max(0, Math.floor(Number(value || 0)));
    const m = Math.floor(total / 60);
    const sec = total % 60;

    return `${m}:${String(sec).padStart(2, '0')}`;
  }

  return (
              <div
                key={item.id}
                className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04]"
              >
                {item.poster ? (
                  <img
                    src={item.poster}
                    alt={item.title}
                    className="h-56 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-56 items-center justify-center bg-white/5">
                    <Play size={60} className="text-white/40" />
                  </div>
                )}

                <div className="h-2 bg-white/10">
                  <div
                    className="h-full bg-[#6A4CFF]"
                    style={{ width: `${percent}%` }}
                  />
                </div>

                <div className="p-5">
                  <div className="mb-3 w-fit rounded-full bg-white/10 px-3 py-1 text-xs font-black uppercase">
                    {item.provider || item.source_type || 'source'}
                  </div>

                  <div
                    className={`mb-3 w-fit rounded-full px-3 py-1 text-xs font-black uppercase ${
                      completed
                        ? 'bg-[#00E0A8]/20 text-[#00E0A8]'
                        : 'bg-[#6A4CFF]/20 text-[#B8A7FF]'
                    }`}
                  >
                    {completed ? 'Completed' : 'In Progress'}
                  </div>

                  <h2 className="line-clamp-2 text-2xl font-black">
                    {item.title}
                  </h2>

                  <p className="mt-2 text-sm text-white/50">
                    Progress: {percent}% • {formatTime(item.progress)} / {formatTime(item.duration)}
                  </p>

                  <p className="mt-2 line-clamp-2 break-all text-sm text-white/40">
                    {item.url}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <Link
                      href={`/watch/${item.source_id || item.sourceId || item.id}`}
                      className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 font-black text-black"
                    >
                      <Play size={16} />
                      Resume
                    </Link>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="inline-flex items-center gap-2 rounded-2xl bg-red-500 px-5 py-3 font-black"
                    >
                      <Trash2 size={16} />
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
