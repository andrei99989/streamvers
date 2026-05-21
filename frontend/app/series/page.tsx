'use client';

import Link from 'next/link';
import { Tv, Flame, Star, CalendarDays } from 'lucide-react';

const rows = [
  ['Popular Series', 'Popular', ['The Boys', 'From', 'The Rookie', 'Euphoria', 'Law & Order']],
  ['Trending Series', 'Trending', ['Pluribus', 'Alien Earth', 'Dept Q', 'His & Hers', 'For All Mankind']],
  ['Top Rated Series', 'IMDb/TMDB', ['Breaking Bad', 'Chernobyl', 'The Wire', 'Dark', 'Sherlock']],
  ['New Episodes', 'New', ['Episode Drops', 'Weekly Series', 'New Seasons', 'Finales', 'Pilots']],
  ['By Year', 'Year', ['2026 Series', '2025 Series', '2024 Series', '2020s Series', '90s Series']],
];

function slugify(v: string) {
  return v.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function SeriesPage() {
  return (
    <main className="min-h-screen bg-black p-6 text-white md:p-10">
      <section className="mb-10 rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#00E0A8]/25 to-[#6A4CFF]/25 p-8">
        <div className="mb-3 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-black">
          SERIES CATALOG
        </div>

        <h1 className="flex items-center gap-3 text-5xl font-black md:text-7xl">
          <Tv />
          Seriale
        </h1>

        <p className="mt-4 max-w-3xl text-white/70">
          Seriale populare, episoade noi, sezoane, trending, top rated și platforme.
        </p>
      </section>

      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <Info icon={<Flame />} title="Trending" />
        <Info icon={<Star />} title="Top Rated" />
        <Info icon={<CalendarDays />} title="New Episodes" />
      </div>

      <Rows rows={rows} source="series" />
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
                <img src={"/placeholder-poster.svg"} alt={item} className="h-64 w-full object-cover" />
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
      <div className="mt-2 text-white/50">Series module</div>
    </div>
  );
}
