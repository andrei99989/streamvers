'use client';

import Link from 'next/link';

const items = [
  {
    id: '550',
    source: 'tmdb',
    title: 'Fight Club',
    image: 'https://image.tmdb.org/t/p/w500/8k8E9aWvuXy5lweRHCqm3Jt2oOA.jpg',
  },
  {
    id: '13',
    source: 'tmdb',
    title: 'Forrest Gump',
    image: 'https://image.tmdb.org/t/p/w500/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg',
  },
  {
    id: '680',
    source: 'tmdb',
    title: 'Pulp Fiction',
    image: 'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
  },
  {
    id: '155',
    source: 'tmdb',
    title: 'The Dark Knight',
    image: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
  },
];

export default function TrendingRow() {
  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black">Trending Now</h2>

        <div className="text-sm text-white/50">
          Actualizat live
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2">
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/title/${item.source}/${item.id}`}
            className="min-w-[180px] overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 transition hover:scale-[1.03]"
          >
            <img
              src={item.image}
              alt={item.title}
              className="h-72 w-full object-cover"
            />

            <div className="p-4">
              <div className="font-black">
                {item.title}
              </div>

              <div className="mt-2 text-sm text-white/50">
                TMDB Trending
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
