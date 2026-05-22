'use client';

import { apiFetch, apiPost } from '../../lib/apiClient';
import { useEffect, useState } from 'react';
import { Settings } from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState<any>({
    theme: 'dark',
    language: 'ro',
    quality: 'auto',
    autoplay: true,
  });

  async function loadSettings() {
    const data = await apiFetch('/settings');
    setSettings((prev: any) => ({ ...prev, ...data }));
  }

  async function updateSettings(next: any) {
    setSettings(next);
    await apiPost('/settings', next);
  }

  useEffect(() => {
    loadSettings();
  }, []);

  return (
    <main className="min-h-screen bg-black p-6 pb-56 text-white md:p-10 md:pb-20">
      <section className="glass mb-8 rounded-[2.5rem] p-8">
        <h1 className="flex items-center gap-3 text-5xl font-black">
          <Settings />
          Settings
        </h1>
      </section>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="glass rounded-[2rem] p-6">
          <div className="mb-2 font-black">Language</div>
          <select
            value={settings.language}
            onChange={(e) => updateSettings({ ...settings, language: e.target.value })}
            className="w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4"
          >
            <option value="ro">Română</option>
            <option value="en">English</option>
          </select>
        </div>

        <div className="glass rounded-[2rem] p-6">
          <div className="mb-2 font-black">Quality</div>
          <select
            value={settings.quality}
            onChange={(e) => updateSettings({ ...settings, quality: e.target.value })}
            className="w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4"
          >
            <option value="auto">Auto</option>
            <option value="1080p">1080p</option>
            <option value="720p">720p</option>
          </select>
        </div>

        <button
          onClick={() => updateSettings({ ...settings, autoplay: !settings.autoplay })}
          className="glass rounded-[2rem] p-6 text-left"
        >
          <div className="font-black">Autoplay</div>
          <div className="mt-2 text-white/50">
            {settings.autoplay ? 'Activat' : 'Dezactivat'}
          </div>
        </button>
      </div>
    </main>
  );
}
