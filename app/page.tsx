import { Suspense } from 'react';
import HomePage from '@/app/HomePage';

export default function Page() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <HomePage />
    </Suspense>
  );
}

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-slate-500">Cargando eventos...</div>
    </div>
  );
}
