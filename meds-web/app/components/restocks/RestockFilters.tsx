'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function setOrDelete(sp: URLSearchParams, key: string, val: string) {
  const v = val.trim();
  if (!v) sp.delete(key);
  else sp.set(key, v);
}

export function RestockFilters() {
  const router = useRouter();
  const sp = useSearchParams();

  const userName = sp.get('user_name') ?? '';
  const clientInitials = sp.get('client_initials') ?? '';
  const dateFrom = sp.get('date_from') ?? '';
  const dateTo = sp.get('date_to') ?? '';

  const [localUserName, setLocalUserName] = React.useState(userName);
  const [localClientInitials, setLocalClientInitials] = React.useState(clientInitials);
  const [localDateFrom, setLocalDateFrom] = React.useState(dateFrom);
  const [localDateTo, setLocalDateTo] = React.useState(dateTo);

  React.useEffect(() => setLocalUserName(userName), [userName]);
  React.useEffect(() => setLocalClientInitials(clientInitials), [clientInitials]);
  React.useEffect(() => setLocalDateFrom(dateFrom), [dateFrom]);
  React.useEffect(() => setLocalDateTo(dateTo), [dateTo]);

  const apply = () => {
    const next = new URLSearchParams(sp.toString());

    setOrDelete(next, 'user_name', localUserName);
    setOrDelete(next, 'client_id', localClientInitials);
    setOrDelete(next, 'date_from', localDateFrom);
    setOrDelete(next, 'date_to', localDateTo);

    // when filters change, reset to page 1
    next.set('page', '1');

    router.push(`/admin/restocks?${next.toString()}`);
  };

  const clear = () => {
    router.push('/admin/restocks?page=1');
  };

  return (
    <div className="mb-4 rounded-2xl border border-neutral-200 bg-white p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-neutral-900">Filters</p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={clear}
            className="rounded-xl bg-neutral-200 px-3 py-2 text-sm font-semibold text-neutral-800 hover:bg-neutral-300"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={apply}
            className="rounded-xl bg-neutral-900 px-3 py-2 text-sm font-semibold text-white hover:bg-neutral-800"
          >
            Apply
          </button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <div>
          <label className="mb-1 block text-xs font-semibold text-neutral-600">User name</label>
          <input
            value={localUserName}
            onChange={(e) => setLocalUserName(e.target.value)}
            placeholder="e.g. 1"
            className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500"
            inputMode="numeric"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-neutral-600">Client initials</label>
          <input
            value={localClientInitials}
            onChange={(e) => setLocalClientInitials(e.target.value)}
            placeholder="e.g. 12"
            className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500"
            inputMode="numeric"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-neutral-600">Date from</label>
          <input
            value={localDateFrom}
            onChange={(e) => setLocalDateFrom(e.target.value)}
            type="date"
            className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-neutral-600">Date to</label>
          <input
            value={localDateTo}
            onChange={(e) => setLocalDateTo(e.target.value)}
            type="date"
            className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500"
          />
        </div>
      </div>

      <p className="mt-3 text-xs text-neutral-500">
        Tip: date filters apply to the log time (created_at), not the medication restock_date.
      </p>
    </div>
  );
}
