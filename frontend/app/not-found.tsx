import './globals.css';
import Link from 'next/link';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-black p-6 pb-56 text-white md:p-10 md:pb-20">
      <section className="mx-auto max-w-3xl rounded-[2.5rem] border border-white/10 bg-white/5 p-8 text-center backdrop-blur-xl">
        <div className="text-7xl font-black text-[#6A4CFF]">404</div>

        <h1 className="mt-6 text-5xl font-black">
          Pagina nu a fost găsită
        </h1>

        <p className="mt-4 text-white/60">
          Linkul nu există sau ruta a fost mutată în StreamVerse.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-2xl bg-[#6A4CFF] px-6 py-4 font-black text-white"
          >
            <Home size={18} />
            Acasă
          </Link>

          <Link
            href="/search"
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-6 py-4 font-black text-white"
          >
            <Search size={18} />
            Caută
          </Link>
        </div>
      </section>
    </main>
  );
}
