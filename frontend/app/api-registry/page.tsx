'use client';

import { useEffect, useMemo, useState } from 'react';
import { Activity, CheckCircle2, KeyRound, Wrench, XCircle } from 'lucide-react';

const API = 'http://127.0.0.1:4000';

export default function ApiRegistryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetch(`${API}/registry`)
      .then((r) => r.json())
      .then(setItems)
      .catch(() => setItems([]));
  }, []);

  const filtered = useMemo(() => {
    if (filter === 'all') return items;
    return items.filter((x) => x.status === filter);
  }, [items, filter]);

  const stats = {
    active: items.filter((x) => x.status === 'active').length,
    missing: items.filter((x) => x.status === 'missing-key').length,
    todo: items.filter((x) => x.status === 'not-implemented').length,
    broken: items.filter((x) => x.status === 'broken' || status === 'blocked' || x.status === 'blocked').length,
  };

  return (
    <main className="min-h-screen bg-black p-6 text-white md:p-10">
      <div className="mb-8">
        <div className="mb-3 inline-flex rounded-full bg-[#00E0A8]/20 px-4 py-2 text-sm font-black text-[#00E0A8]">
          API CONTROL CENTER
        </div>

        <h1 className="flex items-center gap-3 text-5xl font-black">
          <Activity />
          API Registry
        </h1>

        <p className="mt-3 max-w-3xl text-white/50">
          Status pentru toate API-urile: active, lipsă cheie, neimplementate sau stricate.
        </p>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-4">
        <Stat title="Active" value={stats.active} icon={<CheckCircle2 />} />
        <Stat title="Missing Key" value={stats.missing} icon={<KeyRound />} />
        <Stat title="To Implement" value={stats.todo} icon={<Wrench />} />
        <Stat title="Broken" value={stats.broken} icon={<XCircle />} />
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {['all', 'active', 'missing-key', 'not-implemented', 'broken', 'blocked'].map((x) => (
          <button
            key={x}
            onClick={() => setFilter(x)}
            className={`rounded-full px-4 py-2 text-sm font-black ${
              filter === x ? 'bg-[#6A4CFF]' : 'bg-white/10 text-white/60'
            }`}
          >
            {x}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((api) => (
          <div key={api.name} className="rounded-3xl border border-white/10 bg-white/[0.06] p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-black">{api.name}</h2>
                <p className="mt-1 text-sm text-white/50">{api.type}</p>
              </div>

              <Badge status={api.status} />
            </div>

            <div className="mt-5 space-y-2 text-sm text-white/60">
              <div>Key: {api.key || 'Nu necesită'}</div>
              <div>Configured: {api.configured ? 'DA' : 'NU'}</div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

function Stat({ title, value, icon }: any) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-5">
      <div className="text-[#00E0A8]">{icon}</div>
      <div className="mt-4 text-sm text-white/50">{title}</div>
      <div className="text-4xl font-black">{value}</div>
    </div>
  );
}

function Badge({ status }: any) {
  const cls =
    status === 'active'
      ? 'bg-[#00E0A8] text-black'
      : status === 'missing-key'
      ? 'bg-yellow-400 text-black'
      : status === 'broken' || status === 'blocked'
      ? 'bg-red-500 text-white'
      : 'bg-white/10 text-white/60';

  return <span className={`rounded-full px-3 py-1 text-xs font-black ${cls}`}>{status}</span>;
}
