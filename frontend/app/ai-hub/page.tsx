'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Brain, Sparkles, Wand2, ListMusic, Filter, Play } from 'lucide-react';
import { apiFetch } from '../../lib/apiClient';

function poster(item: any) {
  return item.poster || item.backdrop || item.thumbnail || item.metadata?.thumbnail || '';
}

function itemId(item: any) {
  return item.source_id || item.id;
}

function score(item: any) {
  return Number(item.score || item.trending_score || 0);
}

export default function AIHubPage() {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [trending, setTrending] = useState<any[]>([]);
  const [sources, setSources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        const [rec, trend, src] = await Promise.all([
          apiFetch('/recommendations?limit=24'),
          apiFetch('/trending?limit=24'),
          apiFetch('/sources'),
        ]);

        if (!alive) return;

        setRecommendations(rec.items || []);
        setTrending(trend.items || []);
        setSources(src.items || []);
      } catch {
        if (!alive) return;

        setRecommendations([]);
        setTrending([]);
        setSources([]);
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();

    return () => {
      alive = false;
    };
  }, []);

  const smartFilters = useMemo(() => {
    const providers = Array.from(
      new Set(
        sources
          .map((item) => item.provider || item.type || item.source_type)
          .filter(Boolean)
      )
    ).slice(0, 8);

    return providers.map((provider) => ({
      id: provider,
      title: String(provider),
      href: `/search?provider=${encodeURIComponent(String(provider))}`,
    }));
  }, [sources]);

  const rows = [
    {
      title: 'Recomandări AI pentru tine',
      icon: Sparkles,
      items: recommendations,
      empty: 'Nu există încă recomandări generate.',
    },
    {
      title: 'Trending inteligent',
      icon: ListMusic,
      items: trending,
      empty: 'Nu există încă trending calculat.',
    },
    {
      title: 'Surse recente analizate',
      icon: Wand2,
      items: sources.slice(0, 24),
      empty: 'Nu există încă surse salvate.',
    },
  ];

  return (
    <main className="min-h-screen overflow-x-hidden bg-black px-4 pb-32 pt-24 text-white md:px-10 md:pb-20 md:pt-10">
      <section className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#6A4CFF]/40 to-[#00E0A8]/10 p-6 md:p-12">
        <div className="mb-4 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-black">
          STREAMVERSE AI
        </div>

        <h1 className="flex items-center gap-3 text-4xl font-black md:text-7xl">
          <Brain />
          AI Hub
        </h1>

        <p className="mt-5 max-w-3xl text-base leading-relaxed text-white/70 md:text-lg">
          Recomandări, trending, surse și filtre generate din date reale din backend.
        </p>
      </section>

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-4">
        <Info icon={<Sparkles />} title="Recomandări" />
        <Info icon={<ListMusic />} title="Trending" />
        <Info icon={<Wand2 />} title="Surse analizate" />
        <Info icon={<Filter />} title="Filtre" />
      </div>

      {loading ? (
        <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.06] p-8 text-white/50">
          Se încarcă AI Hub...
        </div>
      ) : (
        <div className="mt-10 space-y-10">
          {rows.map((row) => {
            const Icon = row.icon;

            return (
              <section key={row.title}>
                <h2 className="mb-5 flex items-center gap-3 text-2xl font-black">
                  <Icon size={22} />
                  {row.title}
                </h2>

                {row.items.length === 0 ? (
                  <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-white/45">
                    {row.empty}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
                    {row.items.map((item: any) => {
                      const image = poster(item);

                      return (
                        <Link
                          key={`${row.title}-${item.id}-${item.source_id || item.url || ''}`}
                          href={`/watch/${itemId(item)}`}
                          className="group overflow-hidden rounded-3xl border border-white/10 bg-white/10 transition hover:scale-[1.02]"
                        >
                          <div className="relative aspect-[16/10] overflow-hidden bg-white/5">
                            {image ? (
                              <img
                                src={image}
                                alt={item.title || 'AI item'}
                                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center">
                                <Play size={42} className="text-white/30" />
                              </div>
                            )}

                            <div className="absolute left-2 top-2 rounded-full bg-black/70 px-2 py-1 text-[10px] font-black uppercase">
                              {item.provider || item.type || item.content_type || 'source'}
                            </div>

                            {score(item) > 0 && (
                              <div className="absolute right-2 top-2 rounded-full bg-[#00E0A8]/90 px-2 py-1 text-[10px] font-black text-black">
                                {score(item)}
                              </div>
                            )}
                          </div>

                          <div className="p-3">
                            <div className="line-clamp-1 text-sm font-black">
                              {item.title || 'Untitled'}
                            </div>

                            {item.reason && (
                              <div className="mt-1 line-clamp-1 text-xs text-[#B8A7FF]">
                                {item.reason}
                              </div>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })}

          <section>
            <h2 className="mb-5 flex items-center gap-3 text-2xl font-black">
              <Filter size={22} />
              Filtre inteligente
            </h2>

            {smartFilters.length === 0 ? (
              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-white/45">
                Filtrele apar după ce există surse cu provider salvat.
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                {smartFilters.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-bold text-white/70 transition hover:bg-[#6A4CFF] hover:text-white"
                  >
                    {item.title}
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </main>
  );
}

function Info({ icon, title }: any) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 md:p-6">
      <div className="text-[#00E0A8]">{icon}</div>
      <div className="mt-3 text-xl font-black md:text-2xl">{title}</div>
      <div className="mt-2 text-white/50">Date reale din backend</div>
    </div>
  );
}
