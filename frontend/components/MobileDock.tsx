'use client';

import Link from 'next/link';
import { Home, Search, Database, Clock3, Heart } from 'lucide-react';

const items = [
  { href: '/', icon: Home },
  { href: '/search', icon: Search },
  { href: '/sources', icon: Database },
  { href: '/history', icon: Clock3 },
  { href: '/watchlist', icon: Heart },
];

export default function MobileDock() {
  return (
    <div
      className="pointer-events-none fixed inset-x-0 z-[99999] flex justify-center lg:hidden"
      style={{ bottom: 'calc(env(safe-area-inset-bottom) + 18px)' }}
    >
      <nav className="glass-nav pointer-events-auto flex w-[82%] max-w-[292px] items-center justify-around rounded-[24px] border border-white/10 bg-black/90 px-2 py-2 shadow-[0_0_18px_rgba(76,70,255,.22)]">
        {items.map(({ href, icon: Icon }, index) => (
          <Link
            key={href}
            href={href}
            className={`flex h-10 w-10 items-center justify-center rounded-2xl transition ${
              index === 0 ? 'bg-[#2f18e8] text-white shadow-[0_0_16px_rgba(76,70,255,.55)]' : 'text-white/55'
            }`}
          >
            <Icon size={24} strokeWidth={2.2} />
          </Link>
        ))}
      </nav>
    </div>
  );
}
