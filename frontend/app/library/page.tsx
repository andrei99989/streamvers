'use client';

import { useEffect, useMemo, useState } from 'react';

const tabs = ['Catalog', 'Movies', 'Series', 'Channels'];
const sorts = [
  'By Last Watched',
  'By Name',
  'By Name Descending',
  'By Times Watched',
  'By Watched',
  'By Not Watched'
];

export default function LibraryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [tab, setTab] = useState('Catalog');
  const [sort, setSort] = useState('By Last Watched');

  useEffect(() => {
    setItems(JSON.parse(localStorage.getItem('streamverse_library') || '[]'));
  }, []);

  const filtered = useMemo(() => {
    let list = [...items];

    if (tab === 'Movies') list = list.filter((x) => String(x.subtitle || '').toLowerCase().includes('movie'));
    if (tab === 'Series') list = list.filter((x) => String(x.subtitle || '').toLowerCase().includes('series'));
    if (tab === 'Channels') list = list.filter((x) => String(x.source || '').toLowerCase().includes('youtube'));

    if (sort === 'By Name') list.sort((a, b) => String(a.title).localeCompare(String(b.title)));
    if (sort === 'By Name Descending') list.sort((a, b) => String(b.title).localeCompare(String(a.title)));
    if (sort === 'By Watched') list = list.filter((x) => x.watched);
    if (sort === 'By Not Watched') list = list.filter((x) => !x.watched);

    return list;
  }, [items, tab, sort]);

  function clearLibrary() {
    localStorage.removeItem('streamverse_library');
    setItems([]);
  }

  return (
    <section className="min-h-screen bg-black p-6 text-white md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-5xl font-black">Library</h1>
          <p className="mt-2 text-white/50">Catalogul tău StreamVerse</p>
        </div>

        <button onClick={clearLibrary} className="rounded-2xl bg-white/10 px-5 py-3 font-bold">
          Curăță Library
        </button>
      </div>

      <div className="mt-8 overflow-x-auto">
        <div className="flex gap-3">
          {tabs.map((x) => (
            <button
              key={x}
              onClick={() => setTab(x)}
              className={`rounded-full px-5 py-3 font-bold ${
                tab === x ? 'bg-[#6A4CFF]' : 'bg-white/10'
              }`}
            >
              {x}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 overflow-x-auto">
        <div className="flex gap-3">
          {sorts.map((x) => (
            <button
              key={x}
              onClick={() => setSort(x)}
              className={`rounded-full px-4 py-2 text-sm font-bold ${
                sort === x ? 'bg-[#00E0A8] text-black' : 'bg-white/10 text-white/70'
              }`}
            >
              {x}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-5 lg:grid-cols-6">
        {filtered.map((item, i) => (
          <div key={i} className="overflow-hidden rounded-3xl border border-white/10 bg-white/10">
            {item.image ? (
              <img src={item.image} alt={item.title} className="h-60 w-full object-cover" />
            ) : (
              <div className="flex h-60 items-center justify-center bg-white/5 text-4xl">🎬</div>
            )}

            <div className="p-4">
              <div className="line-clamp-2 font-bold">{item.title || 'Fără titlu'}</div>
              <div className="mt-1 text-xs text-white/50">{item.subtitle || item.source || 'Library item'}</div>

              <div className="mt-3 flex gap-2">
                <span className="rounded-full bg-black/30 px-3 py-1 text-xs">
                  {item.source || 'local'}
                </span>

                <button
                  onClick={() => {
                    const updated = items.map((x, idx) =>
                      idx === i ? { ...x, watched: !x.watched } : x
                    );
                    localStorage.setItem('streamverse_library', JSON.stringify(updated));
                    setItems(updated);
                  }}
                  className="rounded-full bg-[#6A4CFF] px-3 py-1 text-xs font-bold"
                >
                  {item.watched ? 'Watched' : 'Not Watched'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="mt-16 rounded-3xl border border-white/10 bg-white/5 p-8 text-center text-white/50">
          Nu ai elemente în acest catalog încă.
        </div>
      )}
    </section>
  );
}
