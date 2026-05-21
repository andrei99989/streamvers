'use client';

import Link from 'next/link';
import { Play } from 'lucide-react';

export default function ProgressCard({
  item,
}: {
  item: any;
}) {
  const progress =
    item.duration > 0
      ? Math.min(
          100,
          Math.round((item.progress / item.duration) * 100)
        )
      : 0;

  return (
    <Link
      href={`/watch/${item.source_id || item.id}`}
      className="group overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] transition hover:border-[#6A4CFF]"
    >
      <div className="relative aspect-video overflow-hidden bg-black">
        {item.poster ? (
          <img
            src={item.poster}
            alt={item.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-white/5">
            <Play size={70} className="text-white/40" />
          </div>
        )}

        <div className="absolute bottom-0 left-0 h-1.5 w-full bg-white/10">
          <div
            className="h-full bg-[#6A4CFF]"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="absolute left-4 top-4 rounded-full bg-black/70 px-3 py-1 text-xs font-black uppercase text-white">
          {item.provider}
        </div>
      </div>

      <div className="p-5">
        <h2 className="line-clamp-2 text-2xl font-black">
          {item.title}
        </h2>

        <div className="mt-3 flex items-center justify-between text-sm text-white/50">
          <span>{progress}% watched</span>
          <span>
            {item.progress}s / {item.duration}s
          </span>
        </div>
      </div>
    </Link>
  );
}
