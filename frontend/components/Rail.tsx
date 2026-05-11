'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
const fallback = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=800&auto=format&fit=crop';
export default function Rail({ title, items }: { title: string; items: any[] }) {
  return <section className="space-y-4">
    <h2 className="text-2xl font-semibold">{title}</h2>
    <div className="scrollbar-hide flex gap-5 overflow-x-auto pb-4">
      {items.map((m, i) => <Link href={`/watch/${m._id || i}`} key={m._id || i}>
        <motion.div whileHover={{ scale: 1.05, y: -8 }} className="w-56 shrink-0 overflow-hidden rounded-3xl bg-white/5 ring-1 ring-white/10">
          <img src={m.poster || fallback} className="h-72 w-full object-cover" alt={m.title} />
          <div className="p-4"><p className="font-semibold">{m.title}</p><p className="text-sm text-white/50">{m.genres?.join(' • ') || 'Premium'}</p></div>
        </motion.div>
      </Link>)}
    </div>
  </section>;
}
