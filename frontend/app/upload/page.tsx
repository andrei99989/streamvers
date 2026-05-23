'use client';

import { API } from '../../lib/api';
import { useState } from 'react';
import UniversalPlayer from '../../components/UniversalPlayer';
import { Upload, Save, Play, AlertTriangle } from 'lucide-react';

function detectProvider(url: string) {
  const clean = url.toLowerCase();
  if (clean.includes('youtube.com') || clean.includes('youtu.be')) return 'youtube';
  if (clean.includes('vimeo.com')) return 'vimeo';
  if (clean.includes('dailymotion.com') || clean.includes('dai.ly')) return 'dailymotion';
  if (clean.includes('rumble.com')) return 'rumble';
  if (clean.includes('tiktok.com')) return 'tiktok';
  if (clean.includes('terabox.com')) return 'terabox';
  if (clean.endsWith('.m3u8')) return 'hls';
  if (clean.endsWith('.mp4')) return 'mp4';
  if (clean.endsWith('.webm')) return 'webm';
  return 'unknown';
}

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
  const [category, setCategory] = useState('custom');
  const [year, setYear] = useState('');
  const [active, setActive] = useState('');
  const [message, setMessage] = useState('');
  const [duplicate, setDuplicate] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const type = url ? detectSource(url) : 'unknown';
  const provider = url ? detectProvider(url) : 'unknown';

  async function saveSource() {
    if (!url.trim()) return setMessage('Adaugă un URL');
    if (!title.trim()) return setMessage('Adaugă un titlu');

    setLoading(true);
    setDuplicate(null);
    setMessage('⏳ Verific duplicate...');

    try {
      const res = await fetch(`${API}/sources`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          url: url.trim(),
          embedUrl: url.trim(),
          provider,
          type,
          category,
          year: year.trim(),
          quality: 'auto',
          language: 'ro',
        }),
      });

      const json = await res.json();

      if (!res.ok || json.error === 'DUPLICATE_CONTENT') {
        setDuplicate(json.duplicate || null);
        setMessage(json.message || 'Duplicat detectat');
        return;
      }

      setMessage('✅ Sursa a fost salvată');
      setTitle('');
      setUrl('');
      setYear('');
      setActive('');
    } catch (error: any) {
      setMessage(error.message || 'Eroare la salvare');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black p-6 text-white md:p-10">
      <div className="mb-8">
        <div className="mb-3 inline-flex rounded-full bg-[#00E0A8]/20 px-4 py-2 text-sm font-black text-[#00E0A8]">
          DUPLICATE-SAFE UPLOAD
        </div>

        <h1 className="flex items-center gap-3 text-5xl font-black">
          <Upload /> Upload prin URL
        </h1>

        <p className="mt-3 max-w-3xl text-white/50">
          Salvează surse cu detectare automată provider, tip și protecție împotriva duplicatelor.
        </p>
      </div>

      <div className="grid gap-4 rounded-3xl border border-white/10 bg-white/[0.06] p-5">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titlu: Avatar" className="rounded-2xl bg-black/40 px-5 py-4 outline-none" />

        <input value={year} onChange={(e) => setYear(e.target.value)} placeholder="An: 2009" className="rounded-2xl bg-black/40 px-5 py-4 outline-none" />

        <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-2xl bg-black/40 px-5 py-4 outline-none">
          <option value="custom">custom</option>
          <option value="movie">movie</option>
          <option value="series">series</option>
          <option value="anime">anime</option>
          <option value="music">music</option>
          <option value="sports">sports</option>
          <option value="tv">tv</option>
        </select>

        <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Lipește URL video..." className="rounded-2xl bg-black/40 px-5 py-4 outline-none" />

        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-white/10 px-4 py-2 text-sm">Provider: <b>{provider}</b></span>
          <span className="rounded-full bg-white/10 px-4 py-2 text-sm">Tip: <b>{type}</b></span>

          <button onClick={() => setActive(url)} className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 font-black text-black">
            <Play size={18} /> Testează
          </button>

          <button disabled={loading} onClick={saveSource} className="inline-flex items-center gap-2 rounded-2xl bg-[#6A4CFF] px-5 py-3 font-black disabled:opacity-50">
            <Save size={18} /> {loading ? 'Se salvează...' : 'Salvează'}
          </button>
        </div>
      </div>

      {message && <div className="mt-5 rounded-2xl bg-white/10 p-4 font-bold">{message}</div>}

      {duplicate && (
        <div className="mt-5 rounded-3xl border border-red-500/30 bg-red-500/10 p-5">
          <div className="mb-2 flex items-center gap-2 font-black text-red-300">
            <AlertTriangle /> Duplicat existent
          </div>
          <div className="text-white/70">{duplicate.title}</div>
          <div className="break-all text-sm text-white/40">{duplicate.url}</div>
        </div>
      )}

      {active && (
        <div className="mt-8 aspect-video overflow-hidden rounded-3xl border border-white/10 bg-black">
          <UniversalPlayer source={{ url: active, type, provider, title: 'Upload Preview' }} title="Upload Preview" />
        </div>
      )}
    </main>
  );
}
