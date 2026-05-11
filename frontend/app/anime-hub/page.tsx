'use client';

import Link from 'next/link';
import { Sparkles, Star, Flame, CalendarDays } from 'lucide-react';

const rows = [
  ['Kitsu Trending', 'Trending', ['One Piece', 'Dragon Ball Z', 'Naruto', 'Jujutsu Kaisen', 'Demon Slayer']],
  ['Top Airing Anime', 'Airing', ['Sakamoto Days', 'Blue Lock', 'Kaiju No. 8', 'Frieren', 'Solo Leveling']],
  ['Most Popular Anime', 'Popular', ['Attack on Titan', 'Death Note', 'Black Clover', 'Bleach', 'Hunter x Hunter']],
  ['Highest Rated Anime', 'Rating', ['Fullmetal Alchemist', 'Steins Gate', 'Vinland Saga', 'Monster', 'Code Geass']],
  ['Anime Movies', 'Movie', ['Your Name', 'Suzume', 'Spirited Away', 'A Silent Voice', 'Weathering With You']],
  ['Anime Seasons', 'Season', ['Winter Anime', 'Spring Anime', 'Summer Anime', 'Fall Anime', 'OVA / ONA']],
];

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function AnimeHubPage() {
  return (
    <main className="min-h-screen bg-black p-6 text-white md:p-10">
      <section className="mb-10 rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#6A4CFF]/40 to-[#00E0A8]/10 p-8">
        <div className="mb-3 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-black">
          ANIME ENGINE
        </div>

        <h1 className="flex items-center gap-3 text-5xl font-black md:text-7xl">
          <Sparkles />
          Anime Hub
        </h1>

        <p className="mt-4 max-w-3xl text-white/70">
          Anime trending, top airing, movies, seasons, OVA, ONA și colecții japoneze.
        </p>
      </section>

      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <Info icon={<Flame />} title="Trending" />
        <Info icon={<Star />} title="Top Rated" />
        <Info icon={<CalendarDays />} title="Seasons" />
      </div>

      <div className="space-y-10">
        {rows.map(([title, source, items]: any) => (
          <section key={title}>
            <h2 className="mb-4 text-2xl font-black">{title}</h2>

            <div className="flex gap-4 overflow-x-auto pb-3">
              {items.map((item: string, i: number) => (
                <Link
                  key={item}
                  href={`/title/anime/${encodeURIComponent(slugify(item))}`}
                  className="min-w-[170px] overflow-hidden rounded-3xl border border-white/10 bg-white/10 transition hover:scale-[1.02]"
                >
                  <img
                    src={`https://picsum.photos/400/600?random=anime-${slugify(item)}-${i}`}
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
      <div className="mt-2 text-white/50">Anime module</div>
    </div>
  );
}
