import { Suspense } from 'react';
import LeadStatusPageClient from './LeadStatusPageClient';

export function generateStaticParams() {
  return ['new', 'overdue', 'today', 'followup', 'inprocess', 'converted', 'dead'].map(
    (status) => ({ status })
  );
}

export default function Page({ params }: { params: Promise<{ status: string }> }) {
  return (
    <Suspense fallback={null}>
      <LeadStatusPageClient params={params} />
    </Suspense>
  );
}
