'use client';

import Link from 'next/link';
import { AlertTriangle, Home, RefreshCcw } from 'lucide-react';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-screen bg-black p-6 pb-56 text-white md:p-10 md:pb-20">
      <section className="mx-auto max-w-3xl rounded-[2.5rem] border border-red-500/20 bg-red-500/5 p-8 text-center backdrop-blur-xl">
        <AlertTriangle className="mx-auto text-red-400" size={64} />

        <h1 className="mt-6 text-5xl font-black">
          A apărut o eroare
        </h1>

        <p className="mt-4 text-white/60">
          StreamVerse a prins eroarea. Poți reîncerca fără să pierzi sesiunea.
        </p>

        {error?.message && (
          <pre className="mt-6 max-h-40 overflow-auto rounded-2xl border border-white/10 bg-black/60 p-4 text-left text-xs text-white/50">
            {error.message}
          </pre>
        )}

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#6A4CFF] px-6 py-4 font-black text-white"
          >
            <RefreshCcw size={18} />
            Reîncearcă
          </button>

          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-6 py-4 font-black text-white"
          >
            <Home size={18} />
            Acasă
          </Link>
        </div>
      </section>
    </main>
  );
}
