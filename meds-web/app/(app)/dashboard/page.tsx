'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useMemo, useState } from 'react';
import { useDashboard } from '@/app/features/dashboard/queries';
import { KpiTile } from '@/app/components/KpiTile';
import { StatusChips } from '@/app/components/StatusChips';
import { AddChips } from '@/app/components/AddChips';
import { AlertCard } from '@/app/components/AlertCard';
import type { AlertRow, ClientAlertGroup } from '@/app/features/dashboard/types';
import { AppShell } from '@/app/components/AppShell';
import { fetcher } from '@/lib/api';

type StatusFilter = 'all' | 'critical' | 'low' | 'ok';

/**
 * Group alerts by client so we show one card per client
 * (each card can contain multiple medications).
 */
function groupAlertsByClient(alerts: AlertRow[]): ClientAlertGroup[] {
  const byClient = new Map<string, ClientAlertGroup>();

  alerts.forEach((alert) => {
    if (!alert.client) return;

    const clientId = String(alert.client.id);
    const existing = byClient.get(clientId);

    if (existing) {
      existing.alerts.push(alert);
    } else {
      byClient.set(clientId, {
        client: alert.client,
        alerts: [alert],
      });
    }
  });

  return Array.from(byClient.values());
}

export default function DashboardPage() {
  const { data, isLoading, isFetching, refetch } = useDashboard();
  const [status, setStatus] = useState<StatusFilter>('all');

  // 1) Filter by status
  const filteredAlerts = useMemo(() => {
    const rows = data?.alerts ?? [];
    if (status === 'all') return rows;
    return rows.filter((r: AlertRow) => r.status === status);
  }, [data, status]);

  // 2) Group by client (for all statuses; grouping behaviour is mainly useful
  //    for critical + low, but it also works fine for OK if you filter to it)
  const groupedAlerts = useMemo(
    () => groupAlertsByClient(filteredAlerts),
    [filteredAlerts]
  );

  /**
   * Send a single email per client, containing all meds in the group.
   */
  const handleEmailPress = async (group: ClientAlertGroup) => {
    const client: any = group.client as any;
    const gpEmail = (group.client as any)?.gp_email;

    if (!gpEmail) {
      if (typeof window !== 'undefined') {
        window.alert(
          'No GP email is set for this client. Please update their details first.'
        );
      }
      return;
    }

    const clientId = client?.id;
    if (!clientId) {
      if (typeof window !== 'undefined') {
        window.alert('Client ID is missing. Please refresh and try again.');
      }
      return;
    }

    try {
      await fetcher('/api/alerts/email-gp', {
        method: 'POST',
        body: {
          gp_email: gpEmail,
          client_id: clientId,
          client_name: group.client.initials ?? group.client.name,
          dob: client?.dob ?? 'Unknown', 
          service_name: group.client.service?.name ?? null,
          medications: group.alerts.map((alert) => ({
            medication: alert.medication,
            status: alert.status,
            units_remaining: alert.units_remaining,
            days_remaining: alert.days_remaining,
            half_date: alert.half_date,
            runout_date: alert.runout_date,
          })),
        },
      });

      if (typeof window !== 'undefined') {
        window.alert('The medical practice has been notified.');
      }
    } catch (e: any) {
      console.log('Email GP error', e);
      if (typeof window !== 'undefined') {
        window.alert(
          e?.message || 'Could not send email. Please try again.'
        );
      }
    }
  };

  const handleAcknowledge = async (courseId: number, note?: string | null) => {
  try {
    await fetcher(`/api/alerts/${courseId}/acknowledge`, {
      method: 'POST',
      body: { note: note ?? null },
    });
    await refetch();
  } catch (e: any) {
    console.log('Acknowledge error', e);
    window.alert(e?.message || 'Could not acknowledge. Please try again.');
  }
};

const handleSnooze = async (
  courseId: number,
  untilIso: string,
  note?: string | null
) => {
  try {
    await fetcher(`/api/alerts/${courseId}/snooze`, {
      method: 'POST',
      body: { until: untilIso, note: note ?? null },
    });
    await refetch();
  } catch (e: any) {
    console.log('Snooze error', e);
    window.alert(e?.message || 'Could not snooze. Please try again.');
  }
};

const handleUnsnooze = async (courseId: number) => {
  try {
    await fetcher(`/api/alerts/${courseId}/unsnooze`, {
      method: 'POST',
      body: {},
    });
    await refetch();
  } catch (e: any) {
    console.log('Unsnooze error', e);
    window.alert(e?.message || 'Could not unsnooze. Please try again.');
  }
};


  return (
    <AppShell>
      {/* Outer wrapper */}
      <div className="w-full max-w-5xl min-w-0 mx-auto overflow-x-hidden px-3 pb-6 sm:px-4">
        {/* Header */}
        <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-lg font-bold text-neutral-900 sm:text-xl md:text-2xl">
            Medication Dashboard
          </h1>
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center justify-center self-start rounded-lg border border-neutral-300 px-3 py-1 text-xs text-neutral-800 disabled:opacity-60 sm:self-auto sm:text-sm cursor-pointer"
          >
            {isFetching ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>

        {/* Quick Actions */}
        <section className="mt-4">
          <h2 className="mb-2 text-base font-semibold text-neutral-900 sm:text-lg">
            Quick Actions
          </h2>

          {/* horizontal scroll without extra side padding */}
          <div className="overflow-x-auto">
            <div className="flex gap-2 pb-2">
              <AddChips
                items={[
                  {
                    key: 'restock-med',
                    label: '➕ Restock Medication',
                    href: '/courses/restock',
                    color: 'emerald',
                  },
                    {
                    key: 'adjust-stock',
                    label: '🔧 Adjust Stock',
                    href: '/courses/adjust-stock',
                    color: 'amber',
                  },
                  {
                    key: 'add-client',
                    label: '➕ Add Client',
                    href: '/clients/newClient',
                    color: 'sky',
                  },
                  {
                    key: 'add-service',
                    label: '➕ Add Service',
                    href: '/services/newService',
                    color: 'violet',
                  },
                ]}
              />
            </div>
          </div>
        </section>

        {/* KPIs */}
        <section className="mt-6">
          <h2 className="mb-2 text-base font-semibold text-neutral-900 sm:text-lg">
            What needs attention today
          </h2>

          {/* 1 per row on phones, 2 on small screens, 4 on large */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <KpiTile
              label="Critical (Less than 2 days)"
              value={data?.kpis.critical ?? (isLoading ? '—' : 0)}
              intent="critical"
              onPress={() => setStatus('critical')}
            />
            <KpiTile
              label="Low (3 to 7 days)"
              value={data?.kpis.low ?? (isLoading ? '—' : 0)}
              intent="low"
              onPress={() => setStatus('low')}
            />
            <KpiTile
              label="OK (More than 8 days)"
              value={data?.kpis.ok ?? (isLoading ? '—' : 0)}
              intent="ok"
              onPress={() => setStatus('ok')}
            />
            <KpiTile
              label="Pending Orders"
              value={data?.kpis.pendingOrders ?? (isLoading ? '—' : 0)}
            />
          </div>
        </section>

        {/* Next schedule */}
        <section className="mt-3">
          <p className="text-xs text-neutral-700 sm:text-sm">
            Next notification:{' '}
            {data?.kpis.nextScheduleAt
              ? new Date(data.kpis.nextScheduleAt).toLocaleString()
              : '—'}
          </p>
        </section>

        {/* Filters */}
        <section className="mt-4">
          <StatusChips value={status} onChange={setStatus} />
        </section>

        {/* Alerts list */}
        <section className="mt-4">
          <h2 className="mb-2 text-base font-semibold text-neutral-900 sm:text-lg">
            Urgent Alerts
          </h2>

          {groupedAlerts && groupedAlerts.length > 0 ? (
            <div className="space-y-3 max-w-full">
              {groupedAlerts.map((group) => (
                <AlertCard
                  key={String(group.client.id)}
                  group={group}
                  onPress={() => {
                    // later: navigate to a detailed client/meds page if needed
                  }}
                  onEmailPress={handleEmailPress}
                  onAcknowledge={handleAcknowledge}
                  onSnooze={handleSnooze}
                  onUnsnooze={handleUnsnooze}
                />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-neutral-600">
                {isLoading ? 'Loading…' : 'No alerts for this filter 🎉'}
              </p>
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
