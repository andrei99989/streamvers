'use client';
import { API } from '../../lib/api';


import { useState } from 'react';
import UniversalPlayer from '../../components/UniversalPlayer';
import { Upload, Save, Play } from 'lucide-react';



function detectSource(url: string) {
  const clean = url.toLowerCase();

  if (
    clean.includes('youtube.com') ||
    clean.includes('youtu.be') ||
    clean.includes('vimeo.com') ||
    clean.includes('dailymotion.com') ||
    clean.includes('rumble.com') ||
    clean.includes('tiktok.com') ||
    clean.includes('terabox.com')
  ) return 'iframe';

  if (clean.endsWith('.m3u8')) return 'hls';
  if (clean.endsWith('.mp4')) return 'mp4';
  if (clean.endsWith('.webm')) return 'webm';

  return 'external';
}

export default function UploadPage() {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [active, setActive] = useState('');
  const [message, setMessage] = useState('');
  const type = url ? detectSource(url) : 'unknown';

  async function saveSource() {
    if (!url.trim()) {
      setMessage('Adaugă un URL');
      return;
    }

    try {
      const res = await fetch(`${API}/db/sources`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title || 'Sursă fără titlu',
          url,
          sourceType: type,
          isPrimary: true,
          quality: 'auto',
          language: 'ro'
        })
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || 'Eroare salvare Neon');
      }
      setMessage('Sursa a fost salvată în Neon');
    } catch (error: any) {
      setMessage(error.message || 'Eroare la salvare');
    }
  }

  return (
    <main className="min-h-screen bg-black p-6 text-white md:p-10">
      <div className="mb-8">
        <div className="mb-3 inline-flex rounded-full bg-[#00E0A8]/20 px-4 py-2 text-sm font-black text-[#00E0A8]">
          UNIVERSAL SOURCE UPLOAD
        </div>

        <h1 className="flex items-center gap-3 text-5xl font-black">
          <Upload />
          Upload prin URL
        </h1>

        <p className="mt-3 max-w-3xl text-white/50">
          Detectare automată iframe, MP4, WebM și HLS .m3u8.
        </p>
      </div>

      <div className="grid gap-4 rounded-3xl border border-white/10 bg-white/[0.06] p-5">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Titlu sursă..."
          className="rounded-2xl bg-black/40 px-5 py-4 outline-none"
        />

        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Lipește URL video..."
          className="rounded-2xl bg-black/40 px-5 py-4 outline-none"
        />

        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-white/10 px-4 py-2 text-sm">
            Tip detectat: <b>{type}</b>
          </span>

          <button onClick={() => setActive(url)} className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 font-black text-black">
            <Play size={18} />
            Testează
          </button>

          <button onClick={saveSource} className="inline-flex items-center gap-2 rounded-2xl bg-[#6A4CFF] px-5 py-3 font-black">
            <Save size={18} />
            Salvează
          </button>
        </div>
      </div>

      {active && (
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
              provider: 'upload-preview',
              title: 'Upload Preview',
            }}
            title="Upload Preview"
          />
        </div>
      )}
    </main>
  );
}
