'use client';

import { useEffect, useState } from 'react';
import { Trophy, CalendarDays, Shield } from 'lucide-react';

const API = 'http://127.0.0.1:4000';

const competitions = [
  ['PL', 'Premier League'],
  ['CL', 'Champions League'],
  ['PD', 'La Liga'],
  ['SA', 'Serie A'],
  ['BL1', 'Bundesliga'],
  ['FL1', 'Ligue 1'],
];

export default function FootballHubPage() {
  const [competition, setCompetition] = useState('PL');
  const [standings, setStandings] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [openLigaTeams, setOpenLigaTeams] = useState<any[]>([]);

  async function load(code = competition) {
    setCompetition(code);

    fetch(`${API}/football/standings?competition=${code}`)
      .then((r) => r.json())
      .then((json) => {
        const table = json?.standings?.[0]?.table || [];
        setStandings(table);
      })
      .catch(() => setStandings([]));

    fetch(`${API}/football/matches?competition=${code}`)
      .then((r) => r.json())
      .then((json) => setMatches(json?.matches || []))
      .catch(() => setMatches([]));

    if (code === 'BL1') {
      fetch(`${API}/openligadb/teams?league=bl1&season=2025`)
        .then((r) => r.json())
        .then((json) => setOpenLigaTeams(Array.isArray(json) ? json : []))
        .catch(() => setOpenLigaTeams([]));
    } else {
      setOpenLigaTeams([]);
    }
  }

  useEffect(() => {
    load('PL');
  }, []);

  return (
    <main className="min-h-screen bg-black p-6 text-white md:p-10">
      <section className="mb-8 rounded-[2rem] border border-white/10 bg-gradient-to-br from-green-500/30 to-[#6A4CFF]/20 p-8">
        <div className="mb-3 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-black">
          FOOTBALL-DATA ENGINE
        </div>

        <h1 className="flex items-center gap-3 text-5xl font-black">
          <Trophy />
          Football Hub
        </h1>

        <p className="mt-4 max-w-3xl text-white/60">
          Clasamente, meciuri și ligi prin Football-Data API.
        </p>
      </section>

      <div className="mb-8 flex flex-wrap gap-2">
        {competitions.map(([code, name]) => (
          <button
            key={code}
            onClick={() => load(code)}
            className={`rounded-full px-4 py-2 font-black ${
              competition === code ? 'bg-[#6A4CFF]' : 'bg-white/10 text-white/60'
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      <section className="mb-10">
        <h2 className="mb-4 flex items-center gap-3 text-3xl font-black">
          <Shield />
          Standings
        </h2>

        <div className="overflow-hidden rounded-3xl border border-white/10">
          {standings.map((row) => (
            <div
              key={row.team?.id}
              className="grid grid-cols-[50px_1fr_70px_70px] items-center gap-3 border-b border-white/10 bg-white/[0.04] p-4 last:border-0"
            >
              <div className="font-black text-[#00E0A8]">#{row.position}</div>

              <div className="flex items-center gap-3">
                {row.team?.crest && (
                  <img src={row.team.crest} className="h-8 w-8 object-contain" />
                )}
                <div>
                  <div className="font-black">{row.team?.shortName || row.team?.name}</div>
                  <div className="text-xs text-white/40">
                    {row.won}W / {row.draw}D / {row.lost}L
                  </div>
                </div>
              </div>

              <div className="text-sm text-white/50">GD {row.goalDifference}</div>
              <div className="text-right text-xl font-black">{row.points}</div>
            </div>
          ))}
        </div>
      </section>


      {openLigaTeams.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 text-3xl font-black">OpenLigaDB Bundesliga Teams</h2>

          <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-5">
            {openLigaTeams.map((team) => (
              <div key={team.teamId} className="rounded-3xl border border-white/10 bg-white/[0.06] p-5">
                {team.teamIconUrl && (
                  <img src={team.teamIconUrl} className="mb-4 h-16 w-16 object-contain" />
                )}
                <div className="text-xl font-black">{team.shortName || team.teamName}</div>
                <div className="mt-2 text-sm text-white/50">{team.teamName}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-4 flex items-center gap-3 text-3xl font-black">
          <CalendarDays />
          Matches
        </h2>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {matches.slice(0, 24).map((m) => (
            <div key={m.id} className="rounded-3xl border border-white/10 bg-white/[0.06] p-5">
              <div className="text-xs text-white/40">{m.utcDate}</div>

              <div className="mt-3 font-black">
                {m.homeTeam?.shortName || m.homeTeam?.name}
              </div>

              <div className="my-2 text-sm text-white/50">vs</div>

              <div className="font-black">
                {m.awayTeam?.shortName || m.awayTeam?.name}
              </div>

              <div className="mt-4 rounded-full bg-white/10 px-3 py-1 text-xs font-black">
                {m.status}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
