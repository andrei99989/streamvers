'use client';

import Link from 'next/link';
import { AlertTriangle, Home, RefreshCcw } from 'lucide-react';

export default function ErrorPage({
  error,
  reset
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-black p-6 text-white">
      <section className="max-w-xl rounded-[2rem] border border-white/10 bg-white/[0.06] p-8 text-center">
        <AlertTriangle className="mx-auto text-red-400" size={56} />

        <h1 className="mt-6 text-4xl font-black">A apărut o eroare</h1>

        <p className="mt-3 text-white/50">
          StreamVerse a întâlnit o problemă, dar aplicația poate continua.
        </p>

        <pre className="mt-6 max-h-40 overflow-auto rounded-2xl bg-black/60 p-4 text-left text-xs text-red-300">
          {error.message}
        </pre>

        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#6A4CFF] px-5 py-3 font-black"
          >
            <RefreshCcw size={18} />
            Reîncearcă
          </button>

          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 font-black text-black"
          >
            <Home size={18} />
            Acasă
          </Link>
        </div>
      </section>
    </main>
  );
}
