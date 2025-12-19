import { Suspense } from 'react';
import AdminRestockLogsClient from './AdminRestockLogsClient';

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-neutral-600">Loading…</div>}>
      <AdminRestockLogsClient />
    </Suspense>
  );
}
