'use client';

import { useEffect, useState } from 'react';
import { Trophy, Search, Users } from 'lucide-react';

const API = 'http://127.0.0.1:4000';

export default function NBAHubPage() {
  const [teams, setTeams] = useState<any[]>([]);
  const [players, setPlayers] = useState<any[]>([]);
  const [q, setQ] = useState('lebron');

  async function searchPlayers(value = q) {
    const res = await fetch(`${API}/nba/players?q=${encodeURIComponent(value)}`);
    const json = await res.json();
    setPlayers(json.data || []);
  }

  useEffect(() => {
    fetch(`${API}/nba/teams`)
      .then((r) => r.json())
      .then((json) => setTeams(json.data || []));

    searchPlayers('lebron');
  }, []);

  return (
    <main className="min-h-screen bg-black p-6 text-white md:p-10">
      <section className="mb-8 rounded-[2rem] border border-white/10 bg-gradient-to-br from-orange-500/35 to-[#6A4CFF]/20 p-8">
        <div className="mb-3 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-black">
          BALLDONTLIE NBA ENGINE
        </div>

        <h1 className="flex items-center gap-3 text-5xl font-black">
          <Trophy />
          NBA Hub
        </h1>

        <p className="mt-4 max-w-3xl text-white/60">
          Echipe NBA, căutare jucători, informații despre poziție, draft și echipă.
        </p>
      </section>

      <div className="mb-8 flex gap-3 rounded-3xl border border-white/10 bg-white/[0.06] p-3">
        <Search className="mt-3 text-white/50" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && searchPlayers()}
          placeholder="Caută jucător NBA..."
          className="w-full bg-transparent px-3 outline-none"
        />

        <button
          onClick={() => searchPlayers()}
          className="rounded-2xl bg-[#6A4CFF] px-5 py-3 font-black"
        >
          Caută
        </button>
      </div>

      <section className="mb-10">
        <h2 className="mb-4 flex items-center gap-3 text-3xl font-black">
          <Users />
          Players
        </h2>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {players.map((p) => (
            <div key={p.id} className="rounded-3xl border border-white/10 bg-white/[0.06] p-5">
              <div className="text-2xl font-black">
                {p.first_name} {p.last_name}
              </div>
              <div className="mt-2 text-white/50">
                {p.position || 'N/A'} • {p.height || 'N/A'} • {p.weight || 'N/A'} lbs
              </div>
              <div className="mt-3 text-[#00E0A8]">
                {p.team?.full_name}
              </div>
              <div className="mt-2 text-sm text-white/50">
                Draft: {p.draft_year || 'N/A'} / Round {p.draft_round || 'N/A'} / Pick {p.draft_number || 'N/A'}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-3xl font-black">Teams</h2>

        <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-5">
          {teams.map((team) => (
            <div key={team.id} className="rounded-3xl border border-white/10 bg-white/[0.06] p-5">
              <div className="text-xl font-black">{team.full_name}</div>
              <div className="mt-2 text-white/50">{team.conference || 'N/A'} • {team.division || 'N/A'}</div>
              <div className="mt-3 rounded-full bg-white/10 px-3 py-1 text-xs font-black">
                {team.abbreviation}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
