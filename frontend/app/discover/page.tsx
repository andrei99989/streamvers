'use client';

import Link from 'next/link';
import {
  Film,
  Tv,
  Sparkles,
  Globe2,
  Music,
  Trophy,
  Radio,
  BookOpen,
  Gamepad2,
  Search,
} from 'lucide-react';

const sections = [
  {
    title: 'Movies',
    icon: Film,
    items: [
      'Popular Movie',
      'Featured Movie',
      'Trending Movie',
      'Top Seeded Movie',
      'Year Movie',
      'Language Movie',
      'Christmas Movies',
      'TMDB Popular Movie',
      'IMDb Movie',
    ],
  },
  {
    title: 'Series',
    icon: Tv,
    items: [
      'Popular Series',
      'Featured Series',
      'Trending Series',
      'Top Seeded Series',
      'Year Series',
      'Language Series',
      'Netflix Series',
      'HBO Max Series',
      'Disney+ Series',
    ],
  },
  {
    title: 'Anime',
    icon: Sparkles,
    items: [
      'Kitsu Trending Anime',
      'Kitsu Top Airing Anime',
      'Kitsu Most Popular Anime',
      'Kitsu Highest Rated Anime',
      'GogoAnime Movies',
      'GogoAnime Series',
      'Anime Seasons',
      'One Piece Catalog',
    ],
  },
  {
    title: 'Streaming Platforms',
    icon: Globe2,
    items: [
      'Netflix',
      'HBO Max',
      'Disney+',
      'Prime Video',
      'Apple TV+',
      'MUBI',
      'Trakt',
      'TMDB',
      'IMDb',
    ],
  },
  {
    title: 'Channels',
    icon: Radio,
    items: [
      'Movie Trailers',
      'Video Courses',
      'Udemy Courses',
      'TV Channels',
      'Live TV',
      'Radios',
      'YouTube Channels',
    ],
  },
  {
    title: 'Extra Hubs',
    icon: Gamepad2,
    items: [
      'Sports',
      'Games',
      'Music Videos',
      'Public Domain Movies',
      'Foreign Movies',
      'Kids',
      'Documentary',
      'Lessons Catalog',
    ],
  },
];

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function DiscoverPage() {
  return (
    <main className="min-h-screen bg-black px-5 py-8 text-white md:px-10">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-4xl font-black md:text-6xl">Discover</h1>
          <p className="mt-3 max-w-2xl text-white/60">
            Catalog premium cu filme, seriale, anime, canale, sport, muzică, cursuri și surse organizate.
          </p>
        </div>

        <Link
          href="/search"
          className="inline-flex w-fit items-center gap-2 rounded-2xl bg-[#6A4CFF] px-5 py-3 font-black"
        >
          <Search size={18} />
          Căutare Universală
        </Link>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {sections.map((section) => {
          const Icon = section.icon;

          return (
            <div
              key={section.title}
              className="rounded-3xl border border-white/10 bg-white/[0.06] p-5"
            >
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-2xl bg-white/10 p-3">
                  <Icon size={22} />
                </div>

                <h2 className="text-2xl font-black">{section.title}</h2>
              </div>

              <div className="grid gap-3">
                {section.items.map((item) => (
                  <Link
                    key={item}
                    href={`/discover/${slug(item)}`}
                    className="rounded-2xl bg-black/30 px-4 py-3 text-sm font-bold text-white/75 transition hover:bg-[#6A4CFF] hover:text-white"
                  >
                    {item}
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
