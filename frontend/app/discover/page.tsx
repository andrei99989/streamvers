import Link from 'next/link';
import {
  Compass,
  Film,
  Tv,
  Sparkles,
  Search,
  Flame,
  Star,
  Clapperboard,
  Baby,
  Globe2,
} from 'lucide-react';

const sections = [
  {
    title: 'Movies',
    icon: Film,
    accent: 'from-[#6A4CFF]/30',
    items: [
      ['Popular Movie', '/discover/popular-movie', 'Top films curated for StreamVerse'],
      ['Trending Movie', '/discover/trending-movie', 'What people are watching now'],
      ['TMDB Popular', '/discover/tmdb-popular-movie', 'TMDB-powered movie catalog'],
      ['IMDb Movie', '/discover/imdb-movie', 'IMDb-style discovery'],
    ],
  },
  {
    title: 'Series',
    icon: Tv,
    accent: 'from-[#00E0A8]/25',
    items: [
      ['Popular Series', '/discover/popular-series', 'Binge-worthy shows'],
      ['Trending Series', '/discover/trending-series', 'Hot episodes and series'],
      ['Netflix Series', '/discover/netflix-series', 'Streaming-style catalog'],
      ['HBO Max Series', '/discover/hbo-max-series', 'Premium drama and originals'],
    ],
  },
  {
    title: 'Anime',
    icon: Sparkles,
    accent: 'from-pink-500/25',
    items: [
      ['Kitsu Trending Anime', '/discover/kitsu-trending-anime', 'Trending anime feed'],
      ['Kitsu Top Airing Anime', '/discover/kitsu-top-airing-anime', 'Currently airing'],
      ['Kitsu Most Popular Anime', '/discover/kitsu-most-popular-anime', 'Most loved anime'],
      ['One Piece Catalog', '/discover/one-piece-catalog', 'Anime special catalog'],
    ],
  },
];

const quickLinks = [
  ['Trending', '/trending', Flame],
  ['New Releases', '/new-releases', Star],
  ['Movies', '/movies', Clapperboard],
  ['Series', '/series', Tv],
  ['Kids', '/kids-hub', Baby],
  ['Languages', '/languages', Globe2],
];

export default function DiscoverPage() {
  return (
    <main className="min-h-screen bg-black p-6 pb-36 text-white md:p-10 md:pb-20">
      <section className="relative mb-8 overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-[#6A4CFF]/30 via-white/[0.04] to-black p-8 shadow-[0_0_80px_rgba(106,76,255,0.25)] md:p-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,224,168,.22),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(106,76,255,.28),transparent_40%)]" />

        <div className="relative z-10 max-w-4xl">
          <div className="mb-4 inline-flex rounded-full bg-[#00E0A8]/20 px-4 py-2 text-xs font-black uppercase tracking-[0.25em] text-[#00E0A8]">
            STREAMVERSE DISCOVER
          </div>

          <h1 className="flex items-center gap-4 text-6xl font-black leading-none md:text-8xl">
            <Compass className="h-14 w-14 text-[#B8A7FF] md:h-20 md:w-20" />
            Discover
          </h1>

          <p className="mt-5 max-w-3xl text-lg text-white/60">
            Explorează filme, seriale, anime, canale și cataloage conectate la sursele StreamVerse.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/search"
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-4 font-black text-black transition hover:scale-105"
            >
              <Search size={18} />
              Căutare Universală
            </Link>

            <Link
              href="/addons"
              className="inline-flex items-center gap-2 rounded-2xl bg-[#6A4CFF] px-6 py-4 font-black transition hover:scale-105"
            >
              <Sparkles size={18} />
              Addons Catalog
            </Link>
          </div>
        </div>
      </section>

      <section className="mb-8 grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        {quickLinks.map(([label, href, Icon]: any) => (
          <Link
            key={href}
            href={href}
            className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 transition hover:-translate-y-1 hover:border-[#6A4CFF] hover:bg-white/[0.07]"
          >
            <Icon className="mb-4 text-[#B8A7FF]" />
            <div className="font-black">{label}</div>
          </Link>
        ))}
      </section>

      <div className="grid gap-5 xl:grid-cols-3">
        {sections.map((section) => {
          const Icon = section.icon;

          return (
            <section
              key={section.title}
              className={`overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br ${section.accent} to-white/[0.03] p-6`}
            >
              <h2 className="mb-5 flex items-center gap-3 text-3xl font-black">
                <Icon />
                {section.title}
              </h2>

              <div className="grid gap-3">
                {section.items.map(([label, href, desc]) => (
                  <Link
                    key={href}
                    href={href}
                    className="group rounded-2xl border border-white/10 bg-black/30 px-5 py-4 transition hover:border-[#6A4CFF] hover:bg-[#6A4CFF]/20"
                  >
                    <div className="font-black text-white group-hover:text-[#C7BAFF]">
                      {label}
                    </div>
                    <div className="mt-1 text-sm text-white/45">
                      {desc}
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
