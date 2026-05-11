'use client';

import Link from 'next/link';
import { Globe2 } from 'lucide-react';

const countries = [
  'Afganistan','Albania','Algeria','Andorra','Angola','Antigua și Barbuda','Arabia Saudită','Argentina','Armenia','Australia','Austria','Azerbaidjan','Bahamas','Bahrain','Bangladesh','Barbados','Belarus','Belgia','Belize','Benin','Bhutan','Bolivia','Bosnia și Herțegovina','Botswana','Brazilia','Brunei','Bulgaria','Burkina Faso','Burundi','Cambodgia','Camerun','Canada','Capul Verde','Republica Centrafricană','Ciad','Chile','China','Cipru','Columbia','Comore','Congo','Republica Democrată Congo','Coreea de Nord','Coreea de Sud','Costa Rica','Coasta de Fildeș','Croația','Cuba','Danemarca','Dominica','Republica Dominicană','Ecuador','Egipt','El Salvador','Emiratele Arabe Unite','Eritreea','Estonia','Eswatini','Etiopia','Fiji','Filipine','Finlanda','Franța','Gabon','Gambia','Georgia','Germania','Ghana','Grecia','Grenada','Guatemala','Guineea','Guineea-Bissau','Guineea Ecuatorială','Guyana','Haiti','Honduras','India','Indonezia','Irak','Iran','Irlanda','Islanda','Israel','Italia','Jamaica','Japonia','Iordania','Kazahstan','Kenya','Kiribati','Kuweit','Kârgâzstan','Laos','Letonia','Liban','Liberia','Libia','Liechtenstein','Lituania','Luxemburg','Madagascar','Malawi','Malaezia','Maldive','Mali','Malta','Maroc','Insulele Marshall','Mauritania','Mauritius','Mexic','Micronezia','Moldova','Monaco','Mongolia','Muntenegru','Mozambic','Myanmar','Namibia','Nauru','Nepal','Nicaragua','Niger','Nigeria','Norvegia','Noua Zeelandă','Oman','Olanda','Pakistan','Palau','Panama','Papua Noua Guinee','Paraguay','Peru','Polonia','Portugalia','Qatar','Regatul Unit','România','Rusia','Rwanda','Saint Kitts și Nevis','Saint Lucia','Saint Vincent și Grenadine','Samoa','San Marino','São Tomé și Príncipe','Senegal','Serbia','Seychelles','Sierra Leone','Singapore','Siria','Slovacia','Slovenia','Insulele Solomon','Somalia','Africa de Sud','Sudan','Sudanul de Sud','Sri Lanka','Suedia','Elveția','Surinam','Tadjikistan','Tanzania','Thailanda','Timorul de Est','Togo','Tonga','Trinidad și Tobago','Tunisia','Turcia','Turkmenistan','Tuvalu','Uganda','Ucraina','Ungaria','Uruguay','Uzbekistan','Vanuatu','Vatican','Venezuela','Vietnam','Yemen','Zambia'
];

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ș/g, 's')
    .replace(/ț/g, 't')
    .replace(/ă/g, 'a')
    .replace(/â/g, 'a')
    .replace(/î/g, 'i')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export default function CountriesPage() {
  return (
    <main className="min-h-screen bg-black p-6 text-white md:p-10">
      <div className="mb-8">
        <div className="mb-3 inline-flex rounded-full bg-[#00E0A8]/20 px-4 py-2 text-sm font-black text-[#00E0A8]">
          GLOBAL CATALOG
        </div>

        <h1 className="flex items-center gap-3 text-5xl font-black">
          <Globe2 />
          Țări
        </h1>

        <p className="mt-3 max-w-3xl text-white/50">
          Explorează filme, seriale, anime și conținut după țară.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
        {countries.map((country) => (
          <Link
            key={country}
            href={`/discover/${slugify(country)}`}
            className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 transition hover:scale-[1.02] hover:border-[#6A4CFF]"
          >
            <div className="text-3xl">🌍</div>
            <div className="mt-4 text-xl font-black">{country}</div>
            <div className="mt-2 text-sm text-white/50">Catalog regional</div>
          </Link>
        ))}
      </div>
    </main>
  );
}
