'use client';

import { apiFetch, apiPost } from '../../../lib/apiClient';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowLeft, Library, Search, Star } from 'lucide-react';
import UniversalPlayer from '../../../components/UniversalPlayer';

export default function WatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [routeId, setRouteId] = useState('');
  const [item, setItem] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<any>(null);

  useEffect(() => {
    params.then((p) => setRouteId(decodeURIComponent(p.id)));
  }, [params]);

  useEffect(() => {
    if (!routeId) return;

    let active = true;

    async function load() {
      try {
        const source = await apiFetch(`/sources/${routeId}`);
        setSource(source);
        // Continue Watching is saved by UniversalPlayer with normalized source props.

        const sourcesData = await apiFetch('/sources');

        if (!active) return;

        setItem(source);
        const seen = new Set<string>();
        const currentItem = source;

        const cleanRelated = (sourcesData.items || [])
          .filter((x: any) => String(x.id) !== String(routeId))
          .filter((x: any) => {
            const currentUrl = currentItem?.url || currentItem?.embed_url || '';
            const xUrl = x.url || x.embed_url || '';

            if (currentUrl && xUrl && currentUrl === xUrl) return false;

            const currentTitle = (currentItem?.title || '').toLowerCase().trim();
            const xTitle = (x.title || '').toLowerCase().trim();
            const currentProvider = currentItem?.provider || currentItem?.source_type || currentItem?.type || '';
            const xProvider = x.provider || x.source_type || x.type || '';

            if (currentTitle && xTitle && currentTitle === xTitle && currentProvider === xProvider) {
              return false;
            }

            const key = [
              (x.title || '').toLowerCase().trim(),
              x.provider || x.source_type || x.type || '',
            ].join('|');

            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          })
          .sort((a: any, b: any) => {
            const ah = a.poster && String(a.poster).trim() ? 1 : 0;
            const bh = b.poster && String(b.poster).trim() ? 1 : 0;

            if (bh !== ah) return bh - ah;

            const ap = a.provider || a.source_type || a.type || '';
            const bp = b.provider || b.source_type || b.type || '';

            return ap.localeCompare(bp);
          })
          .slice(0, 8);

        const providerCounts: Record<string, number> = {};

        const limitedRelated = cleanRelated.filter((x: any) => {
          const provider = x.provider || x.source_type || x.type || 'source';
          providerCounts[provider] = providerCounts[provider] || 0;

          if (providerCounts[provider] >= 2) return false;

          providerCounts[provider] += 1;
          return true;
        });

        setRelated(limitedRelated);

        await apiPost('/history', {
          sourceId: String(source.id),
          contentId: String(source.content_id || ''),
          title: source.title || 'Untitled',
          url: source.url || source.embed_url || '',
          provider: source.provider || source.source_type || '',
          sourceType: source.source_type || source.provider || '',
          poster: source.poster || '',
          progress: 1,
          metadata: source,
        }).catch(() => null);

        await apiPost('/continue', {
          sourceId: String(source.id),
          source_id: String(source.id),
          contentId: String(source.content_id || ''),
          content_id: String(source.content_id || ''),
          title: source.title || 'Untitled',
          url: source.url || source.embed_url || '',
          provider: source.provider || source.source_type || source.type || 'source',
          sourceType: source.source_type || source.type || source.provider || 'source',
          source_type: source.source_type || source.type || source.provider || 'source',
          poster: source.poster || source.thumbnail || source.metadata?.thumbnail || '',
          progress: 5,
          duration: Number(source.duration || 120),
          metadata: { autosave: true, fallback: true },
        }).catch(() => null);
      } catch {
        if (active) setItem(null);
      } finally {
        if (active) setLoading(false);
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [routeId]);

  function showMessage(text: string) {
    setMessage(text);
    setTimeout(() => setMessage(''), 2500);
  }

  function getYoutubeId(url: string) {
    const value = String(url || '');

    if (value.includes('/embed/')) {
      return value.split('/embed/')[1]?.split('?')[0]?.split('&')[0] || '';
    }

    if (value.includes('watch?v=')) {
      return value.split('watch?v=')[1]?.split('&')[0] || '';
    }

    if (value.includes('youtu.be/')) {
      return value.split('youtu.be/')[1]?.split('?')[0] || '';
    }

    return '';
  }

  async function addToLibrary() {
    if (!item) return showMessage('❌ Nu există sursă pentru Library');

    try {
      await apiPost('/library', {
        sourceId: item.id,
        contentId: item.content_id || null,
        title: item.title || 'Untitled',
        url: item.url || item.embed_url || '',
        provider: item.provider || item.source_type || item.type || '',
        poster: item.poster || '',
        metadata: item,
      });

      showMessage('✅ Salvat în Library');
    } catch {
      showMessage('❌ Nu s-a putut salva în Library');
    }
  }

  async function addFavorite() {
    if (!item) return showMessage('❌ Nu există sursă pentru Favorite');

    try {
      await apiPost('/favorites', {
        sourceId: String(item.id),
        contentId: String(item.content_id || ''),
        title: item.title || 'Untitled',
        url: item.url || item.embed_url || '',
        provider: item.provider || item.source_type || item.type || '',
        sourceType: item.source_type || item.provider || item.type || '',
        poster: item.poster || '',
        metadata: item,
      });

      showMessage('✅ Salvat în Favorite');
    } catch {
      showMessage('❌ Nu s-a putut salva în Favorite');
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black p-10 text-white">
        Se încarcă...
      </main>
    );
  }

  if (!item) {
    return (
      <main className="min-h-screen bg-black p-10 text-white">
        Nu am găsit sursa.
      </main>
    );
  }

  return (
    <>
      {message && (
        <div className="fixed left-1/2 top-6 z-[9999] -translate-x-1/2 rounded-2xl border border-white/10 bg-black/90 px-6 py-4 text-sm font-black text-white shadow-2xl backdrop-blur-xl">
          {message}
        </div>
      )}

      <main className="min-h-screen bg-black p-6 pb-56 text-white md:p-10 md:pb-20">
        <Link href="/" className="mb-6 inline-flex items-center gap-2 rounded-2xl bg-white/10 px-5 py-3 font-black">
          <ArrowLeft size={18} />
          Back
        </Link>

        <section className="mx-auto max-w-6xl">
          <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-2xl shadow-[#6A4CFF]/20">
            <UniversalPlayer
              source={{
                ...item,
                sourceId: String(item.id),
                contentId: String(item.content_id || ''),
                provider: item.provider || item.source_type || item.type || '',
                type: item.source_type || item.type || item.provider || '',
                poster: item.poster || '',
              }}
              title={item.title}
            />
          </div>

          <section className="mt-8 rounded-[2rem] border border-white/10 bg-white/5 p-6">
            <div className="mb-4 w-fit rounded-full bg-[#6A4CFF]/30 px-4 py-2 text-xs font-black uppercase text-[#B8A7FF]">
              {item.provider || item.source_type || item.type || 'source'}
            </div>

            <h1 className="text-4xl font-black">{item.title}</h1>

            <p className="mt-4 break-all text-white/50">{item.url}</p>

            <div className="mt-6 grid gap-3 text-sm text-white/70">
              <div><b>Provider:</b> {item.provider || item.source_type || item.type || 'N/A'}</div>
              <div><b>Type:</b> {item.source_type || item.type || item.provider || 'N/A'}</div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={addToLibrary}
                className="flex items-center gap-2 rounded-2xl bg-[#6A4CFF] px-6 py-4 font-bold"
              >
                <Library size={18} /> Library
              </button>

              <button
                onClick={addFavorite}
                className="flex items-center gap-2 rounded-2xl bg-white/10 px-6 py-4 font-bold"
              >
                <Star size={18} /> Favorite
              </button>

              <Link
                href="/search"
                className="flex items-center gap-2 rounded-2xl bg-white/10 px-6 py-4 font-bold"
              >
                <Search size={18} /> Search
              </Link>
            </div>
          </section>

          {related.length > 0 && (
            <section className="mt-10">
              <h2 className="mb-5 text-3xl font-black">Related Sources</h2>

              <div className="space-y-8">
                {Object.entries(
                  related.reduce((groups: Record<string, any[]>, rel: any) => {
                    const key = rel.provider || rel.source_type || rel.type || 'source';
                    groups[key] = groups[key] || [];
                    groups[key].push(rel);
                    return groups;
                  }, {})
                ).map(([provider, items]: any) => (
                  <div key={provider}>
                    <h3 className="mb-4 rounded-2xl bg-white/10 px-5 py-3 text-xl font-black uppercase text-white/80">Provider: {provider}</h3>

                    <div className="grid gap-5 md:grid-cols-3">
                      {items.map((rel: any) => (
                        <Link
                          key={rel.id}
                          href={`/watch/${rel.id}`}
                          className="block overflow-hidden rounded-[2rem] border border-white/10 bg-white/5"
                        >
                          {(rel.poster && String(rel.poster).trim()) || (rel.provider || rel.source_type) === 'youtube' ? (
                            <img
                              src={
                                rel.poster && String(rel.poster).trim()
                                  ? rel.poster
                                  : `https://img.youtube.com/vi/${getYoutubeId(rel.url || rel.embed_url || '')}/hqdefault.jpg`
                              }
                              alt=""
                              onError={(e) => {
                                const parent = e.currentTarget.parentElement;
                                e.currentTarget.remove();

                                if (parent && !parent.querySelector('.fallback-provider')) {
                                  const div = document.createElement('div');
                                  div.className =
                                    'fallback-provider flex h-44 flex-col items-center justify-center bg-white/5 text-xs text-white/40';

                                  const icon = document.createElement('div');
                                  icon.style.fontSize = '32px';
                                  icon.textContent = '▶️';

                                  const label = document.createElement('div');
                                  label.style.marginTop = '8px';
                                  label.style.fontWeight = '700';
                                  label.style.textTransform = 'uppercase';
                                  label.textContent = String(rel.provider || rel.source_type || rel.type || 'source');

                                  div.appendChild(icon);
                                  div.appendChild(label);

                                  parent.prepend(div);
                                }
                              }}
                              className="h-44 w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-44 flex-col items-center justify-center bg-white/5 text-xs text-white/40">
                              <div className="text-3xl">▶️</div>
                              <div className="mt-2 font-black uppercase">
                                {rel.provider || rel.source_type || rel.type || 'source'}
                              </div>
                            </div>
                          )}

                          <div className="p-4">
                            <h3 className="line-clamp-2 text-xl font-black">
                              {rel.title || 'Untitled'}
                            </h3>

                            <div className="mt-3 text-xs text-white/40">
                              Click pentru Play
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </section>
      </main>
    </>
  );
}
