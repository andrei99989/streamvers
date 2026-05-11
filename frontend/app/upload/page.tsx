'use client';

'use client';

import { useState } from 'react';
import UniversalPlayer from '../../components/player/UniversalPlayer';
import { Upload, Save, Play } from 'lucide-react';

const API = 'http://127.0.0.1:4000';

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

  return 'iframe';
}

export default function UploadPage() {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [active, setActive] = useState('');
  const type = url ? detectSource(url) : 'unknown';

  async function saveSource() {
    if (!url.trim()) return alert('Adaugă un URL');

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

      const saved = JSON.parse(localStorage.getItem('streamverse_sources') || '[]');
      const localItem = {
        id: json.id,
        contentId: json.content_id,
        title: title || 'Sursă fără titlu',
        url,
        type,
        createdAt: json.created_at
      };

      localStorage.setItem('streamverse_sources', JSON.stringify([localItem, ...saved]));
      alert('Sursa a fost salvată în Neon + localStorage');
    } catch (error: any) {
      alert(error.message);
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
          <UniversalPlayer url={active} />
        </div>
      )}
    </main>
  );
}
