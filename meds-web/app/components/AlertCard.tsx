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

  onAcknowledge?: (courseId: number, note?: string | null) => Promise<void> | void;
  onSnooze?: (courseId: number, untilIso: string, note?: string | null) => Promise<void> | void;
  onUnsnooze?: (courseId: number) => Promise<void> | void;
};

export function AlertCard({ group, onPress, onEmailPress, onAcknowledge, onSnooze, onUnsnooze }: AlertCardProps) {
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

  const [now, setNow] = useState<number | null>(null);

  React.useEffect(() => {
    setNow(Date.now());
  }, []);


  const handleToggle = () => {
    setExpanded((prev) => !prev);
    onPress?.(group);
  };

  const handleEmailClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onEmailPress?.(group);
  };

  function formatDateTime(iso: string | null | undefined) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

function isSnoozed(alert: AlertRow, nowMs: number | null) {
  const until = alert.snooze?.snoozed_until;
  if (!until || nowMs == null) return false;
  return new Date(until).getTime() > nowMs;
}



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
          {/* Status pill */}
          <span
            className={`flex h-6 w-24 items-center justify-center rounded-full text-xs font-semibold ${theme.pill}`}
          >
            {status.toUpperCase()}
          </span>

          {/* Email GP button (space always reserved) */}
          <div className="h-6 w-24">
            {(status === 'low' || status === 'critical') && !!onEmailPress && (
              <button
                type="button"
                onClick={handleEmailClick}
                className="flex h-full w-full items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white hover:bg-blue-700 transition"
              >
                Email GP
              </button>
            )}
          </div>
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
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{alert.medication}</p>

                    {typeof alert.units_remaining === 'number' && (
                      <span className="rounded-full bg-neutral-900/10 px-2 py-0.5 text-[10px] font-semibold text-neutral-800">
                        {alert.units_remaining} left
                      </span>
                    )}
                  </div>

                  <p className="mt-0.5 text-[11px] text-neutral-700">
                    {daysLabel} — runout {formatUK(alert.runout_date) ?? '—'}
                  </p>

                  <p className="mt-0.5 text-[11px] text-neutral-600">
                    Half date: {formatUK(alert.half_date) ?? '—'}
                  </p>
                </div>


                <div className="flex flex-col items-end gap-1 text-[11px] text-neutral-700">
                  {pillText && (
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${pillClass}`}>
                      {pillText}
                    </span>
                  )}

                  {/* Ack / Snooze UI (only for low/critical) */}
                  {(derivedStatus === 'low' || derivedStatus === 'critical') && (
                    <div className="mt-1 flex flex-col items-end gap-1">
                      {/* Acknowledged label */}
                      {alert.ack?.acknowledged_at ? (
                        <p className="max-w-[180px] text-right text-[10px] text-neutral-600">
                          Acknowledged by {alert.ack.acknowledged_by_name ?? '—'} •{' '}
                          {formatDateTime(alert.ack.acknowledged_at) ?? '—'}
                        </p>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAcknowledge?.(alert.course_id);
                          }}
                          className="rounded-full border border-neutral-300 px-2 py-0.5 text-[10px] font-semibold text-neutral-800 hover:bg-neutral-100 transition cursor-pointer"
                        >
                          Acknowledge
                        </button>
                      )}

                      {/* Snooze / Unsnooze */}
                      {isSnoozed(alert, now) ? (
                        <div className="flex flex-col items-end gap-1">
                          <p className="text-[10px] text-neutral-600">
                            Snoozed until {formatDateTime(alert.snooze?.snoozed_until) ?? '—'}
                          </p>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onUnsnooze?.(alert.course_id);
                            }}
                            className="rounded-full border border-neutral-300 px-2 py-0.5 text-[10px] font-semibold text-neutral-800 hover:bg-neutral-100 transition cursor-pointer"
                          >
                            Unsnooze
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              // quick snooze 24h
                              const until = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
                              onSnooze?.(alert.course_id, until);
                            }}
                            className="rounded-full border border-neutral-300 px-2 py-0.5 text-[10px] font-semibold text-neutral-800 hover:bg-neutral-100 transition cursor-pointer"
                          >
                            Snooze 24h
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              // quick snooze 7d
                              const until = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
                              onSnooze?.(alert.course_id, until);
                            }}
                            className="rounded-full border border-neutral-300 px-2 py-0.5 text-[10px] font-semibold text-neutral-800 hover:bg-neutral-100 transition cursor-pointer"
                          >
                            7d
                          </button>
                        </div>
                      )}
                    </div>
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
