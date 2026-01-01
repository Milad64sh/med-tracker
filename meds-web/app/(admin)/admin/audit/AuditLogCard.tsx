'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */

import React from 'react';

type AuditLog = {
  id: number;
  action: string;
  entity_type: string;
  entity_id: number;
  metadata: Record<string, any> | null;
  created_at: string;
  actor?: {
    id: number;
    name: string;
    email?: string;
  } | null;
    display?: {
    client_initials?: string | null;
    medication_name?: string | null;
    strength?: string | null;
    form?: string | null;
    title?: string | null;
  } | null;
};

function formatDateTime(iso: string) {
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

function humanizeAction(action: string) {
  // alert.acknowledged -> Alert acknowledged
  return action
    .replace(/\./g, ' ')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function AuditLogCard({ log }: { log: AuditLog }) {
  const actorName = log.actor?.name ?? 'System';
  const time = formatDateTime(log.created_at);

  // const clientId = log.metadata?.client_id;
  // const note =
  //   log.metadata?.note ||
  //   log.metadata?.ack_note ||
  //   log.metadata?.snooze_note ||
  //   null;

function renderMetadata(metadata: Record<string, any>) {
  if (!metadata) return null;

  const before = metadata.before ?? null;
  const after = metadata.after ?? null;
  // Helper: format ISO date nicely
  const fmt = (v: any) => {
    if (v === null || v === undefined || v === '') return '—';
    if (typeof v === 'string') {
      // format ISO timestamps
      const d = new Date(v);
      if (!Number.isNaN(d.getTime()) && v.includes('T')) {
        return d.toLocaleString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      }
    }
    return String(v);
  };

  // Build “changes” rows
  const changes: { label: string; from?: string | null; to?: string | null }[] = [];

  const pushChange = (label: string, fromVal: any, toVal: any) => {
    const from = fmt(fromVal);
    const to = fmt(toVal);
    // show row only if something meaningful
    if (from === null && to === null) return;
    if (from === to) return;
    changes.push({ label, from, to });
  };

  // Known fields for snooze actions
  pushChange('Snoozed until', before?.snoozed_until, after?.snoozed_until);
  pushChange('Snoozed by (user id)', before?.snoozed_by, after?.snoozed_by);
  pushChange('Snooze note', before?.snooze_note, after?.snooze_note);

  // If you also log acknowledge fields in other actions, include them too:
  pushChange('Acknowledged at', before?.acknowledged_at, after?.acknowledged_at);
  pushChange('Acknowledged by (user id)', before?.acknowledged_by, after?.acknowledged_by);
  pushChange('Acknowledge note', before?.ack_note, after?.ack_note);

  // Also show a top-level note if present (your acknowledge uses top-level note)
  const topNote = fmt(metadata.note);
  if (topNote) {
    changes.unshift({ label: 'Note', from: null, to: topNote });
  }

  // Nothing useful? Render nothing.
  if (!changes.length) return null;


  return (
    <div className="mt-3 rounded-lg bg-neutral-50 px-3 py-2 text-xs text-neutral-800">
      <p className="mb-2 font-semibold text-neutral-700">Details</p>

      <div className="space-y-2">
        {changes.map((c, i) => (
          <div key={i} className="flex flex-col gap-0.5">
            <div className="font-medium text-neutral-600">{c.label}</div>

            {c.from !== undefined && c.to !== undefined ? (
              <div className="text-neutral-900">
                <span className="text-neutral-500">From:</span> {c.from ?? '—'}{' '}
                <span className="text-neutral-500">→ To:</span> {c.to ?? '—'}
              </div>
            ) : (
              <div className="text-neutral-900">{c.to ?? '—'}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

  async function downloadPdf(logId: number) {
    const res = await fetch(`/api/audit-logs/${logId}/pdf`);
    if (!res.ok) {
    const text = await res.text().catch(() => '');
    console.error('PDF download failed:', res.status, text);
    alert(`PDF download failed (${res.status}). Check console for details.`);
    return;
  }
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${logId}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();

    window.URL.revokeObjectURL(url);
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 text-sm">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        
        <div>
          <p className="font-semibold text-neutral-900">
            {actorName}{' '}
            <span className="font-normal text-neutral-700">
              {humanizeAction(log.action)}
            </span>
          </p>

          <p className="mt-1 text-xs text-neutral-600">
            {log.display?.title?.trim() || `${log.entity_type} #${log.entity_id}`}
          </p>

        </div>

        <div className="text-right">
          <p className="text-xs text-neutral-600 mb-4">{time}</p>
        <button
          type="button"
          onClick={() => downloadPdf(log.id)}
          className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-800 hover:bg-neutral-50 cursor-pointer"
        >
          Download PDF
        </button>
        </div>

      </div>

      {/* Optional note */}
      {/* {note && (
        <div className="mt-3 rounded-lg bg-neutral-50 px-3 py-2 text-xs text-neutral-800">
          <span className="font-semibold">Note:</span> {note}
        </div>
      )} */}

      {/* Metadata (collapsed summary) */}
      {log.metadata && (
        <details className="mt-3">
          <summary className="cursor-pointer text-xs font-semibold text-neutral-700 hover:underline">
            View technical details
          </summary>
{           log.metadata && renderMetadata(log.metadata)}
        </details>
      )}
    </div>
  );
}
