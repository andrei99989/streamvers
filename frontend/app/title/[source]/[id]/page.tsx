'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Play, Star, Plus, Info } from 'lucide-react';

const API =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  'http://127.0.0.1:4000';

export default function TitlePage({
  params,
}: {
  params: Promise<{ source: string; id: string }>;
}) {
  const router = useRouter();
  const { source, id } = use(params);
  const decodedId = decodeURIComponent(id);

  const fallback = {
    id,
    source,
    title: decodedId.replaceAll('-', ' ') || 'StreamVerse Title',
    description:
      'Pagină cinematică pentru metadata, trailere, episoade, surse video, subtitrări și recomandări AI.',
    year: '2025',
    rating: '9.1',
    runtime: '128 min',
    genres: ['Action', 'Drama'],
    poster: `https://picsum.photos/500/750?random=${encodeURIComponent(id)}poster`,
    backdrop: `https://picsum.photos/1600/900?random=${encodeURIComponent(id)}`,
  };

  const [meta, setMeta] = useState<any>(fallback);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/metadata/title/${source}/${encodeURIComponent(id)}`)
      .then((r) => r.json())
      .then((data) => {
        setMeta({
          ...fallback,
          ...data,
          poster: data.poster || fallback.poster,
          backdrop: data.backdrop || fallback.backdrop,
        });
      })
      .catch(() => setMeta(fallback))
      .finally(() => setLoading(false));
  }, [source, id]);

  const item = {
    id,
    source,
    title: meta.title,
    subtitle: `${meta.year || 'Unknown'} • ${(meta.genres || []).join(', ')}`,
    image: meta.poster,
    href: `/title/${source}/${encodeURIComponent(id)}`,
  };

  function saveItem(key: string, extra: any = {}) {
    const saved = JSON.parse(localStorage.getItem(key) || '[]');
    const next = { ...item, ...extra };

    localStorage.setItem(
      key,
      JSON.stringify([next, ...saved.filter((x: any) => !(x.id === id && x.source === source))])
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="relative min-h-[620px] overflow-hidden">
        <img src={meta.backdrop} alt={meta.title} className="absolute inset-0 h-full w-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/20" />

        <div className="relative z-10 grid min-h-[620px] items-end gap-8 p-6 md:grid-cols-[280px_1fr] md:p-10">
          <img src={meta.poster} alt={meta.title} className="hidden rounded-[2rem] border border-white/10 shadow-2xl md:block" />

          <div className="pb-8">
            <div className="mb-4 inline-flex rounded-full bg-[#6A4CFF] px-4 py-2 text-sm font-black">
              {source.toUpperCase()}
            </div>

            <h1 className="max-w-5xl text-4xl font-black capitalize leading-tight md:text-7xl">
              {meta.title}
            </h1>

            <p className="mt-5 max-w-3xl text-white/70">
              {loading ? 'Se încarcă metadata...' : meta.description}
            </p>

            <div className="mt-5 flex flex-wrap gap-2 text-sm text-white/60">
              <span className="rounded-full bg-white/10 px-4 py-2">{meta.year || 'Unknown year'}</span>
              <span className="rounded-full bg-white/10 px-4 py-2">Rating {meta.rating || 'N/A'}</span>
              <span className="rounded-full bg-white/10 px-4 py-2">{meta.runtime || 'Runtime N/A'}</span>
              {(meta.genres || []).map((genre: string) => (
                <span key={genre} className="rounded-full bg-white/10 px-4 py-2">
                  {genre}
                </span>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => {
                  saveItem('streamverse_continue', {
                    progress: Math.floor(Math.random() * 60) + 10,
                    trailerUrl: meta.trailerUrl,
                  });
                  router.push('/watch/demo');
                }}
                className="flex items-center gap-2 rounded-2xl bg-white px-6 py-4 font-black text-black"
              >
                <Play size={20} /> Play
              </button>

              <button
                onClick={() => {
                  saveItem('streamverse_library');
                }}
                className="flex items-center gap-2 rounded-2xl bg-[#6A4CFF] px-6 py-4 font-bold"
              >
                <Plus size={18} /> Library
              </button>

              <button
                onClick={() => {
                  saveItem('streamverse_watchlist');
                }}
                className="flex items-center gap-2 rounded-2xl bg-white/10 px-6 py-4 font-bold"
              >
                <Star size={18} /> Favorite
              </button>

              <Link href="/watch/demo" className="rounded-2xl bg-white/10 px-6 py-4 font-bold">
                Trailer
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-8 p-6 md:p-10 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <h2 className="mb-4 text-3xl font-black">Player Universal</h2>
          <div className="aspect-video overflow-hidden rounded-2xl bg-black">
            <iframe
              className="h-full w-full"
              src={meta.trailerUrl || 'https://www.youtube.com/embed/dQw4w9WgXcQ'}
              title="StreamVerse Player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>

        <aside className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <h3 className="mb-4 flex items-center gap-2 text-2xl font-black">
            <Info size={20} /> Metadata
          </h3>

          <div className="space-y-3 text-white/70">
            <div>Source: {source}</div>
            <div>ID: {decodedId}</div>
            <div>Genre: {(meta.genres || []).join(', ') || 'N/A'}</div>
            <div>Year: {meta.year || 'N/A'}</div>
            <div>Rating: {meta.rating || 'N/A'}</div>
            <div>Runtime: {meta.runtime || 'N/A'}</div>
          </div>
        </aside>
      </section>
    </main>
  );
}
