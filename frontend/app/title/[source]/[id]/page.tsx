'use client';

import { use } from 'react';
import { Play, Star, Clapperboard, Plus, Info } from 'lucide-react';

export default function TitlePage({
  params,
}: {
  params: Promise<{ source: string; id: string }>;
}) {
  const { source, id } = use(params);

  const title = `StreamVerse Title #${decodeURIComponent(id)}`;
  const hero = `https://picsum.photos/1600/900?random=${encodeURIComponent(id)}`;
  const poster = `https://picsum.photos/500/750?random=${encodeURIComponent(id)}poster`;

  function addToLibrary() {
    const saved = JSON.parse(localStorage.getItem('streamverse_library') || '[]');
    localStorage.setItem(
      'streamverse_library',
      JSON.stringify([...saved, { id, source, title, subtitle: 'Premium metadata page', image: poster }])
    );
    alert('Adăugat în Library');
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="relative min-h-[520px] overflow-hidden">
        <img src={hero} alt={title} className="absolute inset-0 h-full w-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/20" />

        <div className="relative z-10 grid min-h-[520px] items-end gap-8 p-6 md:grid-cols-[260px_1fr] md:p-10">
          <div className="hidden md:block">
            <img src={poster} alt={title} className="rounded-3xl border border-white/10 shadow-2xl" />
          </div>

          <div className="pb-8">
            <div className="mb-4 inline-flex rounded-full bg-[#6A4CFF] px-4 py-2 text-sm font-black">
              {source.toUpperCase()}
            </div>

            <h1 className="max-w-4xl text-4xl font-black leading-tight md:text-6xl">{title}</h1>

            <p className="mt-5 max-w-3xl text-base leading-7 text-white/70 md:text-lg">
              Pagină premium cinematică pentru metadata, trailere, episoade, surse video, subtitrări, playlisturi și recomandări AI.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => {
                  const saved = JSON.parse(localStorage.getItem('streamverse_continue') || '[]');
                  const item = {
                    id,
                    source,
                    title,
                    image: poster,
                    href: `/title/${source}/${encodeURIComponent(id)}`,
                    progress: Math.floor(Math.random() * 60) + 10,
                  };
                  localStorage.setItem('streamverse_continue', JSON.stringify([item, ...saved.filter((x: any) => x.id !== id)]));
                  alert('Adăugat în Continue Watching');
                }}
                className="flex items-center gap-2 rounded-2xl bg-white px-6 py-4 font-black text-black"
              >
                <Play size={20} /> Play
              </button>

              <button onClick={addToLibrary} className="flex items-center gap-2 rounded-2xl bg-[#6A4CFF] px-6 py-4 font-bold">
                <Plus size={18} /> Library
              </button>

              <button
                onClick={() => {
                  const saved = JSON.parse(localStorage.getItem('streamverse_watchlist') || '[]');
                  const item = {
                    id,
                    source,
                    title,
                    image: poster,
                    href: `/title/${source}/${encodeURIComponent(id)}`,
                  };
                  localStorage.setItem('streamverse_watchlist', JSON.stringify([item, ...saved.filter((x: any) => x.id !== id)]));
                  alert('Adăugat în Watchlist');
                }}
                className="flex items-center gap-2 rounded-2xl bg-white/10 px-6 py-4 font-bold backdrop-blur"
              >
                <Star size={18} /> Favorite
              </button>

              <button className="flex items-center gap-2 rounded-2xl bg-white/10 px-6 py-4 font-bold backdrop-blur">
                <Clapperboard size={18} /> Trailer
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-8 p-6 md:p-10 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-8">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 md:p-6">
            <h2 className="mb-4 text-3xl font-black">Player Universal</h2>
            <div className="aspect-video overflow-hidden rounded-2xl bg-black">
              <iframe
                className="h-full w-full"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                title="StreamVerse Player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 md:p-6">
            <h2 className="mb-6 text-3xl font-black">Episoade / Surse</h2>
            <div className="grid gap-3">
              {['Sursa principală', 'Mirror 2', 'Mirror 3'].map((name, index) => (
                <button key={name} className="flex items-center justify-between rounded-2xl bg-white/10 px-5 py-4 text-left hover:bg-white/15">
                  <span className="font-bold">{name}</span>
                  <span className="text-sm text-white/50">{index === 0 ? 'iframe / HLS / MP4' : 'fallback'}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h3 className="mb-4 flex items-center gap-2 text-2xl font-black">
              <Info size={20} /> Metadata
            </h3>
            <div className="space-y-3 text-white/70">
              <div>Source: {source}</div>
              <div>ID: {decodeURIComponent(id)}</div>
              <div>Genre: Action / Drama</div>
              <div>Year: 2025</div>
              <div>Rating: 9.1</div>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
