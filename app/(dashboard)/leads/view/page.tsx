import { Suspense } from 'react';
import LeadViewPageClient from './LeadViewPageClient';

export default function Page() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-32">
        <div className="w-8 h-8 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    }>
      <LeadViewPageClient />
    </Suspense>
  );
}
