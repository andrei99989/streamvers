'use client';

import Link from 'next/link';
import { Baby, ShieldCheck } from 'lucide-react';

const rows = [
  ['Kids Movies', ['Toy World', 'Magic Forest', 'Space Kids', 'Animal Friends', 'Little Heroes']],
  ['Cartoon Network', ['Dexter Lab', 'Powerpuff', 'Ben 10', 'Adventure Time', 'Regular Show']],
  ['Jetix / Fox Kids', ['Galactic Rangers', 'Super Spies', 'Dragon Team', 'Retro Heroes', 'Action Kids']],
  ['Nickelodeon', ['Sponge World', 'Teen Squad', 'Funny Friends', 'School Life', 'Nick Classics']],
  ['Boomerang / Cartoonito', ['Tom & Jerry', 'Scooby Adventures', 'Baby Cartoons', 'Classic Shorts', 'Family Fun']],
  ['Safe Learning', ['Numbers', 'Alphabet', 'Science Kids', 'Animals', 'Music Lessons']],
];

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function KidsHubPage() {
  return (
    <main className="min-h-screen bg-black p-6 text-white md:p-10">
      <section className="mb-10 rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#00E0A8]/25 to-[#6A4CFF]/25 p-8">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-black">
          <ShieldCheck size={16} />
          KIDS SAFE MODE
        </div>

        <h1 className="flex items-center gap-3 text-5xl font-black md:text-7xl">
          <Baby />
          Kids Hub
        </h1>

        <p className="mt-4 max-w-3xl text-white/70">
          Conținut pentru copii: cartoons, educație, canale family-friendly și colecții retro.
        </p>
      </section>

      <div className="space-y-10">
        {rows.map(([title, items]: any) => (
          <section key={title}>
            <h2 className="mb-4 text-2xl font-black">{title}</h2>

            <div className="flex gap-4 overflow-x-auto pb-3">
              {items.map((item: string, i: number) => (
                <Link
                  key={item}
                  href={`/title/kids/${encodeURIComponent(slugify(item))}`}
                  className="min-w-[160px] overflow-hidden rounded-3xl border border-white/10 bg-white/10 transition hover:scale-[1.02]"
                >
                  <img
                    src={`https://picsum.photos/400/600?random=kids-${slugify(item)}-${i}`}
                    alt={item}
                    className="h-60 w-full object-cover"
                  />

                  <div className="p-4">
                    <div className="line-clamp-1 font-black">{item}</div>
                    <div className="mt-1 text-xs text-white/50">{title}</div>
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
