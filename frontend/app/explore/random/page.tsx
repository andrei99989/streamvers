import Link from 'next/link';
import { Shuffle } from 'lucide-react';

export default function Page() {
  return (
    <main className="min-h-screen bg-black p-6 pb-56 text-white md:p-10 md:pb-20">
      <section className="hero-glow glass rounded-[2.5rem] p-8">
        <div className="mb-4 inline-flex rounded-full bg-[#6A4CFF]/20 px-4 py-2 text-xs font-black uppercase tracking-[0.25em] text-[#B8A7FF]">
          EXPLORE
        </div>

        <h1 className="flex items-center gap-3 text-5xl font-black md:text-7xl">
          <Shuffle />
          Random Movie
        </h1>

        <p className="mt-5 max-w-3xl text-white/60">
          Descoperă rapid un titlu random din catalogul StreamVerse.
        </p>

        <Link href="/sources" className="mt-6 inline-flex rounded-2xl bg-[#6A4CFF] px-6 py-4 font-black">
          Vezi surse
        </Link>
      </section>
    </main>
  );
}
