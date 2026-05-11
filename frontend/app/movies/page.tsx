'use client';

import Link from 'next/link';
import { Film, Flame, Star, CalendarDays } from 'lucide-react';

const rows = [
  ['Popular Movies', 'Popular', ['Apex', 'The Matrix', 'Dunkirk', 'The Martian', 'The Prestige']],
  ['Trending Movies', 'Trending', ['Ready or Not', 'Michael', 'Send Help', 'Normal', 'Swapped']],
  ['Top Rated Movies', 'IMDb/TMDB', ['The Godfather', 'Interstellar', 'Parasite', 'Whiplash', 'Gladiator']],
  ['New Releases', 'New', ['New Action', 'New Comedy', 'New Drama', 'New Sci-Fi', 'New Horror']],
  ['By Year', 'Year', ['2026 Movies', '2025 Movies', '2024 Movies', '2020s Movies', '90s Movies']],
];

function slugify(v: string) {
  return v.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function MoviesPage() {
  return (
    <main className="min-h-screen bg-black p-6 text-white md:p-10">
      <section className="mb-10 rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#6A4CFF]/40 to-black p-8">
        <div className="mb-3 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-black">
          MOVIE CATALOG
        </div>

        <h1 className="flex items-center gap-3 text-5xl font-black md:text-7xl">
          <Film />
          Filme
        </h1>

        <p className="mt-4 max-w-3xl text-white/70">
          Filme populare, trending, top rated, noutăți, ani, limbi și platforme.
        </p>
      </section>

      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <Info icon={<Flame />} title="Popular" />
        <Info icon={<Star />} title="Top Rated" />
        <Info icon={<CalendarDays />} title="By Year" />
      </div>

      <Rows rows={rows} source="movie" />
    </main>
  );
}

function Rows({ rows, source }: any) {
  return (
    <div className="space-y-10">
      {rows.map(([title, type, items]: any) => (
        <section key={title}>
          <h2 className="mb-4 text-2xl font-black">{title}</h2>
          <div className="flex gap-4 overflow-x-auto pb-3">
            {items.map((item: string, i: number) => (
              <Link
                key={item}
                href={`/title/${source}/${encodeURIComponent(slugify(item))}`}
                className="min-w-[170px] overflow-hidden rounded-3xl border border-white/10 bg-white/10 transition hover:scale-[1.02]"
              >
                <img src={`https://picsum.photos/400/600?random=movie-${slugify(item)}-${i}`} alt={item} className="h-64 w-full object-cover" />
                <div className="p-4">
                  <div className="line-clamp-1 font-black">{item}</div>
                  <div className="mt-1 text-xs text-white/50">{type}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function Info({ icon, title }: any) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-6">
      <div className="text-[#00E0A8]">{icon}</div>
      <div className="mt-4 text-2xl font-black">{title}</div>
      <div className="mt-2 text-white/50">Movie module</div>
    </div>
  );
}
