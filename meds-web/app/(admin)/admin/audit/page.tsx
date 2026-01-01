import { Suspense } from 'react';
import AdminAuditLogsClient from './AdminAuditLogsClient';

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-neutral-600">Loading…</div>}>
      <AdminAuditLogsClient />
    </Suspense>
  );
}
