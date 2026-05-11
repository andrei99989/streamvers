'use client';

import { useEffect, useState } from 'react';
import { Activity, Database, Film, Puzzle, Server, Trash2 } from 'lucide-react';

const API = 'http://127.0.0.1:4000';

export default function AdminPage() {
  const [health, setHealth] = useState<any>(null);
  const [stats, setStats] = useState({
    library: 0,
    watchlist: 0,
    continueWatching: 0,
    addons: 0
  });

  useEffect(() => {
    fetch(`${API}/health`)
      .then((r) => r.json())
      .then(setHealth)
      .catch(() => setHealth({ ok: false }));

    setStats({
      library: JSON.parse(localStorage.getItem('streamverse_library') || '[]').length,
      watchlist: JSON.parse(localStorage.getItem('streamverse_watchlist') || '[]').length,
      continueWatching: JSON.parse(localStorage.getItem('streamverse_continue') || '[]').length,
      addons: JSON.parse(localStorage.getItem('streamverse_addons') || '[]').length
    });
  }, []);

  function clearAll() {
    localStorage.removeItem('streamverse_library');
    localStorage.removeItem('streamverse_watchlist');
    localStorage.removeItem('streamverse_continue');
    alert('Datele locale au fost șterse');
    location.reload();
  }

  return (
    <main className="min-h-screen bg-black p-6 text-white md:p-10">
      <h1 className="text-5xl font-black">Admin Dashboard</h1>
      <p className="mt-3 text-white/50">
        Status platformă, API, addons și date locale.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-4">
        <Card icon={<Server />} title="API" value={health?.ok ? 'Online' : 'Offline'} />
        <Card icon={<Database />} title="Library" value={stats.library} />
        <Card icon={<Film />} title="Watchlist" value={stats.watchlist} />
        <Card icon={<Puzzle />} title="Addons" value={stats.addons} />
      </div>

      <section className="mt-8 rounded-3xl border border-white/10 bg-white/[0.06] p-6">
        <h2 className="mb-4 flex items-center gap-2 text-2xl font-black">
          <Activity />
          Health
        </h2>

        <pre className="overflow-x-auto rounded-2xl bg-black/60 p-4 text-sm text-[#00E0A8]">
{JSON.stringify(health, null, 2)}
        </pre>
      </section>

      <button
        onClick={clearAll}
        className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-red-500 px-6 py-4 font-black"
      >
        <Trash2 size={18} />
        Șterge date locale
      </button>
    
      <BackendStatus />
    </main>
  );
}

function Card({ icon, title, value }: any) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-5">
      <div className="mb-4 text-[#00E0A8]">{icon}</div>
      <div className="text-sm text-white/50">{title}</div>
      <div className="mt-1 text-3xl font-black">{String(value)}</div>
    </div>
  );
}


function BackendStatus() {
  const [status, setStatus] = useState<any>(null);

  async function check() {
    const result: any = {};

    try {
      result.health = await fetch(`${API}/health`).then((r) => r.json());
    } catch {
      result.health = { ok: false };
    }

    try {
      result.sources = await fetch(`${API}/db/sources`).then((r) => r.json());
    } catch {
      result.sources = [];
    }

    try {
      result.registry = await fetch(`${API}/registry`).then((r) => r.json());
    } catch {
      result.registry = [];
    }

    try {
      result.algolia = await fetch(`${API}/algolia/search?q=Iron%20Man`).then((r) => r.json());
    } catch {
      result.algolia = { ok: false };
    }

    setStatus(result);
  }

  return (
    <section className="mt-8 rounded-3xl border border-white/10 bg-white/[0.06] p-5">
      <h2 className="mb-4 text-2xl font-black">Backend Status</h2>

      <button
        onClick={check}
        className="rounded-2xl bg-[#6A4CFF] px-5 py-3 font-black"
      >
        Verifică backend
      </button>

      {status && (
        <div className="mt-5 grid gap-4 md:grid-cols-4">
          <Box title="API" value={status.health?.ok ? 'ONLINE' : 'OFFLINE'} />
          <Box title="Sources" value={status.sources?.length || 0} />
          <Box title="Registry" value={status.registry?.length || 0} />
          <Box title="Algolia" value={status.algolia?.ok ? `${status.algolia.hits?.length || 0} hits` : 'OFF'} />
        </div>
      )}
    </section>
  );
}

function Box({ title, value }: any) {
  return (
    <div className="rounded-2xl bg-black/40 p-4">
      <div className="text-xs text-white/40">{title}</div>
      <div className="mt-1 text-xl font-black">{value}</div>
    </div>
  );
}
