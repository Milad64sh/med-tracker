'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState } from 'react';
import type { AlertRow } from '../features/dashboard/types';
import { formatUK } from '../utils/formatUK';

export type ClientAlertGroup = {
  client: AlertRow['client'];
  alerts: AlertRow[];
};

// Derive the status based on days_remaining, falling back to the existing status
function computeAlertStatus(alert: AlertRow): AlertRow['status'] {
  const days = alert.days_remaining;

  if (typeof days === 'number') {
    if (days < 3) return 'critical';
    if (days < 8) return 'low';
    return 'ok';
  }

  // If days_remaining is null/undefined, trust whatever came from backend
  return alert.status ?? 'unknown';
}

// Aggregate status for the whole card (per client)
function groupStatus(alerts: AlertRow[]): AlertRow['status'] {
  const derived = alerts.map(computeAlertStatus);

  if (derived.some((s) => s === 'critical')) return 'critical';
  if (derived.some((s) => s === 'low')) return 'low';
  if (derived.some((s) => s === 'ok')) return 'ok';
  return 'unknown';
}

function statusColors(status: AlertRow['status']) {
  switch (status) {
    case 'critical':
      return {
        card: 'border-red-100 bg-red-50',
        title: 'text-red-800',
        subtitle: 'text-red-700',
        pill: 'bg-red-600 text-white',
      };
    case 'low':
      return {
        card: 'border-amber-100 bg-amber-50',
        title: 'text-amber-800',
        subtitle: 'text-amber-700',
        pill: 'bg-amber-500 text-white',
      };
    case 'ok':
      return {
        card: 'border-emerald-100 bg-emerald-50',
        title: 'text-emerald-800',
        subtitle: 'text-emerald-700',
        pill: 'bg-emerald-500 text-white',
      };
    default:
      return {
        card: 'border-neutral-200 bg-white',
        title: 'text-neutral-900',
        subtitle: 'text-neutral-700',
        pill: 'bg-neutral-500 text-white',
      };
  }
}

type AlertCardProps = {
  group: ClientAlertGroup;
  onPress?: (group: ClientAlertGroup) => void;
  onEmailPress?: (group: ClientAlertGroup) => void;
};

export function AlertCard({ group, onPress, onEmailPress }: AlertCardProps) {
  const [expanded, setExpanded] = useState(false);

  const status = groupStatus(group.alerts);
  const theme = statusColors(status);

  const totalMeds = group.alerts.length;
  const thisThese = totalMeds === 1 ? 'This' : 'These';
  const medWord = totalMeds === 1 ? 'medication is' : 'medications are';

  const initials =
    (group.client as any).initials || group.client.name || 'Client';

  const derivedStatuses = group.alerts.map(computeAlertStatus);
  const criticalCount = derivedStatuses.filter((s) => s === 'critical').length;
  const lowCount = derivedStatuses.filter((s) => s === 'low').length;
  const okCount = derivedStatuses.filter((s) => s === 'ok').length;

  const headerLine =
    status === 'critical'
      ? `${thisThese} ${medWord} at critical level for `
      : status === 'low'
      ? `${thisThese} ${medWord} running low for `
      : `${thisThese} ${medWord} OK for `;

  const handleToggle = () => {
    setExpanded((prev) => !prev);
    onPress?.(group);
  };

  const handleEmailClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onEmailPress?.(group);
  };

  return (
    <div
      className={`mb-3 rounded-xl border p-4 text-sm ${theme.card}`}
      role="group"
      aria-label={`Medication alerts for ${initials}`}
    >
      {/* Header row: summary + status + Email GP */}
      <div
        className="flex cursor-pointer items-start justify-between gap-3"
        onClick={handleToggle}
      >
        <div className="flex-1">
          <p className={`font-semibold ${theme.title}`}>
            {headerLine}
            <span className="underline">{initials}</span>
          </p>

          <p className={`mt-1 text-xs ${theme.subtitle}`}>
            {totalMeds} {totalMeds === 1 ? 'medication' : 'medications'} —{' '}
            {criticalCount > 0 && `${criticalCount} critical`}
            {criticalCount > 0 && (lowCount > 0 || okCount > 0) && ', '}
            {lowCount > 0 && `${lowCount} low`}
            {lowCount > 0 && okCount > 0 && ', '}
            {okCount > 0 && `${okCount} ok`}
            {criticalCount === 0 && lowCount === 0 && okCount === 0 && 'status unknown'}
            .
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${theme.pill}`}
          >
            {status.toUpperCase()}
          </span>

          {/* Single Email GP button per client */}
          <button
            type="button"
            onClick={handleEmailClick}
            className="rounded-full bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white"
          >
            Email GP
          </button>
        </div>
      </div>

      {/* Expand/collapse arrow */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setExpanded((prev) => !prev);
        }}
        className="mt-2 text-xs text-neutral-600 underline cursor-pointer"
      >
        {expanded ? 'Hide medication details' : 'Show medication details'}
      </button>

      {/* Expanded list of meds for this client */}
      {expanded && (
        <div className="mt-3 space-y-2">
          {group.alerts.map((alert) => {
            const derivedStatus = computeAlertStatus(alert);

            const daysLabel =
              alert.days_remaining == null
                ? '—'
                : `${alert.days_remaining} day${
                    alert.days_remaining === 1 ? '' : 's'
                  } remaining`;

            const unitsLabel =
              typeof alert.units_remaining === 'number'
                ? `${alert.units_remaining} units`
                : 'Units unknown';

            let pillClass = '';
            let pillText = '';

            if (derivedStatus === 'critical') {
              pillClass = 'bg-red-600 text-white';
              pillText = 'CRITICAL';
            } else if (derivedStatus === 'low') {
              pillClass = 'bg-amber-500 text-white';
              pillText = 'LOW';
            } else if (derivedStatus === 'ok') {
              pillClass = 'bg-emerald-500 text-white';
              pillText = 'OK';
            }

            return (
              <div
                key={alert.course_id ?? `${alert.client.id}-${alert.medication}`}
                className="flex items-start justify-between rounded-lg bg-white/60 px-3 py-2 text-xs text-neutral-900"
              >
                <div className="pr-2">
                  <p className="font-semibold">{alert.medication}</p>
                  <p className="mt-0.5 text-[11px] text-neutral-700">
                    {daysLabel} — runout {formatUK(alert.runout_date) ?? '—'}
                  </p>
                  <p className="mt-0.5 text-[11px] text-neutral-600">
                    Half date: {formatUK(alert.half_date) ?? '—'}
                  </p>
                </div>

                <div className="flex flex-col items-end text-[11px] text-neutral-700">
                  <span>{unitsLabel}</span>
                  {pillText && (
                    <span
                      className={`mt-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${pillClass}`}
                    >
                      {pillText}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
