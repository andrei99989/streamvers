'use client';

import { apiFetch, apiPost } from '../../../lib/apiClient';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowLeft, Library, Search, Star, Database, Hash } from 'lucide-react';
import UniversalPlayer from '../../../components/UniversalPlayer';

function providerOf(item: any) {
  return item?.provider || item?.source_type || item?.type || 'source';
}

function typeOf(item: any) {
  return item?.source_type || item?.type || item?.provider || 'source';
}

function posterOf(item: any) {
  return item?.poster || item?.thumbnail || item?.metadata?.thumbnail || '';
}

function watchId(item: any) {
  return item?.source_id || item?.id;
}

export default function WatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [routeId, setRouteId] = useState('');
  const [item, setItem] = useState<any>(null);
  const [sources, setSources] = useState<any[]>([]);
  const [related, setRelated] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [probe, setProbe] = useState<any>(null);
  const [transcodeJob, setTranscodeJob] = useState<any>(null);

  useEffect(() => {
    params.then((p) => setRouteId(decodeURIComponent(p.id)));
  }, [params]);

  useEffect(() => {
    if (!routeId) return;

    let active = true;

    async function load() {
      setLoading(true);

      try {
        const current = await apiFetch(`/sources/${routeId}`);
        const sourcesData = await apiFetch('/sources?limit=100');

        if (!active) return;

        setItem(current);
        apiFetch(`/stream/probe?url=${encodeURIComponent(current.url || current.embed_url || '')}`)
          .then(setProbe)
          .catch(() => setProbe(null));
        const byContent = current.content_id ? await apiFetch(`/sources/by-content/${current.content_id}`) : { items: [current] };
        if (active) setSources(byContent.items || [current]);

        const currentKey = current?.content_key || current?.metadata?.contentKey || '';
        const currentTitle = String(current?.title || '').toLowerCase().trim();

        const rel = (sourcesData.items || [])
          .filter((x: any) => String(x.id) !== String(routeId))
          .filter((x: any) => {
            if (currentKey && x.content_key === currentKey) return false;
            if (currentTitle && String(x.title || '').toLowerCase().trim() === currentTitle) return false;
            return true;
          })
          .slice(0, 8);

        setRelated(rel);

        await apiPost('/history', {
          sourceId: String(current.id),
          contentId: String(current.content_id || ''),
          title: current.title || 'Untitled',
          url: current.url || current.embed_url || '',
          provider: providerOf(current),
          sourceType: typeOf(current),
          poster: posterOf(current),
          progress: 1,
          metadata: {
            content_key: current.content_key,
            category: current.metadata?.category,
            provider: providerOf(current),
          },
        }).catch(() => null);

        await apiPost('/continue', {
          sourceId: String(current.id),
          source_id: String(current.id),
          contentId: String(current.content_id || ''),
          content_id: String(current.content_id || ''),
          title: current.title || 'Untitled',
          url: current.url || current.embed_url || '',
          provider: providerOf(current),
          sourceType: typeOf(current),
          source_type: typeOf(current),
          poster: posterOf(current),
          progress: 1,
          duration: Number(current.duration || 120),
          metadata: { autosave: true, content_key: current.content_key },
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

  async function addToLibrary() {
    if (!item) return showMessage('❌ Nu există sursă pentru Library');

    try {
      await apiPost('/library', {
        sourceId: item.id,
        contentId: item.content_id || null,
        title: item.title || 'Untitled',
        url: item.url || item.embed_url || '',
        provider: providerOf(item),
        poster: posterOf(item),
        metadata: {
          content_key: item.content_key,
          category: item.metadata?.category,
          provider: providerOf(item),
        },
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
        provider: providerOf(item),
        sourceType: typeOf(item),
        poster: posterOf(item),
        metadata: {
          content_key: item.content_key,
          category: item.metadata?.category,
          provider: providerOf(item),
        },
      });

      showMessage('✅ Salvat în Favorite');
    } catch {
      showMessage('❌ Nu s-a putut salva în Favorite');
    }
  }


  async function startTranscode() {
    if (!item?.url && !item?.embed_url) {
      return showMessage('❌ Nu există URL pentru transcoding');
    }

    try {
      setTranscodeJob({ status: 'starting', progress: 0 });

      const job = await apiFetch('/stream/transcode', {
        method: 'POST',
        body: JSON.stringify({ url: item.url || item.embed_url }),
      });

      setTranscodeJob(job);
      showMessage('✅ Transcoding pornit');

      const timer = window.setInterval(async () => {
        try {
          const updated = await apiFetch(`/stream/jobs/${job.id}`);
          setTranscodeJob(updated);

          if (updated.status === 'completed' || updated.status === 'failed') {
            window.clearInterval(timer);
          }
        } catch {
          window.clearInterval(timer);
        }
      }, 3000);
    } catch {
      setTranscodeJob({
        status: 'failed',
        progress: 0,
        error: 'Nu s-a putut porni transcoding',
      });
      showMessage('❌ Transcoding eșuat');
    }
  }

  if (loading) {
    return <main className="min-h-screen bg-black p-10 text-white">Se încarcă...</main>;
  }

  if (!item) {
    return <main className="min-h-screen bg-black p-10 text-white">Nu am găsit sursa.</main>;
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
          <ArrowLeft size={18} /> Back
        </Link>

        <section className="mx-auto max-w-6xl">
          {sources.length > 1 && (
            <div className="mb-4 flex flex-wrap gap-2 rounded-[2rem] border border-white/10 bg-white/[0.04] p-4">
              {sources.map((src) => (
                <button
                  key={src.id}
                  onClick={() => setItem(src)}
                  className={`rounded-2xl px-4 py-3 text-sm font-black uppercase transition ${
                    String(src.id) === String(item.id)
                      ? 'bg-[#6A4CFF] text-white'
                      : 'bg-white/10 text-white/60 hover:bg-white/20'
                  }`}
                >
                  {providerOf(src)} · {typeOf(src)}
                </button>
              ))}
            </div>
          )}

          <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-2xl shadow-[#6A4CFF]/20">
            <UniversalPlayer
              key={item.id}
              source={{
                ...item,
                sourceId: String(item.id),
                contentId: String(item.content_id || ''),
                provider: providerOf(item),
                type: typeOf(item),
                poster: posterOf(item),
              }}
              title={item.title}
            />
          </div>

          <section className="mt-8 rounded-[2rem] border border-white/10 bg-white/5 p-6">
            <div className="mb-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-[#6A4CFF]/30 px-4 py-2 text-xs font-black uppercase text-[#B8A7FF]">
                {providerOf(item)}
              </span>
              <span className="rounded-full bg-white/10 px-4 py-2 text-xs font-black uppercase text-white/60">
                {item.content_type || item.metadata?.category || 'content'}
              </span>
            </div>

            <h1 className="text-4xl font-black">{item.title}</h1>

            {item.description && (
              <p className="mt-4 max-w-4xl text-white/60">{item.description}</p>
            )}

            <div className="mt-6 grid gap-3 text-sm text-white/70 md:grid-cols-2">
              <div className="rounded-2xl bg-black/30 p-4">
                <b>Provider:</b> {providerOf(item)}
              </div>
              <div className="rounded-2xl bg-black/30 p-4">
                <b>Type:</b> {typeOf(item)}
              </div>
              <div className="rounded-2xl bg-black/30 p-4">
                <b>Content ID:</b> {item.content_id || 'N/A'}
              </div>
              <div className="rounded-2xl bg-black/30 p-4">
                <b>Content Key:</b> {item.content_key || item.metadata?.contentKey || 'N/A'}
              </div>
            </div>

            <p className="mt-4 break-all text-xs text-white/40">{item.url || item.embed_url}</p>

            <div className="mt-8 flex flex-wrap gap-3">
              <button onClick={addToLibrary} className="flex items-center gap-2 rounded-2xl bg-[#6A4CFF] px-6 py-4 font-bold">
                <Library size={18} /> Library
              </button>

              <button onClick={addFavorite} className="flex items-center gap-2 rounded-2xl bg-white/10 px-6 py-4 font-bold">
                <Star size={18} /> Favorite
              </button>

              <Link href="/sources" className="flex items-center gap-2 rounded-2xl bg-white/10 px-6 py-4 font-bold">
                <Database size={18} /> Sources
              </Link>

              <Link href={`/search?q=${encodeURIComponent(item.title || '')}`} className="flex items-center gap-2 rounded-2xl bg-white/10 px-6 py-4 font-bold">
                <Search size={18} /> Search similar
              </Link>
            </div>
          </section>

          {related.length > 0 && (
            <section className="mt-10">
              <h2 className="mb-5 text-3xl font-black">Related Sources</h2>

              <div className="grid gap-5 md:grid-cols-4">
                {related.map((rel: any) => (
                  <Link
                    key={rel.id}
                    href={`/watch/${watchId(rel)}`}
                    className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 transition hover:border-[#6A4CFF]"
                  >
                    <div className="aspect-[16/10] bg-white/5">
                      {posterOf(rel) ? (
                        <img src={posterOf(rel)} alt={rel.title} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-white/30">
                          <Hash size={36} />
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <div className="mb-2 text-xs font-black uppercase text-[#B8A7FF]">{providerOf(rel)}</div>
                      <h3 className="line-clamp-2 font-black">{rel.title}</h3>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </section>
      </main>
    </>
  );
}
