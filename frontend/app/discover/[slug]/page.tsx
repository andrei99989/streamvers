import Link from 'next/link';
import { Compass, Play, Search, Flame, Star } from 'lucide-react';

const collections: Record<string, any[]> = {
  'popular-movie': [
    'Inception',
    'Interstellar',
    'Fight Club',
    'The Dark Knight',
    'John Wick',
    'Avatar',
  ],
  'trending-movie': [
    'Dune',
    'Civil War',
    'The Batman',
    'Oppenheimer',
    'Top Gun Maverick',
    'Joker',
  ],
  'kitsu-trending-anime': [
    'One Piece',
    'Solo Leveling',
    'Jujutsu Kaisen',
    'Attack on Titan',
    'Naruto',
    'Demon Slayer',
  ],
};

export default async function DiscoverSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const title = slug
    .split('-')
    .map((x) => x.charAt(0).toUpperCase() + x.slice(1))
    .join(' ');

  const data = collections[slug] || [
    'StreamVerse Premiere',
    'Premium Collection',
    'Trending Source',
    'AI Recommended',
  ];

  return (
    <main className="min-h-screen bg-black p-6 pb-36 text-white md:p-10 md:pb-20">
      <section className="hero-glow glass mb-10 rounded-[2.5rem] p-8">
        <div className="mb-4 inline-flex rounded-full bg-[#6A4CFF]/20 px-4 py-2 text-xs font-black uppercase tracking-[0.25em] text-[#B8A7FF]">
          STREAMVERSE DISCOVER
        </div>

        <h1 className="flex items-center gap-3 text-5xl font-black md:text-7xl">
          <Compass />
          {title}
        </h1>

        <p className="mt-5 max-w-3xl text-white/60">
          Catalog premium cu recomandări AI, filme, anime, surse video și colecții organizate cinematic.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/discover"
            className="rounded-2xl bg-white/10 px-6 py-4 font-black hover:bg-white/20"
          >
            Înapoi
          </Link>

          <Link
            href="/search"
            className="inline-flex items-center gap-2 rounded-2xl bg-[#6A4CFF] px-6 py-4 font-black"
          >
            <Search size={18} />
            Căutare
          </Link>
        </div>
      </section>

      <section>
        <div className="mb-6 flex items-center gap-3">
          <Flame className="text-[#6A4CFF]" />
          <h2 className="text-3xl font-black">Trending Catalog</h2>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-6">
          {data.map((item, index) => (
            <Link
              key={item}
              href="/sources"
              className="group overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] shadow-[0_0_35px_rgba(106,76,255,.12)] transition hover:-translate-y-1 hover:border-[#6A4CFF]"
            >
              <div className="relative aspect-[2/3] overflow-hidden bg-white/5">
                <img
                  src={"/placeholder-poster.svg"}
                  alt={item}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                <div className="absolute left-3 top-3 rounded-full bg-black/70 px-3 py-1 text-xs font-black uppercase">
                  HD
                </div>

                <div className="absolute inset-0 flex items-center justify-center opacity-0 transition group-hover:opacity-100">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-black">
                    <Play fill="currentColor" />
                  </div>
                </div>
              </div>

              <div className="p-4">
                <h3 className="line-clamp-2 font-black">{item}</h3>

                <div className="mt-3 flex items-center gap-2 text-sm text-[#B8A7FF]">
                  <Star size={14} fill="currentColor" />
                  Premium Recommendation
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
