'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */

import React from 'react';
import { AppShell } from '@/app/components/AppShell';
import { useAuth } from '@/app/hooks/useAuth';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { fetcher } from '@/lib/api';

import type { Paginated } from '@/app/features/dashboard/types';
import { AuditFilters } from './AuditFilters';
import { AuditLogCard } from './AuditLogCard';

export type AuditLog = {
  id: number;
  actor_user_id: number | null;
  action: string;
  entity_type: string;
  entity_id: number;
  metadata: Record<string, any> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string; // ISO
  updated_at: string; // ISO
  actor?: {
    id: number;
    name: string;
    email?: string;
  } | null;
};

export default function AdminAuditLogsClient() {
  const router = useRouter();
  const sp = useSearchParams();

  // --- read filters from query string (matches backend controller keys) ---
  const page = Math.max(1, Number(sp.get('page') ?? '1') || 1);
  const userName = sp.get('user_name') ?? '';
  const action = sp.get('action') ?? '';
  const entityType = sp.get('entity_type') ?? '';
  const clientId = sp.get('client_id') ?? '';
  const dateFrom = sp.get('date_from') ?? '';
  const dateTo = sp.get('date_to') ?? '';

  const qs = new URLSearchParams();
  qs.set('page', String(page));
  if (userName) qs.set('user_name', userName);
  if (action) qs.set('action', action);
  if (entityType) qs.set('entity_type', entityType);
  if (clientId) qs.set('client_id', clientId);
  if (dateFrom) qs.set('date_from', dateFrom);
  if (dateTo) qs.set('date_to', dateTo);

  const queryString = qs.toString();

  const { isAdmin, isLoading: authLoading } = useAuth();

  React.useEffect(() => {
    if (!authLoading && !isAdmin) router.replace('/dashboard');
  }, [authLoading, isAdmin, router]);

  const { data, isLoading, error, isFetching, refetch } = useQuery<Paginated<AuditLog>>({
    queryKey: ['audit-logs', queryString],
    queryFn: () => fetcher(`/api/audit-logs?${queryString}`),
    enabled: isAdmin,
    retry: false,
    staleTime: 30_000,
  });

  // Laravel paginator shape: { data: [], current_page, last_page, total, ... }
  const list = (data as any)?.data ?? [];
  const current = (data as any)?.current_page ?? page;
  const last = (data as any)?.last_page ?? 1;

  const goPage = (p: number) => {
    const next = Math.min(Math.max(1, p), last || 1);

    // keep existing filters when paging
    const nextQs = new URLSearchParams(sp.toString());
    nextQs.set('page', String(next));
    router.push(`/admin/audit?${nextQs.toString()}`);
  };

  return (
    <AppShell>
      <button
        type="button"
        onClick={() => refetch()}
        disabled={isFetching}
        className="rounded-xl bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-60"
      >
        {isFetching ? 'Refreshing…' : 'Refresh'}
      </button>

      <div className="mb-4 flex items-center justify-between gap-3">
        
        <div className="w-full">
          <h1 className="text-2xl font-bold text-neutral-900">Audit activity</h1>
          <p className="mt-1 text-sm text-neutral-600">
            Admin-only audit trail of key actions (acknowledge, snooze, restock, edits) — who did what, when, and the
            recorded metadata.
          </p>

          {/* Filters (reads/writes query string) */}
          <div className="mt-3">
            <AuditFilters />
          </div>
        </div>
      </div>

      {isLoading && <div className="py-10 text-sm text-neutral-600">Loading audit logs…</div>}

      {error && !isLoading && (
        <div className="py-10">
          <p className="mb-3 text-sm text-red-600">Failed to load audit logs.</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="rounded-xl bg-neutral-900 px-4 py-2 text-sm text-white"
          >
            Retry
          </button>
        </div>
      )}

      {!isLoading && !error && (
        <>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-neutral-600">
              Page <span className="font-semibold text-neutral-900">{current}</span> of{' '}
              <span className="font-semibold text-neutral-900">{last}</span>
              {typeof (data as any)?.total === 'number' ? (
                <>
                  {' '}
                  • <span className="font-semibold text-neutral-900">{(data as any).total}</span> total
                </>
              ) : null}
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => goPage(current - 1)}
                disabled={current <= 1}
                className="rounded-xl bg-neutral-200 px-3 py-2 text-sm font-semibold text-neutral-800 hover:bg-neutral-300 disabled:opacity-60"
              >
                Prev
              </button>
              <button
                type="button"
                onClick={() => goPage(current + 1)}
                disabled={current >= last}
                className="rounded-xl bg-neutral-200 px-3 py-2 text-sm font-semibold text-neutral-800 hover:bg-neutral-300 disabled:opacity-60"
              >
                Next
              </button>
            </div>
          </div>

          {list.length === 0 ? (
            <p className="mt-8 text-center text-sm text-neutral-600">No audit activity yet.</p>
          ) : (
            <div className="space-y-3 pb-8">
              {list.map((log: AuditLog) => (
                <AuditLogCard key={log.id} log={log} />
              ))}
            </div>
          )}
        </>
      )}
    </AppShell>
  );
}
