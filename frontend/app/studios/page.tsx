'use client';

import Link from 'next/link';
import { Building2 } from 'lucide-react';

const groups = [
  {
    title: 'SUA / America de Nord',
    studios: ['Lionsgate','MGM','Blumhouse','Legendary','Skydance','A24','Laika','Illumination','WildBrain','Nelvana']
  },
  {
    title: 'Asia',
    studios: ['Toei Animation','Madhouse','MAPPA','Studio Ghibli','Bones','Studio Pierrot','Studio Dragon','CJ ENM','Tencent Pictures','Yash Raj Films']
  },
  {
    title: 'Europa',
    studios: ['BBC Studios','ITV Studios','Aardman','Gaumont','Pathé','StudioCanal','Constantin Film','Filmax','Lux Vide','Castel Film']
  },
  {
    title: 'Africa',
    studios: ['FilmOne Studios','EbonyLife Studios','Triggerfish','Videovision','Mavin Records','SuperSport Studios']
  },
  {
    title: 'America de Sud',
    studios: ['Globo Filmes','RecordTV Studios','TV Pinguim','Copa Studio','Pol-ka','Fabula']
  },
  {
    title: 'Australia & Oceania',
    studios: ['Animal Logic','Flying Bark','Princess Bento','SLR Productions','Weta Workshop','Weta FX']
  }
];

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function StudiosPage() {
  return (
    <main className="min-h-screen bg-black p-6 text-white md:p-10">
      <div className="mb-8">
        <div className="mb-3 inline-flex rounded-full bg-[#00E0A8]/20 px-4 py-2 text-sm font-black text-[#00E0A8]">
          STUDIO CATALOG
        </div>

        <h1 className="flex items-center gap-3 text-5xl font-black">
          <Building2 />
          Studios
        </h1>

        <p className="mt-3 max-w-3xl text-white/50">
          Explorează conținut după studiouri, regiuni și producători.
        </p>
      </div>

      <div className="space-y-8">
        {groups.map((group) => (
          <section key={group.title}>
            <h2 className="mb-4 text-3xl font-black">{group.title}</h2>

            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
              {group.studios.map((studio, i) => (
                <Link
                  key={studio}
                  href={`/discover/studio-${slugify(studio)}`}
                  className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06] transition hover:scale-[1.02] hover:border-[#6A4CFF]"
                >
                  <img
                    src={"/placeholder-wide.svg"}
                    alt={studio}
                    className="h-32 w-full object-cover"
                  />

                  <div className="p-4">
                    <div className="font-black">{studio}</div>
                    <div className="mt-1 text-xs text-white/50">{group.title}</div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
