'use client';

import Link from 'next/link';
import { LibraryBig } from 'lucide-react';

const collections = [
  'Marvel',
  'DC',
  'Harry Potter',
  'Fast & Furious',
  'Star Wars',
  'Anime Collections',
  'Documentare premiate',
  'Jetix',
  'Cartoon Network',
  'Fox Kids',
  'JimJam',
  'Minimax',
  'Cartoonito',
  'Boomerang',
  'Nickelodeon',
  'Disney Classics',
  'HBO Originals',
  'Netflix Originals',
  'K-Drama Collection',
  'Turkish Drama',
  'Christmas Movies',
  'Public Domain Movies',
  'Kids Classics'
];

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function CollectionsPage() {
  return (
    <main className="min-h-screen bg-black p-6 text-white md:p-10">
      <div className="mb-8">
        <div className="mb-3 inline-flex rounded-full bg-[#6A4CFF]/20 px-4 py-2 text-sm font-black text-[#B8A7FF]">
          FRANCHISE HUB
        </div>

        <h1 className="flex items-center gap-3 text-5xl font-black">
          <LibraryBig />
          Colecții / Franchises
        </h1>

        <p className="mt-3 max-w-3xl text-white/50">
          Colecții tematice, universuri cinematice, canale pentru copii și hub-uri speciale.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
        {collections.map((name, i) => (
          <Link
            key={name}
            href={`/discover/${slugify(name)}`}
            className="group overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06] transition hover:scale-[1.02] hover:border-[#6A4CFF]"
          >
            <img
              src={"/placeholder-wide.svg"}
              alt={name}
              className="h-36 w-full object-cover opacity-80 group-hover:opacity-100"
            />

            <div className="p-5">
              <div className="text-xl font-black">{name}</div>
              <div className="mt-2 text-sm text-white/50">Collection catalog</div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
