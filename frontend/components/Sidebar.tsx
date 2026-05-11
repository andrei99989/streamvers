import Link from 'next/link';
export default function Sidebar() {
  return <aside className="fixed left-0 top-0 z-40 hidden h-screen w-20 flex-col items-center gap-8 border-r border-white/10 bg-ink/80 py-8 backdrop-blur md:flex">
    <div className="text-2xl">◎</div>
    <Link href="/" className="text-xl">⌂</Link>
    <Link href="/search" className="text-xl">⌕</Link>
    <Link href="/upload" className="text-xl">＋</Link>
    <Link href="/profiles" className="text-xl">☻</Link>
  </aside>;
}
