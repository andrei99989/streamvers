'use client';

import { use, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Download, ExternalLink, Puzzle, ShieldCheck, Star } from 'lucide-react';
import { apiFetch, apiPost } from '../../../lib/apiClient';

function slugify(value: string) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function AddonDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  const [addons, setAddons] = useState<any[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    apiFetch('/addons-marketplace')
      .then((data) => setAddons(data.items || []))
      .catch(() => setAddons([]));
  }, []);

  const addon = useMemo(
    () => addons.find((item) => slugify(item.name) === slug),
    [addons, slug]
  );

  function showMessage(text: string) {
    setMessage(text);
    setTimeout(() => setMessage(''), 2500);
  }

  async function install() {
    if (!addon?.manifestUrl) {
      showMessage('⚠️ Addon încă nu are manifest URL configurat');
      return;
    }

    try {
      await apiPost('/addons/install', { manifestUrl: addon.manifestUrl });
      showMessage(`✅ ${addon.name} instalat`);
    } catch (error: any) {
      showMessage(`❌ Install failed: ${error?.message || 'unknown'}`);
    }
  }

  if (!addon) {
    return (
      <main className="min-h-screen bg-black p-6 text-white md:p-10">
        <Link href="/addons-marketplace" className="inline-flex items-center gap-2 text-white/60">
          <ArrowLeft size={18} />
          Back to Marketplace
        </Link>

        <div className="mt-10 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
          <h1 className="text-3xl font-black">Addon not found</h1>
          <p className="mt-2 text-white/60">Marketplace data is loading or this addon does not exist.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-black p-4 pb-56 text-white md:p-10">
      {message && (
        <div className="fixed left-1/2 top-6 z-[9999] max-w-[90vw] -translate-x-1/2 rounded-2xl border border-white/10 bg-black/90 px-6 py-4 font-black shadow-2xl">
          {message}
        </div>
      )}

      <Link href="/addons-marketplace" className="mb-8 inline-flex items-center gap-2 text-white/60">
        <ArrowLeft size={18} />
        Back to Marketplace
      </Link>

      <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-3xl bg-[#6A4CFF]/20 p-4">
                <Puzzle className="text-[#B8A7FF]" size={34} />
              </div>

              <div>
                <h1 className="text-4xl font-black md:text-5xl">{addon.name}</h1>
                <p className="mt-1 text-white/50">{addon.category} • {addon.version}</p>
              </div>
            </div>

            <p className="max-w-3xl text-lg text-white/70">{addon.description}</p>

            <div className="mt-6 flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-[#00E0A8]/15 px-4 py-2 text-sm font-black text-[#00E0A8]">
                {addon.status === 'Ready' ? <ShieldCheck size={16} /> : <Star size={16} />}
                {addon.status}
              </span>

              {addon.featured && (
                <span className="inline-flex items-center gap-2 rounded-full bg-yellow-400/15 px-4 py-2 text-sm font-black text-yellow-300">
                  <Star size={16} />
                  Featured
                </span>
              )}
            </div>
          </div>

          <button
            onClick={install}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#00E0A8] px-6 py-4 font-black text-black"
          >
            <Download size={18} />
            Install
          </button>
        </div>

        <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-black/30 p-5">
          <div className="mb-2 text-sm font-black uppercase text-white/40">Manifest URL</div>

          <div className="break-all text-sm text-white/60">
            {addon.manifestUrl || 'Manifest URL not configured yet'}
          </div>

          {addon.manifestUrl && (
            <a
              href={addon.manifestUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-3 text-sm font-black"
            >
              <ExternalLink size={16} />
              Open Manifest
            </a>
          )}
        </div>
      </section>
    </main>
  );
}
