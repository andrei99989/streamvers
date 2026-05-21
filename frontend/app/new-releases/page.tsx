'use client';

import Link from 'next/link';
import { Sparkles, Film, Tv, CalendarPlus } from 'lucide-react';

const rows = [
  ['Filme noi', 'Movie', ['New Action', 'New Sci-Fi', 'New Comedy', 'New Horror', 'New Drama']],
  ['Episoade noi', 'Episode', ['Weekly Drops', 'Today Episodes', 'Anime Episodes', 'K-Drama Episodes', 'TV Premieres']],
  ['Sezoane noi', 'Season', ['Season Premieres', 'Final Seasons', 'Returning Shows', 'Mini Series', 'Netflix Drops']],
  ['Anime nou', 'Anime', ['Winter Anime', 'Spring Anime', 'Summer Anime', 'Fall Anime', 'OVA / ONA']],
];

function slugify(v: string) {
  return v.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function NewReleasesPage() {
  return (
    <main className="min-h-screen bg-black p-6 text-white md:p-10">
      <section className="mb-10 rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#6A4CFF]/40 to-[#00E0A8]/10 p-8">
        <div className="mb-3 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-black">
          NEW RELEASES
        </div>

        <h1 className="flex items-center gap-3 text-5xl font-black md:text-7xl">
          <Sparkles />
          Noutăți
        </h1>

        <p className="mt-4 max-w-3xl text-white/70">
          Filme noi, episoade noi, sezoane noi, anime nou și lansări recente.
        </p>
      </section>

      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <Info icon={<Film />} title="Filme noi" />
        <Info icon={<Tv />} title="Episoade noi" />
        <Info icon={<CalendarPlus />} title="Sezoane noi" />
      </div>

      <div className="space-y-10">
        {rows.map(([title, source, items]: any) => (
          <section key={title}>
            <h2 className="mb-4 text-2xl font-black">{title}</h2>

            <div className="flex gap-4 overflow-x-auto pb-3">
              {items.map((item: string, i: number) => (
                <Link
                  key={item}
                  href={`/title/new/${encodeURIComponent(slugify(item))}`}
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
      <div className="mt-2 text-white/50">New release module</div>
    </div>
  );
}
