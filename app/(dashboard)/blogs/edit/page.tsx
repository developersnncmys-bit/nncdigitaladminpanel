import { Suspense } from 'react';
import EditBlogPageClient from './EditBlogPageClient';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <EditBlogPageClient />
    </Suspense>
  );
}
