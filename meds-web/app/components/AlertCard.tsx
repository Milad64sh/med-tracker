'use client';

import React from 'react';
import type { AlertRow } from '../features/dashboard/types';
import { formatUK } from '../utils/formatUK';

function statusColors(status: AlertRow['status']) {
  switch (status) {
    case 'critical':
      return {
        circleBg: 'bg-red-100',
        textPrimary: 'text-red-800',
        textSecondary: 'text-red-700',
        statusPill: 'bg-red-600 text-white',
        card: 'border-red-100 bg-red-50',
      };

    case 'low':
      return {
        circleBg: 'bg-amber-100',
        textPrimary: 'text-amber-800',
        textSecondary: 'text-amber-700',
        statusPill: 'bg-amber-500 text-white',
        card: 'border-amber-100 bg-amber-50',
      };

    case 'ok':
      return {
        circleBg: 'bg-emerald-100',
        textPrimary: 'text-emerald-800',
        textSecondary: 'text-emerald-700',
        statusPill: 'bg-emerald-500 text-white',
        card: 'border-emerald-100 bg-emerald-50',
      };

    default:
      return {
        circleBg: 'bg-neutral-100',
        textPrimary: 'text-neutral-800',
        textSecondary: 'text-neutral-600',
        statusPill: 'bg-neutral-500 text-white',
        card: 'border-neutral-200 bg-white',
      };
  }
}

type AlertCardProps = {
  item: AlertRow;
  onPress?: () => void;
  onEmailPress?: (item: AlertRow) => void;
};

export function AlertCard({ item, onPress, onEmailPress }: AlertCardProps) {
  const theme = statusColors(item.status);

  const daysLabel =
    item.days_remaining == null ? '—' : `${item.days_remaining}d`;

  const unitsLabel =
    typeof item.units_remaining === 'number'
      ? `${item.units_remaining} tabs`
      : '—';

  const handleCardClick = () => {
    if (onPress) onPress();
  };

  return (
    <div
      onClick={handleCardClick}
      role={onPress ? 'button' : undefined}
      className={`mb-3 flex items-center justify-between rounded-xl border p-4 text-neutral-900 ${theme.card}`}
      aria-label={`View ${item.medication} for ${item.client.name}, ${item.status}`}
    >
      {/* Left side */}
      <div className="flex items-center">
        {/* Left circle */}
        <div
          className={`mr-3 flex h-12 w-12 items-center justify-center rounded-full ${theme.circleBg}`}
        >
          <span className="text-base">{daysLabel}</span>
        </div>

        {/* Middle text */}
        <div className="max-w-[70%]">
          <p className={`truncate font-semibold ${theme.textPrimary}`}>
            {item.medication}
          </p>

          <p className={`truncate ${theme.textSecondary}`}>
            {item.client.name} · {item.client.service?.name}
          </p>

          <p className="mt-1 truncate text-neutral-600">
            Runout {formatUK(item.runout_date) ?? '—'} · Half{' '}
            {formatUK(item.half_date) ?? '—'}
          </p>

          <p className="mt-0.5 truncate text-neutral-600">
            Remaining: <span className="font-semibold">{unitsLabel}</span>
          </p>
        </div>
      </div>

      {/* Right side */}
      <div className="right-1 flex flex-col items-end">
        {/* Status pill */}
        <div className={`mb-2 rounded-full px-3 py-2 text-xs ${theme.statusPill}`}>
          {item.status.toUpperCase()}
        </div>

        {/* Email GP button */}
        {(item.status === 'critical' || item.status === 'low') && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onEmailPress?.(item);
            }}
            className="rounded-full bg-blue-600 px-3 py-2 text-xs text-white cursor-pointer"
          >
            Email GP
          </button>
        )}
      </div>
    </div>
  );
}
