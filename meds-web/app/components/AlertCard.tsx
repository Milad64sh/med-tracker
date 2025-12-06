'use client';

import React from 'react';
import type { AlertRow } from '../features/dashboard/types';
import { formatUK } from '../utils/formatUK';

function statusColors(status: AlertRow['status']) {
  switch (status) {
    case 'critical':
      return 'bg-red-100 text-red-800';
    case 'low':
      return 'bg-amber-100 text-amber-800';
    case 'ok':
      return 'bg-emerald-100 text-emerald-800';
    default:
      return 'bg-neutral-100 text-neutral-800';
  }
}

type AlertCardProps = {
  item: AlertRow;
  onPress?: () => void;
  onEmailPress?: (item: AlertRow) => void;
};

export function AlertCard({ item, onPress, onEmailPress }: AlertCardProps) {
  console.log(
    'AlertCard mounted for',
    item.medication,
    'has onEmailPress?',
    !!onEmailPress
  );

  const daysLabel =
    item.days_remaining == null ? '—' : `${item.days_remaining}d`;

  const unitsLabel =
    typeof item.units_remaining === 'number'
      ? `${item.units_remaining} tabs`
      : '—';

  const badge = statusColors(item.status);
  const [bgClass] = badge.split(' ');

  const handleCardClick = () => {
    if (onPress) onPress();
  };

  return (
    <div
      onClick={handleCardClick}
      role={onPress ? 'button' : undefined}
      className="mb-3 flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-4 text-neutral-900 "
      aria-label={`View ${item.medication} for ${item.client.name}, ${item.status}`}
    >
      {/* Left side */}
      <div className="flex items-center">
        {/* Left circle */}
        <div
          className={`mr-3 flex h-12 w-12 items-center justify-center rounded-full ${bgClass}`}
        >
          <span className="text-base">{daysLabel}</span>
        </div>

        {/* Middle */}
        <div className="max-w-[70%]">
          <p className="truncate font-semibold">
            {item.medication}
          </p>

          <p className="truncate text-neutral-700">
            {item.client.name} · {item.client.service?.name}
          </p>

          <p className="mt-1 truncate text-neutral-500">
            Runout {formatUK(item.runout_date) ?? '—'} · Half{' '}
            {formatUK(item.half_date) ?? '—'}
          </p>

          <p className="mt-0.5 truncate text-neutral-500">
            Remaining:{' '}
            <span className="font-semibold">{unitsLabel}</span>
          </p>
        </div>
      </div>

      {/* Right side */}
      <div className="right-1 flex flex-col items-end">
        {/* Status pill */}
        <div className={`mb-2 rounded-full px-3 py-2 ${badge}`}>
          <span className="text-xs">
            {item.status.toUpperCase()}
          </span>
        </div>

        {/* Email button for LOW + CRITICAL */}
        {(item.status === 'critical' || item.status === 'low') && (
          <button
            type="button"
            onClick={(event) => {
              console.log(
                'AlertCard: Email GP button pressed for',
                item.medication
              );
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
