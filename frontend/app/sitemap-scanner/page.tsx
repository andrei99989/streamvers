'use client';

import { useState } from 'react';
import { Search, Globe2, ExternalLink } from 'lucide-react';

const API = 'http://127.0.0.1:4000';

export default function SitemapScannerPage() {
  const [url, setUrl] = useState('https://www.imdb.com/sitemap.xml');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function scan() {
    if (!url.trim()) return;

    setLoading(true);

    try {
      const res = await fetch(`${API}/sitemap/scan?url=${encodeURIComponent(url)}`);
      const json = await res.json();
      setData(json);
    } catch {
      setData({ error: 'Nu pot scana sitemap-ul' });
    }

    setLoading(false);
  }

  const items = data?.urls?.length ? data.urls : data?.sitemaps || [];

  return (
    <main className="min-h-screen bg-black p-6 text-white md:p-10">
      <section className="mb-8 rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#6A4CFF]/35 to-[#00E0A8]/15 p-8">
        <div className="mb-3 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-black">
          SITEMAP DISCOVERY ENGINE
        </div>

        <h1 className="flex items-center gap-3 text-5xl font-black">
          <Globe2 />
          Sitemap Scanner
        </h1>

        <p className="mt-4 max-w-3xl text-white/60">
          Scanează sitemap-uri XML pentru descoperire de linkuri, pagini și metadata.
        </p>
      </section>

      <div className="mb-8 flex gap-3 rounded-3xl border border-white/10 bg-white/[0.06] p-3">
        <Search className="mt-3 text-white/50" />
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && scan()}
          placeholder="https://site.com/sitemap.xml"
          className="w-full bg-transparent px-3 outline-none"
        />

        <button
          onClick={scan}
          className="rounded-2xl bg-[#6A4CFF] px-5 py-3 font-black"
        >
          {loading ? '...' : 'Scan'}
        </button>
      </div>

      {data?.error && (
        <div className="mb-6 rounded-3xl border border-red-500/30 bg-red-500/10 p-5 text-red-200">
          <div className="font-black">{data.error}</div>
          {data.details && <pre className="mt-3 max-h-48 overflow-auto text-xs">{data.details}</pre>}
        </div>
      )}

      {data && !data.error && (
        <section className="mb-6 rounded-3xl border border-white/10 bg-white/[0.06] p-5">
          <div className="text-sm text-white/50">Source</div>
          <div className="break-all font-bold">{data.source}</div>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <Box label="Type" value={data.type} />
            <Box label="Count" value={data.count} />
            <Box label="Showing" value={items.length} />
          </div>
        </section>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item: any, i: number) => (
          <a
            key={`${item.loc}-${i}`}
            href={item.loc}
            target="_blank"
            className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 transition hover:border-[#6A4CFF]"
          >
            <div className="mb-3 flex items-center gap-2 text-[#00E0A8]">
              <ExternalLink size={16} />
              Link
            </div>

            <div className="break-all text-sm font-bold">{item.loc}</div>
            {item.lastmod && <div className="mt-3 text-xs text-white/40">{item.lastmod}</div>}
          </a>
        ))}
      </div>
    </main>
  );
}

function Box({ label, value }: any) {
  return (
    <div className="rounded-2xl bg-black/40 p-4">
      <div className="text-xs text-white/40">{label}</div>
      <div className="mt-1 text-xl font-black">{value || 'N/A'}</div>
    </div>
  );
}
