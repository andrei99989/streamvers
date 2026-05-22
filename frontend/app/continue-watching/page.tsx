'use client';

import { API } from '../../lib/api';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Play, Trash2, Clock3 } from 'lucide-react';

function getPoster(item: any) {
  return (
    item.backdrop ||
    item.poster ||
    item.metadata?.tmdb?.backdrop ||
    item.metadata?.tmdb?.poster ||
    item.metadata?.thumbnail ||
    ''
  );
}

function providerGradient(provider: string) {
  const key = String(provider || '').toLowerCase();

  if (key.includes('tiktok')) return 'from-pink-500/40 via-black to-cyan-400/30';
  if (key.includes('terabox')) return 'from-blue-500/40 via-black to-sky-400/20';
  if (key.includes('rumble')) return 'from-green-500/40 via-black to-lime-400/20';
  if (key.includes('dailymotion')) return 'from-blue-600/40 via-black to-white/10';
  if (key.includes('youtube')) return 'from-red-600/40 via-black to-white/10';
  if (key.includes('vimeo')) return 'from-sky-500/40 via-black to-blue-400/20';
  if (key.includes('mp4') || key.includes('hls') || key.includes('webm')) return 'from-[#6A4CFF]/40 via-black to-[#00E0A8]/20';

  return 'from-[#6A4CFF]/35 via-black to-white/10';
}

function getDescription(item: any) {
  return (
    item.description ||
    item.metadata?.tmdb?.overview ||
    item.metadata?.wikipedia?.extract ||
    `${String(item.provider || item.source_type || 'source').toUpperCase()} source`
  );
}

function formatTime(value: number) {
  const total = Math.max(0, Math.floor(Number(value || 0)));
  const m = Math.floor(total / 60);
  const sec = total % 60;

  return `${m}:${String(sec).padStart(2, '0')}`;
}

export default function ContinueWatchingPage() {
  const [items, setItems] = useState<any[]>([]);

  async function loadItems() {
    try {
      const res = await fetch(`${API}/continue`);
      const data = await res.json();

      setItems(
        (data.items || []).sort(
          (a: any, b: any) =>
            new Date(b.updated_at || 0).getTime() -
            new Date(a.updated_at || 0).getTime()
        )
      );
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

  return (
    <main className="min-h-screen bg-black p-6 pb-56 text-white md:p-10 md:pb-20">
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

        {items.length > 0 && (
          <button
            onClick={clearAll}
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-red-500 px-5 py-3 font-black"
          >
            <Trash2 size={18} />
            Curăță tot
          </button>
        )}
      </section>

      {items.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center text-white/50">
          Nu ai nimic în Continue Watching.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => {
            const poster = getPoster(item);
            const provider = item.provider || item.source_type || 'source';

            const percent =
              item.duration > 0
                ? Math.min(100, Math.round((item.progress / item.duration) * 100))
                : item.progress || 1;

            const completed = Boolean(item.metadata?.completed);

            return (
              <div
                key={item.id}
                className="group overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] transition duration-300 hover:-translate-y-1 hover:border-[#6A4CFF] hover:shadow-[0_0_40px_rgba(106,76,255,0.35)]"
              >
                <div className="relative aspect-video overflow-hidden bg-black" style={{ minHeight: 240 }}>
                  <div className="absolute inset-0 z-10 bg-gradient-to-t from-black via-black/40 to-black/10" />

                  {poster ? (
                    <img
                      src={poster}
                      alt={item.title}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className={`flex h-full items-center justify-center bg-gradient-to-br ${providerGradient(provider)}`}>
                      <div className="text-center">
                        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/10 text-white shadow-2xl backdrop-blur-xl">
                          <Play size={42} fill="currentColor" />
                        </div>
                        <div className="text-3xl font-black uppercase tracking-tight text-white/90">
                          {provider}
                        </div>
                        <div className="mt-2 text-xs font-black uppercase tracking-[0.24em] text-white/40">
                          StreamVerse Source
                        </div>
                      </div>
                    </div>
                  )}

                  <Link
                    href={`/watch/${item.source_id || item.sourceId || item.id}`}
                    className="absolute inset-0 z-30 flex items-center justify-center bg-black/10"
                  >
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/90 text-black shadow-2xl backdrop-blur-xl transition group-hover:scale-110">
                      <Play size={46} fill="currentColor" />
                    </div>
                  </Link>

                  <div className="absolute left-4 top-4 z-40 flex flex-wrap gap-2">
                    <span className="rounded-full bg-black/70 px-3 py-1 text-xs font-black uppercase text-white">
                      {provider}
                    </span>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-black uppercase ${
                        completed
                          ? 'bg-[#00E0A8]/20 text-[#00E0A8]'
                          : 'bg-[#6A4CFF]/20 text-[#B8A7FF]'
                      }`}
                    >
                      {completed ? 'completed' : 'in progress'}
                    </span>
                  </div>
                </div>

                <div className="relative z-40 p-6">
                  <h2 className="line-clamp-2 text-3xl font-black leading-tight tracking-tight">
                    {item.title}
                  </h2>

                  <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-white/60">
                    {getDescription(item)}
                  </p>

                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-[#6A4CFF]"
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <p className="mt-2 text-sm text-white/50">
                    Progress: {percent}% • {formatTime(item.progress)} / {formatTime(item.duration)}
                  </p>

                  <div className="mt-6 grid grid-cols-[1fr_auto] gap-3">
                    <Link
                      href={`/watch/${item.source_id || item.sourceId || item.id}`}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 font-black text-black"
                    >
                      <Play size={16} />
                      Continue
                    </Link>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="inline-flex items-center justify-center rounded-2xl bg-red-500 px-4 py-3 font-black"
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
