'use client';

import { useEffect, useState } from 'react';
import { UserRound, Plus, Trash2, ShieldCheck } from 'lucide-react';

const avatars = ['😀', '😎', '🤖', '🦸', '🐉', '👑', '🎮', '🧸'];

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(avatars[0]);

  useEffect(() => {
    const saved = localStorage.getItem('streamverse_profiles');
    setProfiles(saved ? JSON.parse(saved) : [
      { id: 1, name: 'Robert', avatar: '😎', kids: false, active: true },
      { id: 2, name: 'Kids', avatar: '🧸', kids: true, active: false }
    ]);
  }, []);

  function save(next: any[]) {
    setProfiles(next);
    localStorage.setItem('streamverse_profiles', JSON.stringify(next));
  }

  function addProfile() {
    if (!name.trim()) return;

    save([
      ...profiles,
      {
        id: Date.now(),
        name,
        avatar,
        kids: false,
        active: false
      }
    ]);

    setName('');
    setAvatar(avatars[0]);
  }

  function setActive(id: number) {
    save(profiles.map((p) => ({ ...p, active: p.id === id })));
  }

  function toggleKids(id: number) {
    save(profiles.map((p) => p.id === id ? { ...p, kids: !p.kids } : p));
  }

  function remove(id: number) {
    save(profiles.filter((p) => p.id !== id));
  }

  return (
    <main className="min-h-screen bg-black p-6 text-white md:p-10">
      <h1 className="flex items-center gap-3 text-5xl font-black">
        <UserRound />
        Profiluri
      </h1>

      <p className="mt-3 text-white/50">
        Creează profiluri multiple, activează Kids Mode și personalizează experiența.
      </p>

      <section className="mt-8 rounded-3xl border border-white/10 bg-white/[0.06] p-5">
        <h2 className="mb-4 text-2xl font-black">Adaugă profil</h2>

        <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nume profil..."
            className="rounded-2xl bg-black/40 px-5 py-4 outline-none"
          />

          <select
            value={avatar}
            onChange={(e) => setAvatar(e.target.value)}
            className="rounded-2xl bg-black px-5 py-4"
          >
            {avatars.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>

          <button
            onClick={addProfile}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#6A4CFF] px-5 py-4 font-black"
          >
            <Plus size={18} />
            Add
          </button>
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-3 xl:grid-cols-4">
        {profiles.map((profile) => (
          <div
            key={profile.id}
            className={`rounded-3xl border p-6 ${
              profile.active
                ? 'border-[#00E0A8] bg-[#00E0A8]/10'
                : 'border-white/10 bg-white/[0.06]'
            }`}
          >
            <div className="text-7xl">{profile.avatar}</div>

            <h2 className="mt-4 text-2xl font-black">{profile.name}</h2>

            <div className="mt-2 flex gap-2">
              {profile.active && (
                <span className="rounded-full bg-[#00E0A8] px-3 py-1 text-xs font-black text-black">
                  ACTIVE
                </span>
              )}

              {profile.kids && (
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black">
                  KIDS
                </span>
              )}
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <button onClick={() => setActive(profile.id)} className="rounded-2xl bg-white px-4 py-3 font-black text-black">
                Select
              </button>

              <button onClick={() => toggleKids(profile.id)} className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-3 font-black">
                <ShieldCheck size={16} />
                Kids
              </button>

              <button onClick={() => remove(profile.id)} className="rounded-2xl bg-red-500 px-4 py-3 font-black">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
