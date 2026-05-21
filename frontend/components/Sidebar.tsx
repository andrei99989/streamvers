'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Search,
  Plus,
  UserRound,
  Database,
  Clock3,
  Heart,
  Library,
  Compass,
} from 'lucide-react';

const items = [
  { href: '/', label: 'Acasă', icon: Home },
  { href: '/discover', label: 'Discover', icon: Compass },
  { href: '/search', label: 'Căutare', icon: Search },
  { href: '/sources', label: 'Sources', icon: Database },
  { href: '/continue-watching', label: 'Continue', icon: Clock3 },
  { href: '/watchlist', label: 'Watchlist', icon: Heart },
  { href: '/library', label: 'Library', icon: Library },
  { href: '/upload', label: 'Upload', icon: Plus },
  { href: '/profiles', label: 'Profile', icon: UserRound },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-20 flex-col items-center gap-4 border-r border-white/10 bg-black/60 py-6 shadow-[0_0_40px_rgba(0,0,0,.4)] backdrop-blur-2xl lg:flex">
      <Link
        href="/"
        title="StreamVerse"
        className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#6A4CFF]/20 text-xl font-black text-[#B8A7FF] shadow-[0_0_25px_rgba(106,76,255,.35)]"
      >
        S
      </Link>

      <nav className="flex flex-1 flex-col items-center gap-2 lg:gap-3">
        {items.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={`group relative flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-300 hover:translate-x-1 ${
                active
                  ? 'bg-[#6A4CFF] text-white shadow-[0_0_25px_rgba(106,76,255,.55)]'
                  : 'text-white/60 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon size={21} />

              {active && (
                <span className="absolute -right-1 h-6 w-1 rounded-full bg-white" />
              )}

              <span className="pointer-events-none absolute left-16 z-[99999] scale-95 whitespace-nowrap rounded-xl bg-black/90 px-3 py-2 text-xs font-bold text-white opacity-0 shadow-xl transition group-hover:scale-100 group-hover:opacity-100">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      <Link
        href="/sources"
        title="Add source"
        className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/60 transition hover:bg-[#6A4CFF] hover:text-white"
      >
        <Plus size={18} />
      </Link>
    </aside>
  );
}
