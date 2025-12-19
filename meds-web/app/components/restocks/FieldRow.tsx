'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */

import React from 'react';
import { DeltaBadge } from './DeltaBadge';

type FieldRowProps = {
  label: string;
  before: any;
  after: any;
};

export function FieldRow({ label, before, after }: FieldRowProps) {
  const same =
    (before === null || before === undefined ? '' : String(before)) ===
    (after === null || after === undefined ? '' : String(after));

  return (
    <div className="grid grid-cols-3 gap-2 text-sm">
      <div className="text-neutral-600">{label}</div>

      <div className={`font-medium ${same ? 'text-neutral-700' : 'text-neutral-900'}`}>
        {before ?? '—'}
      </div>

      <div className={`font-medium ${same ? 'text-neutral-700' : 'text-neutral-900'}`}>
        {after ?? '—'}
        <DeltaBadge before={before} after={after} />
      </div>
    </div>
  );
}
