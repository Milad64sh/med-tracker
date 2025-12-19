'use client';

import React from 'react';
import type { RestockLog } from '@/app/features/restocks/types';
import { fmtDate, fmtDateTime } from '@/app/features/restocks/format';
import { FieldRow } from './FieldRow';

export function RestockLogCard({ log }: { log: RestockLog }) {
  const before = log.before ?? {};
  const after = log.after ?? {};

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-base font-semibold text-neutral-900">
            {log.course?.name ?? 'Medication'}{' '}
            {log.course?.strength ? (
              <span className="text-neutral-700">{log.course.strength}</span>
            ) : null}
          </p>

          <p className="truncate text-sm text-neutral-600">
            Client:{' '}
            <span className="font-medium text-neutral-800">
              {log.client?.initials ?? '—'}
            </span>
          </p>

          <p className="truncate text-sm text-neutral-600">
            By:{' '}
            <span className="font-medium text-neutral-800">
              {log.user?.name ?? '—'}
            </span>{' '}
            <span className="text-neutral-500">
              ({log.user?.email ?? ''})
            </span>
          </p>
        </div>

        <span className="shrink-0 rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-700">
          {fmtDateTime(log.created_at)}
        </span>
      </div>

      <div className="mt-3 rounded-xl bg-neutral-50 p-3">
        <div className="mb-2 grid grid-cols-3 gap-2 text-xs font-semibold text-neutral-500">
          <div>Field</div>
          <div>Before</div>
          <div>After</div>
        </div>

        <div className="space-y-2">
          <FieldRow label="Pack size" before={before.pack_size} after={after.pack_size} />
          <FieldRow label="Packs on hand" before={before.packs_on_hand} after={after.packs_on_hand} />
          <FieldRow label="Loose units" before={before.loose_units} after={after.loose_units} />
          <FieldRow label="Opening units" before={before.opening_units} after={after.opening_units} />

          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="text-neutral-600">Restock date</div>
            <div className="font-medium text-neutral-700">
              {before.restock_date ? fmtDate(before.restock_date) : '—'}
            </div>
            <div className="font-medium text-neutral-900">
              {after.restock_date
                ? fmtDate(after.restock_date)
                : log.restock_date
                ? fmtDate(log.restock_date)
                : '—'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
