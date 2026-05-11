import { Suspense } from 'react';
import SearchClient from '../../components/search/SearchClient';

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-8 text-white">Se încarcă Search...</div>}>
      <SearchClient />
    </Suspense>
  );
}
