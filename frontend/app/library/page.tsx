'use client';

import { apiDelete, apiFetch } from '../../lib/apiClient';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Library, Play, Trash2, Search } from 'lucide-react';

function providerOf(item: any) {
  return item.provider || item.source_type || item.type || 'source';
}

function posterOf(item: any) {
  return item.poster || item.thumbnail || item.metadata?.thumbnail || '';
}

function watchId(item: any) {
  return item.source_id || item.id;
}

function uniqueItems(items: any[]) {
  const seen = new Set<string>();

  return items.filter((item) => {
    const key = String(
      item.content_key ||
      item.metadata?.content_key ||
      item.metadata?.contentKey ||
      item.source_id ||
      item.id ||
      `${item.title}|${item.url}`
    ).toLowerCase();

    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export default function LibraryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [provider, setProvider] = useState('');

  async function loadItems() {
    const data = await apiFetch('/library');
    setItems(data.items || []);
  }

  async function removeItem(id: string) {
    await apiDelete(`/library/${id}`);
    setItems((prev) => prev.filter((x) => String(x.id) !== String(id)));
  }

  useEffect(() => {
    loadItems();
  }, []);

  const providers = useMemo(() => {
    return ['', ...Array.from(new Set(items.map(providerOf).filter(Boolean)))];
  }, [items]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();

    return uniqueItems(items).filter((item) => {
      const matchesSearch =
        !q ||
        [item.title, item.url, item.content_type, providerOf(item)]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(q);

      const matchesProvider = !provider || providerOf(item) === provider;

      return matchesSearch && matchesProvider;
    });
  }, [items, search, provider]);

  return (
    <main className="min-h-screen bg-black p-6 pb-56 text-white md:p-10 md:pb-20">
      <section className="glass mb-8 rounded-[2.5rem] p-8">
        <h1 className="flex items-center gap-3 text-5xl font-black">
          <Library /> Library
        </h1>

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Caută în Library..."
              className="w-full rounded-2xl border border-white/10 bg-black/40 py-4 pl-12 pr-4 outline-none"
            />
          </div>

          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className="rounded-2xl border border-white/10 bg-black/40 px-4 py-4 outline-none"
          >
            {providers.map((x) => (
              <option key={x} value={x}>
                {x || 'All providers'}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4 text-sm font-bold text-white/40">
          {visible.length} / {items.length} items
        </div>
      </section>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {visible.map((item) => (
          <div key={item.id} className="glass overflow-hidden rounded-[2rem] border border-white/10">
            {posterOf(item) ? (
              <img src={posterOf(item)} alt={item.title} className="h-56 w-full object-cover" />
            ) : (
              <div className="flex h-56 items-center justify-center bg-white/5">
                <Play size={48} className="text-white/40" />
              </div>
            )}

            <div className="p-5">
              <div className="mb-3 w-fit rounded-full bg-[#6A4CFF]/20 px-3 py-1 text-xs font-black uppercase text-[#B8A7FF]">
                {providerOf(item)}
              </div>

              <h2 className="line-clamp-2 text-2xl font-black">{item.title}</h2>
              <p className="mt-2 line-clamp-1 break-all text-xs text-white/40">{item.url}</p>

              <div className="mt-5 flex gap-3">
                <Link href={`/watch/${watchId(item)}`} className="rounded-2xl bg-[#6A4CFF] px-4 py-3 font-black">
                  Play
                </Link>

                <button onClick={() => removeItem(item.id)} className="inline-flex items-center gap-2 rounded-2xl bg-red-500 px-4 py-3 font-black">
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
