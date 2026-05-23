'use client';
import { apiFetch } from '../lib/apiClient';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Play, Clock3, Heart, History, Database, Search, Sparkles } from 'lucide-react';

function poster(item: any) {
  return (
    item.poster ||
    item.content_poster ||
    item.backdrop ||
    item.content_backdrop ||
    item.thumbnail ||
    item.metadata?.thumbnail ||
    item.metadata?.poster ||
    item.metadata?.content_poster ||
    item.metadata?.universal?.tmdb?.[0]?.poster_path && `https://image.tmdb.org/t/p/w500${item.metadata.universal.tmdb[0].poster_path}` ||
    ''
  );
}

function providerLabel(item: any) {
  return item.provider || item.source_type || item.type || 'source';
}

function providerKey(item: any) {
  return String(providerLabel(item))
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-');
}

function itemId(item: any) {
  return item.source_id || item.id;
}

function percent(item: any) {
  if (!item.duration || Number(item.duration) <= 0) return 0;

  return Math.min(
    100,
    Math.round((Number(item.progress || 0) / Number(item.duration)) * 100)
  );
}


function uniqueItems(items: any[]) {
  const seen = new Set<string>();

  return (items || []).filter((item: any) => {
    const key = String(
      item.content_key ||
      item.metadata?.contentKey ||
      item.source_id ||
      item.id ||
      `${item.title || ''}|${item.url || ''}`
    ).toLowerCase();

    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function Row({ title, icon: Icon, href, items, showProgress = false }: any) {
  return (
    <section className="section-fade mt-10 sm:mt-12 scroll-mt-24">
      <div className="mb-4 flex items-center justify-between gap-2 sm:gap-4 bg-black/40 py-2 backdrop-blur-xl">
        <h2 className="flex items-center gap-3 text-xl font-black sm:text-2xl">
          <Icon size={22} />
          {title}
        </h2>

        <Link
          href={href}
          className="rounded-full bg-white/10 px-3 py-2 text-xs font-bold sm:px-4 sm:text-sm transition hover:bg-white/20"
        >
          Vezi tot
        </Link>
      </div>

      <div className="hide-scrollbar netflix-row flex gap-4 overflow-x-auto pb-8">
        {items.length === 0 ? (
          <div className="min-w-[340px] rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 text-white/40">
            Nimic momentan.
          </div>
        ) : (
          uniqueItems(items).map((item: any) => {
            const image = poster(item);
            const provider = providerKey(item);
            const progress = percent(item);

            return (
              <Link
                key={`${title}-${item.id}-${item.source_id || ''}`}
                href={`/watch/${itemId(item)}`}
                className={`snap-card group netflix-card provider-${provider} relative min-w-[78vw] max-w-[78vw] sm:min-w-[300px] sm:max-w-[300px] md:min-w-[340px] md:max-w-[340px] overflow-hidden rounded-[2rem] border border-white/10 bg-[#111] transition-all duration-500 active:scale-[0.98] hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_0_35px_rgba(106,76,255,.18)]`}
              >
                <div className="relative aspect-[16/9] sm:aspect-[16/10] overflow-hidden bg-black">
                  {image ? (
                    <img
                      src={image}
                      alt={item.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-white/5">
                      <Play size={54} className="text-white/40" />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-90" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(106,76,255,.18),transparent_60%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                  <div className="absolute left-3 top-3 rounded-full bg-black/70 px-3 py-1 text-xs font-black uppercase text-white">
                    {providerLabel(item)}
                  </div>

                  {typeof item.trending_score === 'number' && (
                    <div className="absolute right-3 top-3 rounded-full bg-[#00E0A8]/90 px-3 py-1 text-xs font-black uppercase text-black">
                      TRENDING · {item.trending_score}
                    </div>
                  )}

                  {showProgress && progress > 0 && (
                    <div className="absolute bottom-0 left-0 h-1.5 w-full bg-white/10">
                      <div
                        className="h-full rounded-r-full bg-gradient-to-r from-[#7B5CFF] to-[#9B8CFF]"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  )}

                  <div className="absolute inset-0 flex items-center justify-center opacity-0 transition duration-300 group-hover:opacity-100">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-black shadow-2xl">
                      <Play size={28} fill="currentColor" />
                    </div>
                  </div>
                </div>

                <div className="hero-content relative z-20 p-3 sm:p-4">
                  <h3 className="line-clamp-2 min-h-[3.5rem] text-base font-black sm:text-lg leading-tight transition-colors duration-300 group-hover:text-[#C7BAFF]">
                    {item.title}
                  </h3>

            {item.reason && (
              <p className="mt-2 line-clamp-2 rounded-xl bg-[#6A4CFF]/15 px-3 py-2 text-[11px] font-bold text-[#C7BAFF]">
                {item.reason}
              </p>
            )}

            {typeof item.score === 'number' && item.score > 0 && (
              <p className="mt-2 text-[10px] font-black uppercase tracking-[0.18em] text-white/30">
                AI Score: {item.score}
              </p>
            )}

                  <p className="mt-2 line-clamp-1 text-xs text-white/40">
                    {item.url}
                  </p>

                  {showProgress && progress > 0 && (
                    <p className="mt-3 text-xs font-bold text-[#B8A7FF]">
                      {progress}% urmărit
                    </p>
                  )}
                </div>
              </Link>
            );
          })
        )}
      </div>
    </section>
  );
}


const quickGenres = [
  'Action',
  'Sci-Fi',
  'Drama',
  'Comedy',
  'Anime',
  'Marvel',
  'DC',
  'Thriller',
];

const aiPicks = [
  'Mind-bending',
  'Dark endings',
  'Cyberpunk',
  'Space',
  'Psychological',
  'Time travel',
];

export default function HomePage() {
  const [continueItems, setContinueItems] = useState<any[]>([]);
  const [trendingItems, setTrendingItems] = useState<any[]>([]);
  const [historyItems, setHistoryItems] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [sources, setSources] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);

  useEffect(() => {
    async function safeLoad(path: string) {
      try {
        return await apiFetch(path);
      } catch {
        return { items: [] };
      }
    }

    async function load() {
      const [cont, hist, fav, src, rec, trend] = await Promise.all([
        safeLoad('/continue?limit=20'),
        safeLoad('/history?limit=20'),
        safeLoad('/favorites?limit=20'),
        safeLoad('/sources?limit=20'),
        safeLoad('/recommendations?limit=20'),
        safeLoad('/trending?limit=20'),
      ]);

      setContinueItems(cont.items || []);
      setHistoryItems(hist.items || []);
      setFavorites(fav.items || []);
      setSources(src.items || []);
      setRecommendations(rec.items || []);
      setTrendingItems(trend.items || []);
    }

    load();
  }, []);

  const hero = uniqueItems(trendingItems)[0] || uniqueItems(continueItems)[0] || uniqueItems(favorites)[0] || uniqueItems(sources)[0];
  const heroImage = hero ? poster(hero) : '';
  const heroProvider = hero ? providerLabel(hero) : '';
  const heroTrendingScore =
    hero && typeof hero.trending_score === 'number' ? hero.trending_score : null;
  const heroFallbackGradient =
    'absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(106,76,255,0.45),transparent_35%),radial-gradient(circle_at_80%_40%,rgba(0,224,168,0.18),transparent_35%),linear-gradient(135deg,#050505,#120b2f,#020202)]';

  return (
    <main className="min-h-screen bg-black px-4 pt-4 pb-44 text-white sm:p-6 md:p-10 md:pb-20">
      <section className="glass relative mb-8 min-h-[260px] overflow-hidden rounded-[2rem] border border-white/10 p-6 shadow-[0_0_45px_rgba(106,76,255,0.22)] backdrop-blur-xl sm:min-h-[360px] md:min-h-[520px] md:p-12">
        {heroImage ? (
          <img
            src={heroImage}
            alt={hero.title}
            className="absolute inset-0 h-full w-full scale-105 object-cover opacity-45 blur-[0.5px]"
          />
        ) : (
          <div className={heroFallbackGradient} />
        )}

        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30" />

        {heroTrendingScore !== null && (
          <div className="relative z-20 mb-4 inline-flex rounded-full bg-[#00E0A8]/90 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-black">
            HERO TRENDING SCORE · {heroTrendingScore}
          </div>
        )}

        <div className="hero-content relative z-20 flex min-h-[220px] max-w-4xl flex-col justify-end sm:min-h-[300px] md:min-h-[420px]">
          <div className="mb-4 inline-flex w-fit rounded-full bg-[#6A4CFF]/30 px-4 py-2 text-xs font-black uppercase tracking-[0.25em] text-[#C7BAFF]">
            {heroProvider || 'STREAMVERSE'} · Dynamic Hero
          </div>

          <h1 className="text-3xl font-black leading-[1] sm:text-6xl md:text-8xl">
            {hero?.title || 'StreamVerse Premium'}
          </h1>

          <p className="mt-5 max-w-3xl text-lg font-medium text-white/70">
            {hero?.description || 'Cel mai relevant conținut trending este promovat automat în hero, cu scor AI și date live din platformă.'}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={hero ? `/watch/${itemId(hero)}` : '/sources'}
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-4 font-black text-black transition hover:scale-105"
            >
              <Play size={18} />
              Play
            </Link>

            <Link
              href="/sources"
              className="inline-flex items-center gap-2 rounded-2xl bg-[#6A4CFF] px-6 py-4 font-black transition hover:scale-105"
            >
              <Database size={18} />
              Sources
            </Link>

            <Link
              href="/search"
              className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-6 py-4 font-black transition hover:bg-white/20"
            >
              <Search size={18} />
              Search
            </Link>
          </div>
        </div>
      </section>

      <section
        className="stats-mobile-grid mt-5"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        {[
          ['Continue', continueItems.length, '/continue-watching'],
          ['Favorites', favorites.length, '/watchlist'],
          ['Sources', sources.length, '/sources'],
          ['History', historyItems.length, '/history'],
        ].map(([label, value, href]) => (
          <Link
            key={label}
            href={String(href)}
            className="stats-mobile-card border border-white/10 bg-white/[0.04] transition hover:border-[#6A4CFF]"
            style={{
              minHeight: 92,
              borderRadius: 20,
              padding: 12,
              width: 'calc(50% - 4px)',
              maxWidth: 'calc(50% - 4px)',
              flex: '0 0 calc(50% - 4px)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            <div className="text-[9px] font-black uppercase tracking-[0.16em] text-white/40">
              StreamVerse Stats
            </div>
            <div className="mt-2 text-2xl font-black">{String(value)}</div>
            <div className="mt-1 text-xs text-white/50">{String(label)}</div>
          </Link>
        ))}
      </section>

      <section className="mb-10 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black sm:text-2xl text-white">
            AI Discovery Hub
          </h2>

          <div className="rounded-full bg-[#6A4CFF]/20 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-[#B8A7FF]">
            Smart discovery
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5">
            <h3 className="mb-4 text-base font-black sm:text-lg">
              Trending Genres
            </h3>

            <div className="flex flex-wrap gap-2">
              {quickGenres.map((genre) => (
                <Link
                  key={genre}
                  href={`/search?q=${encodeURIComponent(genre)}`}
                  className="rounded-full bg-white/10 px-3 py-2 text-xs font-bold sm:px-4 sm:text-sm text-white/70 transition hover:bg-[#6A4CFF] hover:text-white"
                >
                  {genre}
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5">
            <h3 className="mb-4 text-base font-black sm:text-lg">
              AI Picks
            </h3>

            <div className="flex flex-wrap gap-2">
              {aiPicks.map((pick) => (
                <Link
                  key={pick}
                  href={`/search?q=${encodeURIComponent(pick)}`}
                  className="rounded-full bg-[#6A4CFF]/15 px-4 py-2 text-sm font-bold text-[#C7BAFF] transition hover:bg-[#6A4CFF] hover:text-white"
                >
                  {pick}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Row
        title="Trending Now"
        icon={Sparkles}
        href="/trending"
        items={trendingItems.length ? trendingItems : sources}
      />

      <Row
        title="Recommended For You"
        icon={Sparkles}
        href="/sources"
        items={recommendations.length ? recommendations : sources}
      />

      <Row
        title="Continue Watching"
        icon={Clock3}
        href="/continue-watching"
        items={continueItems}
        showProgress
      />

      <Row title="Favorites" icon={Heart} href="/watchlist" items={favorites} />
      <Row title="Watch History" icon={History} href="/history" items={historyItems} />
      <Row title="Recently Added Sources" icon={Database} href="/sources" items={sources} />
    </main>
  );
}
