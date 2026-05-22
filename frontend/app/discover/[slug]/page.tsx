import Link from 'next/link';
import { Compass, Play, Search, Flame, Star } from 'lucide-react';
import { apiFetch } from '../../../lib/apiClient';

function titleFromSlug(slug: string) {
  return slug
    .split('-')
    .filter(Boolean)
    .map((x) => x.charAt(0).toUpperCase() + x.slice(1))
    .join(' ');
}

function poster(item: any) {
  return item.poster || item.backdrop || item.thumbnail || item.metadata?.thumbnail || '';
}

function itemId(item: any) {
  return item.source_id || item.id;
}

export default async function DiscoverSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const title = titleFromSlug(slug);

  let items: any[] = [];

  try {
    const res = await apiFetch(`/search?q=${encodeURIComponent(title)}&limit=24`);
    items = res.items || res.results || [];
  } catch {
    items = [];
  }

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
          Rezultate reale din backend pentru această colecție.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/discover"
            className="rounded-2xl bg-white/10 px-6 py-4 font-black hover:bg-white/20"
          >
            Înapoi
          </Link>

          <Link
            href={`/search?q=${encodeURIComponent(title)}`}
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
          <h2 className="text-3xl font-black">Rezultate</h2>
        </div>

        {items.length === 0 ? (
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 text-white/50">
            Nu există încă rezultate pentru această colecție.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-6">
            {items.map((item) => {
              const image = poster(item);

              return (
                <Link
                  key={`${item.id}-${item.source_id || item.url || ''}`}
                  href={`/watch/${itemId(item)}`}
                  className="group overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] shadow-[0_0_35px_rgba(106,76,255,.12)] transition hover:-translate-y-1 hover:border-[#6A4CFF]"
                >
                  <div className="relative aspect-[2/3] overflow-hidden bg-white/5">
                    {image ? (
                      <img
                        src={image}
                        alt={item.title || title}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Play size={46} className="text-white/30" />
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                    <div className="absolute left-3 top-3 rounded-full bg-black/70 px-3 py-1 text-xs font-black uppercase">
                      {item.provider || item.type || 'source'}
                    </div>

                    <div className="absolute inset-0 flex items-center justify-center opacity-0 transition group-hover:opacity-100">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-black">
                        <Play fill="currentColor" />
                      </div>
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="line-clamp-2 font-black">
                      {item.title || 'Untitled'}
                    </h3>

                    <div className="mt-3 flex items-center gap-2 text-sm text-[#B8A7FF]">
                      <Star size={14} fill="currentColor" />
                      Backend result
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
