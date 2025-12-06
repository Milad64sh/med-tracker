'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useMemo, useState } from 'react';
import { useDashboard } from '@/app/features/dashboard/queries';
import { KpiTile } from '@/app/components/KpiTile';
import { StatusChips } from '@/app/components/StatusChips';
import { AddChips } from '@/app/components/AddChips';
import { AlertCard } from '@/app/components/AlertCard';
import type { AlertRow } from '@/app/features/dashboard/types';
import { AppShell } from '@/app/components/AppShell';
import { fetcher } from '@/lib/api';

type StatusFilter = 'all' | 'critical' | 'low' | 'ok';

export default function DashboardPage() {
  const { data, isLoading, isFetching, refetch } = useDashboard();
  const [status, setStatus] = useState<StatusFilter>('all');

  const alerts = useMemo(() => {
    const rows = data?.topAlerts ?? [];
    if (status === 'all') return rows;
    return rows.filter((r: AlertRow) => r.status === status);
  }, [data, status]);

  const handleEmailPress = async (item: AlertRow) => {
    console.log('Alert item client:', item.client);
    const gpEmail = item.client?.gp_email;

    if (!gpEmail) {
      if (typeof window !== 'undefined') {
        window.alert(
          'No GP email is set for this client. Please update their details first.'
        );
      }
      return;
    }

    try {
      await fetcher('/api/alerts/email-gp', {
        method: 'POST',
        body: {
          gp_email: gpEmail,
          client_name: item.client.name,
          service_name: item.client.service?.name ?? null,
          medication: item.medication,
          status: item.status,
          units_remaining: item.units_remaining,
          half_date: item.half_date,
          runout_date: item.runout_date,
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

  return (
    <AppShell>
      {/* Outer wrapper */}
      <div className="w-full max-w-full min-w-0 overflow-x-hidden px-2 md:px-0">
        {/* Header */}
        <div className="mb-2 flex items-center justify-between gap-2">
          <h1 className="text-xl font-bold text-neutral-900 md:text-2xl">
            Medication Dashboard
          </h1>
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="shrink-0 rounded-lg border border-neutral-300 px-3 py-1 text-xs text-neutral-800 disabled:opacity-60 md:text-sm cursor-pointer"
          >
            {isFetching ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>

        {/* Quick Actions */}
        <section className="mt-6">
          <h2 className="mb-2 text-lg font-semibold text-neutral-900">
            Quick Actions
          </h2>

          {/* horizontal scroll without extra side padding */}
          <div className="overflow-x-auto">
            <div className="flex gap-2 pb-2">
              <AddChips
                items={[
                  {
                    key: 'add-med',
                    label: '➕ Restock Medication',
                    href: '/courses/restock',
                    color: 'emerald',
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
          <h2 className="mb-2 text-lg font-semibold text-neutral-900">
            What needs attention today
          </h2>

          {/* 2x2 grid on small screens, 4 in a row on md+ */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
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
          <p className="text-sm text-neutral-700">
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
          <h2 className="mb-2 text-lg font-semibold text-neutral-900">
            Urgent Alerts
          </h2>

          {alerts && alerts.length > 0 ? (
            <div className="space-y-3">
              {alerts.map((item) => (
                <AlertCard
                  key={String(item.course_id)}
                  item={item}
                  onPress={() => {
                    // later: navigate to details
                  }}
                  onEmailPress={() => handleEmailPress(item)}
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
