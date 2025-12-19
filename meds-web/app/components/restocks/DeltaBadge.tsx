'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */

import React from 'react';
import { deltaText } from '@/app/features/restocks/delta';

export function DeltaBadge({ before, after }: { before: any; after: any }) {
  const d = deltaText(before, after);
  if (d === null) return null;

  const isZero = d === '0';
  const isPos = d.startsWith('+');

  const cls = isZero
    ? 'bg-neutral-100 text-neutral-700'
    : isPos
    ? 'bg-emerald-100 text-emerald-800'
    : 'bg-red-100 text-red-800';

  return (
    <span className={`ml-2 inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`}>
      {d}
    </span>
  );
}
