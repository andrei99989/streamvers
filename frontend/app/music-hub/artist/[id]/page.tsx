'use client';

import { use, useEffect, useState } from 'react';
import { Music, Users, Play } from 'lucide-react';

const API = 'http://127.0.0.1:4000';

export default function DeezerArtistPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [artist, setArtist] = useState<any>(null);
  const [tracks, setTracks] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${API}/deezer/artist/${id}`)
      .then((r) => r.json())
      .then(setArtist)
      .catch(() => setArtist(null));

    fetch(`${API}/deezer/artist/${id}/top?limit=20`)
      .then((r) => r.json())
      .then((json) => setTracks(json.data || []))
      .catch(() => setTracks([]));
  }, [id]);

  return (
    <main className="min-h-screen bg-black p-6 text-white md:p-10">
      <section className="mb-8 overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.06]">
        <div className="relative h-[360px]">
          {artist?.picture_xl && (
            <img src={artist.picture_xl} alt={artist.name} className="h-full w-full object-cover opacity-40" />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />

          <div className="absolute bottom-8 left-8">
            <div className="mb-3 inline-flex rounded-full bg-[#6A4CFF] px-4 py-2 text-sm font-black">
              DEEZER ARTIST
            </div>

            <h1 className="flex items-center gap-3 text-5xl font-black md:text-7xl">
              <Music />
              {artist?.name || 'Artist'}
            </h1>

            <div className="mt-4 flex items-center gap-2 text-white/60">
              <Users size={18} />
              {artist?.nb_fan ? `${artist.nb_fan.toLocaleString()} fani` : 'Se încarcă...'}
            </div>
          </div>
        </div>
      </section>

      <h2 className="mb-5 text-3xl font-black">Top Tracks</h2>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {tracks.map((track) => (
          <div key={track.id} className="rounded-3xl border border-white/10 bg-white/[0.06] p-4">
            <div className="flex gap-4">
              <img src={track.album?.cover_medium} alt={track.title} className="h-24 w-24 rounded-2xl object-cover" />

              <div className="min-w-0 flex-1">
                <div className="line-clamp-1 font-black">{track.title}</div>
                <div className="line-clamp-1 text-sm text-white/50">{track.album?.title}</div>

                <a href={track.link} target="_blank" className="mt-3 inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-black text-black">
                  <Play size={15} />
                  Deezer
                </a>
              </div>
            </div>

            {track.preview && <audio controls src={track.preview} className="mt-4 w-full" />}
          </div>
        ))}
      </div>
    </main>
  );
}
