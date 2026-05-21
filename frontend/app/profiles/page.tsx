'use client';

import { apiDelete, apiFetch, apiPost } from '../../lib/apiClient';
import { useEffect, useState } from 'react';
import { Plus, Trash2, UserRound } from 'lucide-react';

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [name, setName] = useState('');

  async function loadProfiles() {
    const data = await apiFetch('/profiles');
    setProfiles(data.items || []);
  }

  async function addProfile() {
    if (!name.trim()) return;

    await apiPost('/profiles', {
      name: name.trim(),
      type: 'adult',
    });

    setName('');
    loadProfiles();
  }

  async function removeProfile(id: string) {
    await apiDelete(`/profiles/${id}`);
    setProfiles((prev) => prev.filter((x) => String(x.id) !== String(id)));
  }

  useEffect(() => {
    loadProfiles();
  }, []);

  return (
    <main className="min-h-screen bg-black p-6 pb-36 text-white md:p-10 md:pb-20">
      <section className="glass mb-8 rounded-[2.5rem] p-8">
        <h1 className="flex items-center gap-3 text-5xl font-black">
          <UserRound />
          Profiles
        </h1>

        <div className="mt-6 flex gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nume profil"
            className="flex-1 rounded-2xl border border-white/10 bg-black/40 px-5 py-4 outline-none"
          />

          <button onClick={addProfile} className="rounded-2xl bg-[#6A4CFF] px-5 py-4 font-black">
            <Plus />
          </button>
        </div>
      </section>

      <div className="grid gap-5 md:grid-cols-3">
        {profiles.map((profile) => (
          <div key={profile.id} className="glass rounded-[2rem] p-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-[#6A4CFF] text-3xl font-black">
              {profile.name?.[0]?.toUpperCase() || 'S'}
            </div>

            <h2 className="mt-4 text-2xl font-black">{profile.name}</h2>
            <p className="mt-2 text-white/40">{profile.type || 'adult'}</p>

            <button
              onClick={() => removeProfile(profile.id)}
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
