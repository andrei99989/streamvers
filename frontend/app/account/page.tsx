'use client';

import { useEffect, useState } from 'react';
import { User, CreditCard, Shield, History, Save } from 'lucide-react';

const defaults = {
  name: 'Robert',
  email: 'user@streamverse.local',
  plan: 'Premium',
  parentalControl: false,
  pin: ''
};

export default function AccountPage() {
  const [account, setAccount] = useState<any>(defaults);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('streamverse_account');
    if (saved) setAccount(JSON.parse(saved));

    setHistory(JSON.parse(localStorage.getItem('streamverse_continue') || '[]'));
  }, []);

  function update(key: string, value: any) {
    setAccount((prev: any) => ({ ...prev, [key]: value }));
  }

  function save() {
    localStorage.setItem('streamverse_account', JSON.stringify(account));
    alert('Cont salvat');
  }

  return (
    <main className="min-h-screen bg-black p-6 text-white md:p-10">
      <div className="mb-8">
        <div className="mb-3 inline-flex rounded-full bg-[#6A4CFF]/20 px-4 py-2 text-sm font-black text-[#B8A7FF]">
          USER CENTER
        </div>

        <h1 className="flex items-center gap-3 text-5xl font-black">
          <User />
          Cont / Abonament
        </h1>

        <p className="mt-3 text-white/50">
          Gestionează contul, planul, controlul parental și istoricul de vizionare.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel icon={<User />} title="Profil cont">
          <Input label="Nume" value={account.name} onChange={(v: string) => update('name', v)} />
          <Input label="Email" value={account.email} onChange={(v: string) => update('email', v)} />
        </Panel>

        <Panel icon={<CreditCard />} title="Abonament">
          <Select
            label="Plan"
            value={account.plan}
            options={['Free', 'Premium', 'Family', 'Ultra']}
            onChange={(v: string) => update('plan', v)}
          />
        </Panel>

        <Panel icon={<Shield />} title="Control parental">
          <button
            onClick={() => update('parentalControl', !account.parentalControl)}
            className="flex w-full items-center justify-between rounded-2xl bg-white/10 px-4 py-3"
          >
            <span className="font-bold">Control parental</span>
            <span className={`rounded-full px-3 py-1 text-xs font-black ${account.parentalControl ? 'bg-[#00E0A8] text-black' : 'bg-white/10 text-white/50'}`}>
              {account.parentalControl ? 'ON' : 'OFF'}
            </span>
          </button>

          <Input label="PIN" value={account.pin} onChange={(v: string) => update('pin', v)} />
        </Panel>

        <Panel icon={<History />} title="Istoric vizionare">
          {history.length === 0 ? (
            <div className="text-white/50">Nu există istoric încă.</div>
          ) : (
            <div className="space-y-3">
              {history.slice(0, 5).map((item: any, i: number) => (
                <div key={i} className="rounded-2xl bg-white/10 p-3">
                  <div className="font-bold">{item.title}</div>
                  <div className="text-xs text-white/50">{item.progress}% vizionat</div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>

      <button onClick={save} className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-[#6A4CFF] px-6 py-4 font-black">
        <Save size={18} />
        Salvează cont
      </button>
    </main>
  );
}

function Panel({ icon, title, children }: any) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.06] p-6">
      <h2 className="mb-5 flex items-center gap-3 text-2xl font-black">
        {icon}
        {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Input({ label, value, onChange }: any) {
  return (
    <label className="block">
      <div className="mb-2 text-sm font-bold text-white/60">{label}</div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl bg-black/40 px-4 py-3 outline-none"
      />
    </label>
  );
}

function Select({ label, value, options, onChange }: any) {
  return (
    <label className="block">
      <div className="mb-2 text-sm font-bold text-white/60">{label}</div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl bg-black px-4 py-3 outline-none"
      >
        {options.map((x: string) => (
          <option key={x}>{x}</option>
        ))}
      </select>
    </label>
  );
}
