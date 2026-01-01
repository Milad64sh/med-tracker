'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function setOrDelete(qs: URLSearchParams, key: string, value: string) {
  const v = value.trim();
  if (v) qs.set(key, v);
  else qs.delete(key);
}

export function AuditFilters() {
  const router = useRouter();
  const sp = useSearchParams();

  // Read current values from URL
  const [userName, setUserName] = React.useState(sp.get('user_name') ?? '');
  const [action, setAction] = React.useState(sp.get('action') ?? '');
  const [entityType, setEntityType] = React.useState(sp.get('entity_type') ?? '');
  const [clientId, setClientId] = React.useState(sp.get('client_id') ?? '');
  const [dateFrom, setDateFrom] = React.useState(sp.get('date_from') ?? '');
  const [dateTo, setDateTo] = React.useState(sp.get('date_to') ?? '');

  // Keep local state in sync if user navigates back/forward
  React.useEffect(() => {
    setUserName(sp.get('user_name') ?? '');
    setAction(sp.get('action') ?? '');
    setEntityType(sp.get('entity_type') ?? '');
    setClientId(sp.get('client_id') ?? '');
    setDateFrom(sp.get('date_from') ?? '');
    setDateTo(sp.get('date_to') ?? '');
  }, [sp]);

  const apply = () => {
    const qs = new URLSearchParams(sp.toString());

    // reset paging when filters change
    qs.delete('page');

    setOrDelete(qs, 'user_name', userName);
    setOrDelete(qs, 'action', action);
    setOrDelete(qs, 'entity_type', entityType);
    setOrDelete(qs, 'client_id', clientId);
    setOrDelete(qs, 'date_from', dateFrom);
    setOrDelete(qs, 'date_to', dateTo);

    router.push(`/admin/audit?${qs.toString()}`);
  };

  const clear = () => {
    router.push('/admin/audit');
  };

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
        {/* Actor name */}
        <div className="lg:col-span-2">
          <label className="mb-1 block text-xs font-semibold text-neutral-700">User</label>
          <input
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="e.g. Milad"
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500"
          />
          <p className="mt-1 text-[11px] text-neutral-500">Matches actor name (contains)</p>
        </div>

        {/* Action */}
        <div className="lg:col-span-2">
          <label className="mb-1 block text-xs font-semibold text-neutral-700">Action</label>
          <input
            value={action}
            onChange={(e) => setAction(e.target.value)}
            placeholder="e.g. alert.acknowledged"
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500"
          />
          <p className="mt-1 text-[11px] text-neutral-500">Matches action (contains)</p>
        </div>

        {/* Entity type */}
        <div>
          <label className="mb-1 block text-xs font-semibold text-neutral-700">Entity</label>
          <input
            value={entityType}
            onChange={(e) => setEntityType(e.target.value)}
            placeholder="e.g. MedicationCourse"
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500"
          />
          <p className="mt-1 text-[11px] text-neutral-500">Exact entity_type</p>
        </div>

        {/* Client ID (from metadata) */}
        <div>
          <label className="mb-1 block text-xs font-semibold text-neutral-700">Client ID</label>
          <input
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            placeholder="e.g. 12"
            inputMode="numeric"
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500"
          />
          <p className="mt-1 text-[11px] text-neutral-500">Filters metadata.client_id</p>
        </div>

        {/* Date from */}
        <div>
          <label className="mb-1 block text-xs font-semibold text-neutral-700">From</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500"
          />
          <p className="mt-1 text-[11px] text-neutral-500">Created on/after</p>
        </div>

        {/* Date to */}
        <div>
          <label className="mb-1 block text-xs font-semibold text-neutral-700">To</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500"
          />
          <p className="mt-1 text-[11px] text-neutral-500">Created on/before</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={apply}
          className="rounded-xl bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800"
        >
          Apply filters
        </button>
        <button
          type="button"
          onClick={clear}
          className="rounded-xl bg-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-800 hover:bg-neutral-300"
        >
          Clear
        </button>

        <button
          type="button"
          onClick={() => {
            // Quick presets
            const qs = new URLSearchParams(sp.toString());
            qs.delete('page');
            qs.set('action', 'alert.');
            router.push(`/admin/audit?${qs.toString()}`);
          }}
          className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-neutral-800 border border-neutral-300 hover:bg-neutral-50"
          title="Show only alert-related actions"
        >
          Alert actions
        </button>

        <button
          type="button"
          onClick={() => {
            const qs = new URLSearchParams(sp.toString());
            qs.delete('page');
            qs.set('action', 'course.');
            router.push(`/admin/audit?${qs.toString()}`);
          }}
          className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-neutral-800 border border-neutral-300 hover:bg-neutral-50"
          title="Show only medication course actions"
        >
          Course actions
        </button>
      </div>
    </div>
  );
}
