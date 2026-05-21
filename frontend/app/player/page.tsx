'use client';

import { useState } from 'react';
import UniversalPlayer from '../../components/UniversalPlayer';

export default function PlayerPage() {
  const [url, setUrl] = useState('');
  const [active, setActive] = useState(url);

  return (
    <main className="min-h-screen bg-black p-6 text-white md:p-10">
      <h1 className="text-5xl font-black">Universal Player</h1>
      <p className="mt-3 text-white/50">
        Suport iframe, YouTube, MP4, WebM și HLS .m3u8.
      </p>

      <div className="mt-6 flex gap-3">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full rounded-2xl bg-white/10 px-5 py-4 outline-none"
          placeholder="Lipește URL video..."
        />

        <button
          onClick={() => setActive(url)}
          className="rounded-2xl bg-[#6A4CFF] px-6 font-black"
        >
          Play
        </button>
      </div>

      <div className="mt-8 aspect-video overflow-hidden rounded-3xl border border-white/10 bg-black">
        <UniversalPlayer
          source={{
            url: active,
            type: active.endsWith('.mp4')
              ? 'mp4'
              : active.endsWith('.webm')
                ? 'webm'
                : active.endsWith('.m3u8')
                  ? 'hls'
                  : 'iframe',
            provider: 'manual',
            title: 'Manual Player',
          }}
          title="Manual Player"
        />
      </div>
    </main>
  );
}
