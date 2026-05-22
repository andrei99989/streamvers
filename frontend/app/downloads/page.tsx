'use client';

import { apiDelete, apiFetch, apiPost } from '../../lib/apiClient';
import { useEffect, useState } from 'react';
import { Download, Plus, Trash2 } from 'lucide-react';

export default function DownloadsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');

  async function loadItems() {
    const data = await apiFetch('/downloads');
    setItems(data.items || []);
  }

  async function addItem() {
    if (!title.trim() && !url.trim()) return;

    await apiPost('/downloads', {
      title: title || 'Download',
      url,
    });

    setTitle('');
    setUrl('');
    loadItems();
  }

  async function removeItem(id: string) {
    await apiDelete(`/downloads/${id}`);
    setItems((prev) => prev.filter((x) => String(x.id) !== String(id)));
  }

  useEffect(() => {
    loadItems();
  }, []);

  return (
    <main className="min-h-screen bg-black p-6 pb-56 text-white md:p-10 md:pb-20">
      <section className="glass mb-8 rounded-[2.5rem] p-8">
        <h1 className="flex items-center gap-3 text-5xl font-black">
          <Download />
          Downloads
        </h1>

        <div className="mt-6 grid gap-3 md:grid-cols-[1fr_2fr_auto]">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titlu"
            className="rounded-2xl border border-white/10 bg-black/40 px-5 py-4 outline-none"
          />

          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="URL"
            className="rounded-2xl border border-white/10 bg-black/40 px-5 py-4 outline-none"
          />

          <button onClick={addItem} className="inline-flex items-center gap-2 rounded-2xl bg-[#6A4CFF] px-5 py-4 font-black">
            <Plus size={18} />
            Add
          </button>
        </div>
      </section>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <div key={item.id} className="glass rounded-[2rem] p-5">
            <div className="mb-3 w-fit rounded-full bg-white/10 px-3 py-1 text-xs font-black uppercase">
              {item.status || 'saved'}
            </div>

            <h2 className="text-2xl font-black">{item.title}</h2>
            <p className="mt-2 break-all text-sm text-white/40">{item.url}</p>

            <button
              onClick={() => removeItem(item.id)}
              className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-red-500 px-4 py-3 font-black"
            >
              <Trash2 size={16} />
              Delete
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
