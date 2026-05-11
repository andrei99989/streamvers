'use client';

import { use } from 'react';

function titleFromSlug(slug: string) {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default function DiscoverCategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const title = titleFromSlug(slug);

  const rows = [
    'Featured',
    'Popular',
    'Recently Added',
  ];

  return (
    <main className="min-h-screen bg-ink px-6 py-10 text-white">
      <h1 className="text-4xl font-black">{title}</h1>

      <section className="mt-8 space-y-6">
        {rows.map((row) => (
          <div key={row}>
            <h2 className="text-2xl font-bold">{row}</h2>
            <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-6 text-white/60">
              Content coming soon for {title}.
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
