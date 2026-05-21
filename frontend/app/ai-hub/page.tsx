'use client';

import Link from 'next/link';
import { Brain, Sparkles, Wand2, ListMusic, Filter } from 'lucide-react';

const aiRows = [
  {
    title: 'Recomandări AI pentru tine',
    icon: Sparkles,
    items: ['Naruto', 'Dragon Ball Z', 'Iron Man', 'The Matrix', 'From', 'The Boys']
  },
  {
    title: 'Playlist-uri generate automat',
    icon: ListMusic,
    items: ['Weekend Action', 'Anime Night', 'Kids Safe Mode', 'K-Drama Mood', 'Sports Live']
  },
  {
    title: 'Categorii generate AI',
    icon: Wand2,
    items: ['Dark Sci-Fi', 'Nostalgic Cartoons', 'Romanian Classics', 'Asian Drama', 'Superhero Universe']
  },
  {
    title: 'Filtre inteligente',
    icon: Filter,
    items: ['An: 2020+', 'Gen: Action', 'Limbă: RO/EN', 'Rating: 8+', 'Durată: Sub 2h']
  }
];

export default function AIHubPage() {
  return (
    <main className="min-h-screen bg-black p-6 text-white md:p-10">
      <section className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#6A4CFF]/40 to-[#00E0A8]/10 p-8 md:p-12">
        <div className="mb-4 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-black">
          STREAMVERSE AI
        </div>

        <h1 className="flex items-center gap-3 text-5xl font-black md:text-7xl">
          <Brain />
          AI Hub
        </h1>

        <p className="mt-5 max-w-3xl text-white/70">
          Recomandări inteligente, playlist-uri automate, categorii dinamice,
          filtre și continuă vizionarea personalizat.
        </p>
      </section>

      <div className="mt-10 space-y-10">
        {aiRows.map((row) => {
          const Icon = row.icon;

          return (
            <section key={row.title}>
              <h2 className="mb-4 flex items-center gap-3 text-2xl font-black">
                <Icon size={22} />
                {row.title}
              </h2>

              <div className="flex gap-4 overflow-x-auto pb-3">
                {row.items.map((item, index) => (
                  <Link
                    key={item}
                    href={`/title/ai/${encodeURIComponent(item)}`}
                    className="min-w-[170px] overflow-hidden rounded-3xl border border-white/10 bg-white/10"
                  >
                    <img
                      src={"/placeholder-poster.svg"}
                      alt={item}
                      className="h-64 w-full object-cover"
                    />

                    <div className="p-4">
                      <div className="line-clamp-1 font-black">{item}</div>
                      <div className="mt-1 text-xs text-white/50">AI generated</div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
