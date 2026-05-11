'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Play,
  Plus,
  Search,
  Sparkles,
  Star,
  Flame,
  Film,
  Tv,
  Clapperboard,
  Globe2,
  Trophy,
  BookOpen,
  Music,
  Radio,
  Gamepad2,
} from 'lucide-react';

type Item = {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  badge?: string;
};

type Row = {
  title: string;
  icon?: any;
  source: string;
  items: Item[];
};

const poster = (seed: string) =>
  `https://picsum.photos/seed/${encodeURIComponent(seed)}/400/600`;

const wide = (seed: string) =>
  `https://picsum.photos/seed/${encodeURIComponent(seed)}/900/500`;

const movies = [
  'Neon Galaxy',
  'Royal Shadows',
  'Green Signal',
  'Midnight Max',
  'Apex',
  'The Matrix',
  'Dunkirk',
  'The Martian',
  'Ready or Not',
  'The Prestige',
];

const series = [
  'The Boys',
  'From',
  'The Rookie',
  'Euphoria',
  'Law & Order',
  'Man on Fire',
  'Taskmaster',
  'Beef',
  'Widows Bay',
  'Daredevil',
];

const anime = [
  'One Piece',
  'Naruto',
  'Dragon Ball',
  'Jujutsu Kaisen',
  'Demon Slayer',
  'My Hero Academia',
  'Black Clover',
  'Solo Leveling',
  'Attack on Titan',
  'Chainsaw Man',
];

function makeItems(names: string[], source: string, badge?: string): Item[] {
  return names.map((title, i) => ({
    id: `${source}-${i}-${title}`,
    title,
    subtitle: source,
    image: poster(`${source}-${title}`),
    badge,
  }));
}

const rows: Row[] = [
  {
    title: 'Continue Watching',
    icon: Play,
    source: 'continue',
    items: makeItems(['Powder', 'NCIS', 'The Mummy', 'Worlds End', 'Taken 2'], 'Continue Watching'),
  },
  {
    title: 'Popular - Movie',
    icon: Flame,
    source: 'popular-movie',
    items: makeItems(movies, 'Popular Movie', 'IN CINEMA'),
  },
  {
    title: 'Popular - Series',
    icon: Tv,
    source: 'popular-series',
    items: makeItems(series, 'Popular Series'),
  },
  {
    title: 'Featured - Movie',
    icon: Star,
    source: 'featured-movie',
    items: makeItems(['Mortal Kombat', 'Swapped', 'Normal', 'The Drama', 'Half Mary'], 'Featured Movie', 'FEATURED'),
  },
  {
    title: 'Featured - Series',
    icon: Star,
    source: 'featured-series',
    items: makeItems(['Sheriff Country', 'Cops', 'Outlander', 'Your Friends Neighbors'], 'Featured Series'),
  },
  {
    title: 'Trending - Movie',
    icon: Trophy,
    source: 'trending-movie',
    items: makeItems(['Ready or Not 2', 'Hoppers', 'Send Help', 'Michael', 'Apex'], 'Trending Movie', 'HOT'),
  },
  {
    title: 'Trending - Series',
    icon: Trophy,
    source: 'trending-series',
    items: makeItems(['Pluribus', 'Alien Earth', 'Dept Q', 'His & Hers', 'For All Mankind'], 'Trending Series'),
  },
  {
    title: 'Netflix - Movie',
    icon: Clapperboard,
    source: 'netflix-movie',
    items: makeItems(['A History of Violence', 'Lords of Dogtown', 'Vacation', 'Apex', 'The Dark Knight'], 'Netflix Movie'),
  },
  {
    title: 'Netflix - Series',
    icon: Tv,
    source: 'netflix-series',
    items: makeItems(['Legends', 'AmandaLand', 'Yellowstone', 'Race Across the World'], 'Netflix Series'),
  },
  {
    title: 'HBO Max - Movie',
    icon: Film,
    source: 'hbo-movie',
    items: makeItems(['Harry Potter', 'The Gentlemen', 'The Matrix', 'Sully', 'The Prestige'], 'HBO Max Movie'),
  },
  {
    title: 'Disney+ - Movie',
    icon: Film,
    source: 'disney-movie',
    items: makeItems(['The Devil Wears Prada', 'Rental Family', 'The Martian', 'Ready or Not'], 'Disney+ Movie'),
  },
  {
    title: 'Prime Video - Movie',
    icon: Film,
    source: 'prime-movie',
    items: makeItems(['Red One', 'The Tomorrow War', 'Reacher', 'Bosch', 'Fallout'], 'Prime Video Movie'),
  },
  {
    title: 'Apple TV+ - Movie',
    icon: Film,
    source: 'apple-movie',
    items: makeItems(['The Gorge', 'F1 The Movie', 'Outcome', 'Wolfs', 'CODA'], 'Apple TV+ Movie'),
  },
  {
    title: 'IMDb - Movie',
    icon: Star,
    source: 'imdb-movie',
    items: makeItems(['Michael', 'The Devil Wears Prada', 'Apex', 'Half Mary', 'Resident Evil'], 'IMDb Movie'),
  },
  {
    title: 'TMDB Popular - Movie',
    icon: Globe2,
    source: 'tmdb-popular',
    items: makeItems(['Super Mario Bros', 'Swapped', 'Apex', 'Send Help', 'Malena'], 'TMDB Popular'),
  },
  {
    title: 'Kitsu Trending - Anime',
    icon: Sparkles,
    source: 'kitsu-trending',
    items: makeItems(anime, 'Kitsu Anime'),
  },
  {
    title: 'Kitsu Top Airing - Anime',
    icon: Sparkles,
    source: 'kitsu-airing',
    items: makeItems(['One Piece', 'Sakamoto Days', 'Kaiju No. 8', 'Blue Lock', 'Frieren'], 'Top Airing Anime'),
  },
  {
    title: 'GogoAnime - Movies',
    icon: Sparkles,
    source: 'gogoanime-movies',
    items: makeItems(['Suzume', 'Spirited Away', 'Your Name', 'A Silent Voice', 'Weathering With You'], 'GogoAnime'),
  },
  {
    title: 'Movie Trailers - Channel',
    icon: Play,
    source: 'trailers',
    items: makeItems(['Official Trailers', 'Action Trailers', 'Anime Trailers', 'Netflix Trailers'], 'Trailers', 'CHANNEL'),
  },
  {
    title: 'Video Courses - Channel',
    icon: BookOpen,
    source: 'courses',
    items: makeItems(['Python Developers', 'Node JS', 'Xcode Chat App', 'Beginner Tutorial'], 'Video Courses', 'COURSE'),
  },
  {
    title: 'Music Videos',
    icon: Music,
    source: 'music',
    items: makeItems(['Best New', 'Latest Releases', 'By Year', 'Top Music'], 'Music Videos'),
  },
  {
    title: 'Radio',
    icon: Radio,
    source: 'radio',
    items: makeItems(['RB Top', 'Live Radio', 'Chill Radio', 'Hits Radio'], 'Radio'),
  },
  {
    title: 'Sports',
    icon: Trophy,
    source: 'sports',
    items: makeItems(['Football', 'Basketball', 'Live Matches', 'Highlights'], 'Sports'),
  },
  {
    title: 'Games',
    icon: Gamepad2,
    source: 'games',
    items: makeItems(['Top Games', 'New Games', 'Retro Games', 'Cloud Gaming'], 'Games'),
  },
  {
    title: 'Language - Movie',
    icon: Globe2,
    source: 'language-movie',
    items: makeItems(['Korean Movies', 'Japanese Movies', 'Indian Movies', 'French Movies', 'Spanish Movies'], 'Language Movie'),
  },
  {
    title: 'Language - Series',
    icon: Globe2,
    source: 'language-series',
    items: makeItems(['Korean Series', 'Japanese Series', 'Indian Series', 'Arabic Series', 'Turkish Series'], 'Language Series'),
  },
];

export default function HomePage() {
  const [q, setQ] = useState('');
  const router = useRouter();

  function goSearch() {
    if (!q.trim()) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="px-5 pb-12 pt-6 md:px-10">
        <Hero />

        <div className="mt-6 flex gap-3 rounded-3xl border border-white/10 bg-white/[0.06] p-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && goSearch()}
            placeholder="Caută rapid filme, seriale, anime, canale..."
            className="w-full bg-transparent px-3 outline-none"
          />

          <button
            onClick={goSearch}
            className="rounded-2xl bg-[#6A4CFF] px-5 py-3 font-black"
          >
            Caută
          </button>
        </div>

        <div className="mt-10 space-y-10">
          {rows.map((row) => (
            <MediaRow key={row.title} row={row} />
          ))}
        </div>
      </section>
    </main>
  );
}

function Hero() {
  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#6A4CFF] via-[#14102b] to-[#003d3d] p-8 shadow-2xl md:p-12">
      <div
        className="absolute inset-0 opacity-20"
        style={{ backgroundImage: `url(${wide('streamverse-hero')})`, backgroundSize: 'cover' }}
      />

      <div className="relative max-w-4xl">
        <div className="mb-5 tracking-[0.45em] text-xs font-black text-[#00E0A8]">
          STREAMVERSE ORIGINAL
        </div>

        <h1 className="max-w-3xl text-5xl font-black leading-none md:text-7xl">
          Platformă premium pentru toate sursele tale video
        </h1>

        <p className="mt-6 max-w-2xl text-white/70">
          Player universal, recomandări AI, catalog cinematic, categorii live,
          filme, seriale, anime, sport, muzică și canale într-un singur loc.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/search"
            className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-4 font-black text-black"
          >
            <Search size={18} />
            Caută
          </Link>

          <button className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-6 py-4 font-black backdrop-blur">
            <Plus size={18} />
            Adaugă sursă
          </button>
        </div>
      </div>
    </div>
  );
}

function MediaRow({ row }: { row: Row }) {
  const Icon = row.icon || Film;

  return (
    <section>
      <div className="mb-4 flex items-center gap-3">
        <div className="rounded-xl bg-white/10 p-2">
          <Icon size={18} />
        </div>

        <h2 className="text-2xl font-black">{row.title}</h2>
      </div>

      <div className="no-scrollbar flex gap-4 overflow-x-auto pb-2">
        {row.items.map((item) => (
          <Link
            key={item.id}
            href={`/title/${row.source}/${encodeURIComponent(item.id)}`}
            className="group min-w-[145px] overflow-hidden rounded-3xl border border-white/10 bg-white/10 transition hover:scale-[1.03] md:min-w-[185px]"
          >
            <div className="relative h-[220px] bg-white/5 md:h-[280px]">
              <img
                src={item.image}
                alt={item.title}
                className="h-full w-full object-cover transition duration-300 group-hover:opacity-80"
              />

              {item.badge && (
                <div className="absolute left-3 top-3 rounded-full bg-black/70 px-3 py-1 text-[10px] font-black">
                  {item.badge}
                </div>
              )}
            </div>

            <div className="p-4">
              <div className="line-clamp-1 font-black">{item.title}</div>
              <div className="mt-1 line-clamp-1 text-xs text-white/50">
                {item.subtitle}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
