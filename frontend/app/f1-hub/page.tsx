'use client';
import { API } from '../../lib/api';

import { useEffect, useState } from 'react';
import { Flag, Trophy, CalendarDays, Users } from 'lucide-react';



export default function F1HubPage() {
  const [nextRace, setNextRace] = useState<any>(null);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [constructors, setConstructors] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${API}/f1/current/next`)
      .then((r) => r.json())
      .then((json) => {
        const race = json?.MRData?.RaceTable?.Races?.[0];
        setNextRace(race || null);
      });

    fetch(`${API}/f1/current/driver-standings`)
      .then((r) => r.json())
      .then((json) => {
        const list = json?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings || [];
        setDrivers(list);
      });

    fetch(`${API}/f1/current/constructor-standings`)
      .then((r) => r.json())
      .then((json) => {
        const list = json?.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings || [];
        setConstructors(list);
      });
  }, []);

  return (
    <main className="min-h-screen bg-black p-6 text-white md:p-10">
      <section className="mb-8 rounded-[2rem] border border-white/10 bg-gradient-to-br from-red-500/35 to-[#6A4CFF]/20 p-8">
        <div className="mb-3 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-black">
          JOLPICA F1 ENGINE
        </div>

        <h1 className="flex items-center gap-3 text-5xl font-black">
          <Flag />
          F1 Hub
        </h1>

        <p className="mt-4 max-w-3xl text-white/60">
          Calendar F1, următoarea cursă, clasament piloți și constructori.
        </p>
      </section>

      <div className="mb-8 grid gap-4 lg:grid-cols-3">
        <Panel icon={<CalendarDays />} title="Următoarea cursă">
          {nextRace ? (
            <div>
              <div className="text-2xl font-black">{nextRace.raceName}</div>
              <div className="mt-2 text-white/50">
                {nextRace.Circuit?.circuitName}
              </div>
              <div className="mt-2 text-white/50">
                {nextRace.date} {nextRace.time || ''}
              </div>
              <div className="mt-2 text-white/50">
                {nextRace.Circuit?.Location?.locality}, {nextRace.Circuit?.Location?.country}
              </div>
            </div>
          ) : (
            <div className="text-white/50">Se încarcă...</div>
          )}
        </Panel>

        <Panel icon={<Trophy />} title="Lider piloți">
          {drivers[0] ? (
            <div>
              <div className="text-2xl font-black">
                {drivers[0].Driver?.givenName} {drivers[0].Driver?.familyName}
              </div>
              <div className="mt-2 text-white/50">
                {drivers[0].Constructors?.[0]?.name}
              </div>
              <div className="mt-2 text-[#00E0A8]">{drivers[0].points} puncte</div>
            </div>
          ) : (
            <div className="text-white/50">Se încarcă...</div>
          )}
        </Panel>

        <Panel icon={<Users />} title="Lider constructori">
          {constructors[0] ? (
            <div>
              <div className="text-2xl font-black">
                {constructors[0].Constructor?.name}
              </div>
              <div className="mt-2 text-white/50">
                {constructors[0].Constructor?.nationality}
              </div>
              <div className="mt-2 text-[#00E0A8]">{constructors[0].points} puncte</div>
            </div>
          ) : (
            <div className="text-white/50">Se încarcă...</div>
          )}
        </Panel>
      </div>

      <section className="mb-10">
        <h2 className="mb-4 text-3xl font-black">Clasament piloți</h2>
        <div className="overflow-hidden rounded-3xl border border-white/10">
          {drivers.slice(0, 20).map((row) => (
            <div key={row.Driver?.driverId} className="grid grid-cols-[60px_1fr_90px] gap-4 border-b border-white/10 bg-white/[0.04] p-4 last:border-0">
              <div className="font-black text-[#00E0A8]">#{row.position}</div>
              <div>
                <div className="font-black">
                  {row.Driver?.givenName} {row.Driver?.familyName}
                </div>
                <div className="text-sm text-white/50">{row.Constructors?.[0]?.name}</div>
              </div>
              <div className="text-right font-black">{row.points}</div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-3xl font-black">Constructori</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {constructors.map((row) => (
            <div key={row.Constructor?.constructorId} className="rounded-3xl border border-white/10 bg-white/[0.06] p-5">
              <div className="text-2xl font-black">#{row.position} {row.Constructor?.name}</div>
              <div className="mt-2 text-white/50">{row.Constructor?.nationality}</div>
              <div className="mt-4 text-[#00E0A8]">{row.points} puncte • {row.wins} wins</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function Panel({ icon, title, children }: any) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.06] p-6">
      <h2 className="mb-4 flex items-center gap-3 text-xl font-black">
        <span className="text-[#00E0A8]">{icon}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}
