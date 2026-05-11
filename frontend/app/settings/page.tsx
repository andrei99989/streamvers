'use client';

import { useEffect, useState } from 'react';
import { Settings, MonitorPlay, Subtitles, Globe2, Moon, Save } from 'lucide-react';

const defaults = {
  theme: 'Dark',
  language: 'Română',
  subtitles: 'Română',
  audio: 'Original',
  autoplay: true,
  skipIntro: true,
  miniPlayer: true,
  cinemaMode: true,
  quality: 'Auto'
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<any>(defaults);

  useEffect(() => {
    const saved = localStorage.getItem('streamverse_settings');
    if (saved) setSettings(JSON.parse(saved));
  }, []);

  function update(key: string, value: any) {
    setSettings((prev: any) => ({ ...prev, [key]: value }));
  }

  function save() {
    localStorage.setItem('streamverse_settings', JSON.stringify(settings));
    alert('Setările au fost salvate');
  }

  return (
    <main className="min-h-screen bg-black p-6 text-white md:p-10">
      <div className="mb-8">
        <div className="mb-3 inline-flex rounded-full bg-[#6A4CFF]/20 px-4 py-2 text-sm font-black text-[#B8A7FF]">
          StreamVerse Control Center
        </div>

        <h1 className="flex items-center gap-3 text-5xl font-black">
          <Settings />
          Settings
        </h1>

        <p className="mt-3 max-w-2xl text-white/50">
          Configurează playerul universal, subtitrările, limba, tema și comportamentul platformei.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel icon={<MonitorPlay />} title="Player">
          <Select label="Calitate video" value={settings.quality} options={['Auto', '1080p', '720p', '480p']} onChange={(v) => update('quality', v)} />
          <Toggle label="Autoplay preview" value={settings.autoplay} onChange={(v) => update('autoplay', v)} />
          <Toggle label="Skip Intro" value={settings.skipIntro} onChange={(v) => update('skipIntro', v)} />
          <Toggle label="Mini Player" value={settings.miniPlayer} onChange={(v) => update('miniPlayer', v)} />
          <Toggle label="Cinema Mode" value={settings.cinemaMode} onChange={(v) => update('cinemaMode', v)} />
        </Panel>

        <Panel icon={<Subtitles />} title="Subtitrări & Audio">
          <Select label="Subtitrări preferate" value={settings.subtitles} options={['Română', 'English', 'Spanish', 'French', 'German', 'Off']} onChange={(v) => update('subtitles', v)} />
          <Select label="Audio preferat" value={settings.audio} options={['Original', 'Română', 'English', 'Spanish', 'Japanese', 'Korean']} onChange={(v) => update('audio', v)} />
        </Panel>

        <Panel icon={<Globe2 />} title="Limbă & Regiune">
          <Select label="Limba interfeței" value={settings.language} options={['Română', 'English', 'Spanish', 'French', 'German']} onChange={(v) => update('language', v)} />
        </Panel>

        <Panel icon={<Moon />} title="Aspect">
          <Select label="Temă" value={settings.theme} options={['Dark', 'Midnight Purple', 'Neon Green', 'OLED Black']} onChange={(v) => update('theme', v)} />
        </Panel>
      </div>

      <button onClick={save} className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-[#6A4CFF] px-6 py-4 font-black">
        <Save size={18} />
        Salvează setările
      </button>
    </main>
  );
}

function Panel({ icon, title, children }: any) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-6">
      <h2 className="mb-6 flex items-center gap-3 text-2xl font-black">
        {icon}
        {title}
      </h2>
      <div className="space-y-5">{children}</div>
    </div>
  );
}

function Select({ label, value, options, onChange }: any) {
  return (
    <label className="block">
      <div className="mb-2 text-sm font-bold text-white/60">{label}</div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-white/10 bg-black px-4 py-3 outline-none"
      >
        {options.map((x: string) => (
          <option key={x}>{x}</option>
        ))}
      </select>
    </label>
  );
}

function Toggle({ label, value, onChange }: any) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="flex w-full items-center justify-between rounded-2xl bg-white/10 px-4 py-3"
    >
      <span className="font-bold">{label}</span>
      <span className={`rounded-full px-3 py-1 text-xs font-black ${value ? 'bg-[#00E0A8] text-black' : 'bg-white/10 text-white/50'}`}>
        {value ? 'ON' : 'OFF'}
      </span>
    </button>
  );
}
