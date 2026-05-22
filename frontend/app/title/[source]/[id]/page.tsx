'use client';

import { apiFetch, apiPost } from '../../../../lib/apiClient';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowLeft, Info, Play, Plus, Star } from 'lucide-react';

export default function TitlePage({
  params,
}: {
  params: Promise<{ source: string; id: string }>;
}) {
  const [routeParams, setRouteParams] = useState<{ source: string; id: string } | null>(null);

  useEffect(() => {
    params.then(setRouteParams);
  }, [params]);

  const source = routeParams?.source || 'unknown';
  const id = routeParams?.id || '';
  const decodedId = decodeURIComponent(id);

  const [meta, setMeta] = useState<any>({
    title: decodedId,
    year: '2025',
    genres: ['Action', 'Drama'],
    poster: "/placeholder-poster.svg",
    backdrop: "/placeholder-poster.svg",
    trailerUrl: '',
  });

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;

    const endpoint =
      source === 'imdb'
        ? `/addons/3/meta/movie/${encodeURIComponent(decodedId)}`
        : `/metadata/title/${source}/${encodeURIComponent(decodedId)}`;

    apiFetch(endpoint)
      .then((data: any) => {
        if (!active || !data) return;

        const addonMeta = data.meta;

        if (addonMeta) {
          setMeta((prev: any) => ({
            ...prev,
            title: addonMeta.name || addonMeta.title || prev.title,
            description: addonMeta.description || prev.description,
            year: addonMeta.releaseInfo || addonMeta.year || prev.year,
            genres: addonMeta.genres || prev.genres,
            poster: addonMeta.poster || prev.poster,
            backdrop: addonMeta.background || addonMeta.poster || prev.backdrop,
            rating: addonMeta.imdbRating || addonMeta.rating || prev.rating,
            runtime: addonMeta.runtime || prev.runtime,
            trailerUrl: addonMeta.trailers?.[0]?.source
              ? `https://www.youtube.com/embed/${addonMeta.trailers[0].source}`
              : addonMeta.trailerStreams?.[0]?.ytId
                ? `https://www.youtube.com/embed/${addonMeta.trailerStreams[0].ytId}`
                : prev.trailerUrl,
            raw: addonMeta,
          }));
        } else {
          setMeta((prev: any) => ({ ...prev, ...data }));
        }
      })
      .catch(() => null)
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [source, decodedId]);

  const item = {
    id: decodedId,
    source,
    title: meta.title || decodedId,
    subtitle: `${meta.year || 'Unknown'} • ${(meta.genres || []).join(', ')}`,
    image: meta.poster,
    trailerUrl: meta.trailerUrl,
    href: `/title/${source}/${encodeURIComponent(decodedId)}`,
  };

  function showMessage(text: string) {
    setMessage(text);
    setTimeout(() => setMessage(''), 2500);
  }

  async function addToLibrary() {
    try {
      await apiPost('/library', {
        sourceId: Number.isFinite(Number(decodedId)) ? Number(decodedId) : null,
        contentId: null,
        title: meta.title || item.title || String(decodedId),
        url: meta.trailerUrl || item.href,
        provider: source,
        poster: meta.poster || item.image || '',
        metadata: {
          source,
          id: decodedId,
          subtitle: item.subtitle,
          trailerUrl: meta.trailerUrl,
        },
      });

      showMessage('✅ Salvat în Library');
    } catch {
      showMessage('❌ Nu s-a putut salva în Library');
    }
  }

  async function addFavorite() {
    try {
      await apiPost('/favorites', {
        sourceId: String(decodedId),
        contentId: '',
        title: meta.title || item.title || String(decodedId),
        url: meta.trailerUrl || item.href,
        provider: source,
        sourceType: source,
        poster: meta.poster || item.image || '',
        metadata: {
          source,
          id: decodedId,
          subtitle: item.subtitle,
          trailerUrl: meta.trailerUrl,
        },
      });

      showMessage('✅ Salvat în Favorite');
    } catch {
      showMessage('❌ Nu s-a putut salva în Favorite');
    }
  }

  async function playTitle() {
    try {
      const trailerUrl =
        meta.trailerUrl ||
        (meta.raw?.trailerStreams?.[0]?.ytId
          ? `https://www.youtube.com/watch?v=${meta.raw.trailerStreams[0].ytId}`
          : '');

      if (!trailerUrl) {
        showMessage('❌ Nu există trailer disponibil');
        return;
      }

      const created = await apiPost('/db/sources', {
        title: meta.title || item.title || String(decodedId),
        description: meta.description || '',
        url: trailerUrl,
        poster: meta.poster || item.image || '',
        category: source,
        metadata: {
          source,
          id: decodedId,
          type: 'trailer',
          provider: 'youtube',
          raw: meta.raw || meta,
        },
      });

      await apiPost('/history', {
        sourceId: String(created.id || created.source?.id || decodedId),
        contentId: String(created.content_id || created.source?.content_id || ''),
        title: meta.title || item.title || String(decodedId),
        url: trailerUrl,
        provider: 'youtube',
        sourceType: 'youtube',
        poster: meta.poster || item.image || '',
        progress: 1,
        metadata: { source, id: decodedId },
      }).catch(() => null);

      window.location.href = `/watch/${created.id || created.source?.id}`;
    } catch {
      showMessage('❌ Nu am putut porni playerul');
    }
  }

  return (
    <>
      {message && (
        <div className="fixed left-1/2 top-6 z-[9999] -translate-x-1/2 rounded-2xl border border-white/10 bg-black/90 px-6 py-4 text-sm font-black text-white shadow-2xl backdrop-blur-xl">
          {message}
        </div>
      )}

      <main className="min-h-screen bg-black pb-56 text-white md:pb-20">
        <section className="relative min-h-[680px] overflow-hidden">
          {meta.backdrop && (
            <img
              src={meta.backdrop}
              alt={meta.title}
              className="absolute inset-0 h-full w-full object-cover opacity-40"
            />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/20" />

          <div className="relative z-10 px-6 py-10 md:px-10">
            <Link href="/discover" className="mb-8 inline-flex rounded-2xl bg-white/10 px-5 py-3 font-black">
              <ArrowLeft size={18} />
              Înapoi
            </Link>

            <div className="max-w-5xl pt-20">
              <div className="mb-4 w-fit rounded-full bg-[#6A4CFF]/30 px-4 py-2 text-xs font-black uppercase text-[#B8A7FF]">
                {source}
              </div>

              <h1 className="max-w-5xl text-4xl font-black leading-tight md:text-7xl">
                {loading ? 'Se încarcă...' : item.title}
              </h1>

              <p className="mt-5 max-w-3xl text-white/60">{item.subtitle}</p>

              <div className="mt-6 flex flex-wrap gap-2 text-sm">
                {(meta.genres || []).map((genre: string) => (
                  <span key={genre} className="rounded-full bg-white/10 px-4 py-2">
                    {genre}
                  </span>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={playTitle}
                  className="flex items-center gap-2 rounded-2xl bg-white px-6 py-4 font-black text-black"
                >
                  <Play size={20} /> Play
                </button>

                <button
                  onClick={addToLibrary}
                  className="flex items-center gap-2 rounded-2xl bg-[#6A4CFF] px-6 py-4 font-bold"
                >
                  <Plus size={18} /> Library
                </button>

                <button
                  onClick={addFavorite}
                  className="flex items-center gap-2 rounded-2xl bg-white/10 px-6 py-4 font-bold"
                >
                  <Star size={18} /> Favorite
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 p-6 md:grid-cols-[1fr_360px] md:p-10">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="mb-4 text-3xl font-black">Descriere</h2>
            <p className="text-white/60">
              {meta.description || 'Metadata disponibilă din sursele StreamVerse.'}
            </p>
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
    </>
  );
}
