'use client';

import Link from 'next/link';
import { Trophy, CalendarDays, PlayCircle, Radio } from 'lucide-react';

const rows = [
  ['Live Matches', 'Live', ['Football Live', 'NBA Live', 'F1 Live', 'Tennis Live', 'Boxing Live']],
  ['Football', 'Soccer', ['Premier League', 'Champions League', 'La Liga', 'Serie A', 'Liga 1']],
  ['Basketball', 'NBA', ['NBA Highlights', 'Lakers', 'Warriors', 'Celtics', 'Bulls']],
  ['Formula 1', 'F1', ['Race Calendar', 'Qualifying', 'Highlights', 'Drivers', 'Teams']],
  ['Highlights', 'Replay', ['Best Goals', 'Top Plays', 'Match Recaps', 'Press Conferences', 'Documentaries']],
];

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function SportsHubPage() {
  return (
    <main className="min-h-screen bg-black p-6 text-white md:p-10">
      <section className="mb-10 rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#00E0A8]/25 to-[#6A4CFF]/20 p-8">
        <div className="mb-3 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-black">
          SPORTS ENGINE
        </div>

        <h1 className="flex items-center gap-3 text-5xl font-black md:text-7xl">
          <Trophy />
          Sports Hub
        </h1>

        <p className="mt-4 max-w-3xl text-white/70">
          Sport live, highlights, calendare, canale sportive și hub-uri pentru fotbal, NBA, F1 și multe altele.
        </p>
      </section>

      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <InfoCard icon={<CalendarDays />} title="Fixtures" />
        <InfoCard icon={<PlayCircle />} title="Highlights" />
        <InfoCard icon={<Radio />} title="Live Channels" />
      </div>

      <div className="space-y-10">
        {rows.map(([title, source, items]: any) => (
          <section key={title}>
            <h2 className="mb-4 text-2xl font-black">{title}</h2>

            <div className="flex gap-4 overflow-x-auto pb-3">
              {items.map((item: string, i: number) => (
                <Link
                  key={item}
                  href={`/title/sports/${encodeURIComponent(slugify(item))}`}
                  className="min-w-[180px] overflow-hidden rounded-3xl border border-white/10 bg-white/10 transition hover:scale-[1.02]"
                >
                  <img
                    src={"/placeholder-wide.svg"}
                    alt={item}
                    className="h-36 w-full object-cover"
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

function InfoCard({ icon, title }: any) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-6">
      <div className="text-[#00E0A8]">{icon}</div>
      <div className="mt-4 text-2xl font-black">{title}</div>
      <div className="mt-2 text-white/50">Sports module</div>
    </div>
  );
}
