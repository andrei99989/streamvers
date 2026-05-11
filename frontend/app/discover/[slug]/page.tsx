'use client';

import Link from 'next/link';
import { use } from 'react';
import { ArrowLeft, Play, Plus } from 'lucide-react';

const posters = [
  'Neon Galaxy',
  'Royal Shadows',
  'Green Signal',
  'Midnight Max',
  'The Last Door',
  'Future City',
  'Dark River',
  'Silent Storm',
  'Blue Planet',
  'Fire Road',
  'Hidden World',
  'Night Hunter',
];

function titleFromSlug(slug: string) {
  return decodeURIComponent(slug)
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function DiscoverCategoryPage({ params }: any) {
  const { slug } = use(params);
  const title = titleFromSlug(slug);

  const rows = [
    `${title} - Popular`,
    `${title} - Trending`,
    `${title} - New`,
    `${title} - Top Rated`,
  ];

  return (
    <main className="min-h-screen bg-black px-5 py-8 text-white md:px-10">
      <Link
        href="/discover"
        className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-white/60 hover:text-white"
      >
        <ArrowLeft size={18} />
        Înapoi la Discover
      </Link>

      <section className="mb-10 rounded-[2rem] border border-white/10 bg-gradient-to-r from-[#6A4CFF]/40 via-white/10 to-[#00E0A8]/20 p-6 md:p-10">
        <div className="max-w-3xl">
          <div className="mb-3 text-xs font-black uppercase tracking-[0.35em] text-[#00E0A8]">
            StreamVerse Catalog
          </div>

          <h1 className="text-4xl font-black md:text-6xl">{title}</h1>

          <p className="mt-4 text-white/70">
            Categorie premium inspirată de meniurile Stremio: rânduri orizontale,
            postere mari, surse organizate și navigare cinematică.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 font-black text-black">
              <Play size={18} />
              Play Random
            </button>

            <button className="inline-flex items-center gap-2 rounded-2xl bg-[#6A4CFF] px-5 py-3 font-black text-white">
              <Plus size={18} />
              Add to Library
            </button>
          </div>
        </div>
      </section>

      <div className="space-y-10">
        {rows.map((row, rowIndex) => (
          <section key={row}>
            <h2 className="mb-4 text-2xl font-black">{row}</h2>

            <div className="flex gap-4 overflow-x-auto pb-4">
              {posters.map((name, i) => {
                const id = `${slug}-${rowIndex}-${i}`;

                return (
                  <Link
                    key={id}
                    href={`/title/discover/${encodeURIComponent(id)}`}
                    className="group w-40 shrink-0 md:w-48"
                  >
                    <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/10">
                      <img
                        src={`https://picsum.photos/400/600?random=${encodeURIComponent(id)}`}
                        alt={name}
                        className="h-60 w-full object-cover transition duration-300 group-hover:scale-105 md:h-72"
                      />

                      <div className="p-3">
                        <div className="line-clamp-1 font-black">{name}</div>
                        <div className="mt-1 text-xs text-white/50">{title}</div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
