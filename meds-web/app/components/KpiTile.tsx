'use client';

import React from 'react';

type Props = {
  label: string;
  value: number | string;
  onPress?: () => void;
  intent?: 'default' | 'critical' | 'low' | 'ok';
};

const intentStyles: Record<NonNullable<Props['intent']>, string> = {
  default: 'bg-neutral-100',
  critical: 'bg-red-100',
  low: 'bg-amber-100',
  ok: 'bg-emerald-100',
};

export function KpiTile({ label, value, onPress, intent = 'default' }: Props) {
  return (
    <button
      type="button"
      onClick={onPress}
      className={`
        rounded-xl p-4 mr-3 min-w-[120px] text-left 
        ${intentStyles[intent]} 
        active:opacity-80
        outline-none
      `}
      aria-label={`${label} ${value}`}
    >
      <p className="text-2xl font-semibold text-neutral-900">{String(value)}</p>
      <p className="mt-1 text-neutral-700">{label}</p>
    </button>
  );
}
