'use client';

import Link from 'next/link';
import { Flame, Star, Trophy } from 'lucide-react';

const rows = [
  ['Cele mai vizionate azi', 'Today', ['Apex', 'Dragon Ball Z', 'The Matrix', 'From', 'The Boys']],
  ['Populare săptămâna asta', 'Weekly', ['Naruto', 'Iron Man', 'Ready or Not', 'Breaking Bad', 'One Piece']],
  ['Top IMDb', 'IMDb', ['The Godfather', 'The Dark Knight', 'Interstellar', 'Parasite', 'Whiplash']],
  ['Top TMDB', 'TMDB', ['Dune', 'The Martian', 'Gladiator', 'Avatar', 'Inception']],
  ['Trending Anime', 'Anime', ['Jujutsu Kaisen', 'Demon Slayer', 'Solo Leveling', 'Bleach', 'Frieren']],
];

function slugify(v: string) {
  return v.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function TrendingPage() {
  return (
    <main className="min-h-screen bg-black p-6 text-white md:p-10">
      <section className="mb-10 rounded-[2rem] border border-white/10 bg-gradient-to-br from-red-500/30 to-[#6A4CFF]/25 p-8">
        <div className="mb-3 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-black">
          TRENDING ENGINE
        </div>

        <h1 className="flex items-center gap-3 text-5xl font-black md:text-7xl">
          <Flame />
          Trending / Popular / Top Rated
        </h1>

        <p className="mt-4 max-w-3xl text-white/70">
          Cele mai vizionate, populare săptămânal, top IMDb, TMDB și anime trending.
        </p>
      </section>

      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <Info icon={<Flame />} title="Trending" />
        <Info icon={<Trophy />} title="Popular" />
        <Info icon={<Star />} title="Top Rated" />
      </div>

      <div className="space-y-10">
        {rows.map(([title, source, items]: any) => (
          <section key={title}>
            <h2 className="mb-4 text-2xl font-black">{title}</h2>

            <div className="flex gap-4 overflow-x-auto pb-3">
              {items.map((item: string, i: number) => (
                <Link
                  key={item}
                  href={`/title/trending/${encodeURIComponent(slugify(item))}`}
                  className="min-w-[170px] overflow-hidden rounded-3xl border border-white/10 bg-white/10 transition hover:scale-[1.02]"
                >
                  <img
                    src={"/placeholder-poster.svg"}
                    alt={item}
                    className="h-64 w-full object-cover"
                  />

                  <div className="p-4">
                    <div className="line-clamp-1 font-black">{item}</div>
                    <div className="mt-1 text-xs text-white/50">{source}</div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}

function Info({ icon, title }: any) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-6">
      <div className="text-[#00E0A8]">{icon}</div>
      <div className="mt-4 text-2xl font-black">{title}</div>
      <div className="mt-2 text-white/50">Ranking module</div>
    </div>
  );
}
