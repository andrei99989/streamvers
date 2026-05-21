'use client';
import { apiFetch } from '../lib/apiClient';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Play, X } from 'lucide-react';

export default function MiniPlayer() {
  const [item, setItem] = useState<any>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await apiFetch('/continue');
        setItem(data.items?.[0] || null);
      } catch {
        setItem(null);
      }
    }

    load();
  }, []);

  if (!item || hidden) return null;

  const id = item.source_id || item.sourceId || item.id;
  const poster = item.poster || item.thumbnail || item.metadata?.thumbnail || '';

  return (
    <div className="fixed bottom-24 right-3 z-[99998] hidden w-[220px] overflow-hidden rounded-[2rem] border border-white/10 bg-black/80 shadow-[0_0_40px_rgba(106,76,255,.25)] backdrop-blur-2xl md:block">
      <div className="relative aspect-video bg-white/5">
        {poster ? (
          <img src={poster} alt={item.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Play className="text-white/50" size={42} />
          </div>
        )}

        <button
          onClick={() => setHidden(true)}
          className="absolute right-3 top-3 rounded-full bg-black/70 p-2"
        >
          <X size={14} />
        </button>
      </div>

      <div className="p-3">
        <div className="line-clamp-1 font-black">{item.title}</div>

        <Link
          href={`/watch/${id}`}
          className="mt-2 inline-flex items-center gap-2 rounded-full bg-[#6A4CFF] px-3 py-2 text-xs font-black"
        >
          <Play size={14} />
          Continuă
        </Link>
      </div>
    </div>
  );
}
