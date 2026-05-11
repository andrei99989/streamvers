'use client';

import { Archive, Download, RotateCcw } from 'lucide-react';

export default function BackupPage() {
  return (
    <main className="min-h-screen bg-black p-6 text-white md:p-10">
      <section className="mb-8 rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#6A4CFF]/35 to-[#00E0A8]/15 p-8">
        <div className="mb-3 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-black">
          PROJECT SAFETY
        </div>

        <h1 className="flex items-center gap-3 text-5xl font-black">
          <Archive />
          Backup Manager
        </h1>

        <p className="mt-4 max-w-3xl text-white/60">
          Comenzi pentru backup complet, backup clean și restaurare proiect StreamVerse.
        </p>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card
          icon={<Download />}
          title="Backup complet în Download"
          code={`cd ~
tar -czvf streamverse-premium-backup-$(date +%Y-%m-%d-%H-%M).tar.gz streamverse-premium
mv streamverse-premium-backup-*.tar.gz ~/storage/downloads/`}
        />

        <Card
          icon={<Download />}
          title="Backup clean fără node_modules"
          code={`cd ~
tar --exclude='streamverse-premium/frontend/node_modules' \\
    --exclude='streamverse-premium/backend/node_modules' \\
    --exclude='streamverse-premium/frontend/.next' \\
    -czvf streamverse-premium-backup-clean-$(date +%Y-%m-%d-%H-%M).tar.gz streamverse-premium
mv streamverse-premium-backup-clean-*.tar.gz ~/storage/downloads/`}
        />

        <Card
          icon={<RotateCcw />}
          title="Restore backup"
          code={`cd ~
tar -xzvf ~/storage/downloads/streamverse-premium-backup-YYYY-MM-DD-HH-MM.tar.gz`}
        />

        <Card
          icon={<Archive />}
          title="Verifică backup-uri"
          code={`ls -lh ~/storage/downloads/streamverse-premium-backup*.tar.gz`}
        />
      </div>
    </main>
  );
}

function Card({ icon, title, code }: any) {
  async function copy() {
    await navigator.clipboard.writeText(code);
    alert('Comanda copiată');
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.06] p-5">
      <h2 className="mb-4 flex items-center gap-3 text-2xl font-black">
        <span className="text-[#00E0A8]">{icon}</span>
        {title}
      </h2>

      <pre className="overflow-auto rounded-2xl bg-black/60 p-4 text-sm text-white/80">
        {code}
      </pre>

      <button
        onClick={copy}
        className="mt-4 rounded-2xl bg-[#6A4CFF] px-5 py-3 font-black"
      >
        Copiază
      </button>
    </section>
  );
}
