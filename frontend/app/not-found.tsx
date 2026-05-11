import Link from 'next/link';
import { Home, Search } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-black p-6 text-white">
      <section className="max-w-xl rounded-[2rem] border border-white/10 bg-white/[0.06] p-8 text-center">
        <div className="text-7xl font-black text-[#6A4CFF]">404</div>

        <h1 className="mt-6 text-4xl font-black">Pagina nu există</h1>

        <p className="mt-3 text-white/50">
          Categoria sau sursa nu a fost găsită în StreamVerse.
        </p>

        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 font-black text-black"
          >
            <Home size={18} />
            Acasă
          </Link>

          <Link
            href="/search"
            className="inline-flex items-center gap-2 rounded-2xl bg-[#6A4CFF] px-5 py-3 font-black"
          >
            <Search size={18} />
            Search
          </Link>
        </div>
      </section>
    </main>
  );
}
