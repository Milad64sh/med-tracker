'use client';

import React from 'react';
import { AppShell } from '@/app/components/AppShell';
import { useAuth } from '@/app/hooks/useAuth';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { fetcher } from '@/lib/api';

import type { Paginated, RestockLog } from '@/app/features/restocks/types';
import { RestockLogCard } from '@/app/components/restocks/RestockLogCard';
import { RestockFilters } from '@/app/components/restocks/RestockFilters';


export default function AdminRestockLogsPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const page = Math.max(1, Number(sp.get('page') ?? '1') || 1);
  const userId = sp.get('user_id') ?? '';
const clientId = sp.get('client_id') ?? '';
const dateFrom = sp.get('date_from') ?? '';
const dateTo = sp.get('date_to') ?? '';

const qs = new URLSearchParams();
qs.set('page', String(page));
if (userId) qs.set('user_id', userId);
if (clientId) qs.set('client_id', clientId);
if (dateFrom) qs.set('date_from', dateFrom);
if (dateTo) qs.set('date_to', dateTo);

const queryString = qs.toString();


  const { isAdmin, isLoading: authLoading } = useAuth();

  React.useEffect(() => {
    if (!authLoading && !isAdmin) router.replace('/dashboard');
  }, [authLoading, isAdmin, router]);

  const { data, isLoading, error, isFetching, refetch } = useQuery<Paginated<RestockLog>>({
    queryKey: ['restock-logs', queryString],
    queryFn: () => fetcher(`/api/restock-logs?${queryString}`),
    enabled: isAdmin,
    retry: false,
    staleTime: 30_000,
    });


  const list = data?.data ?? [];
  const current = data?.current_page ?? page;
  const last = data?.last_page ?? 1;

  const goPage = (p: number) => {
    const next = Math.min(Math.max(1, p), last || 1);
    router.push(`/admin/restocks?page=${next}`);
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
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Restock activity</h1>
          <p className="mt-1 text-sm text-neutral-600">
            Admin-only log of who restocked what, when, and the before/after values.
          </p>
          <RestockFilters />

        </div>

      </div>


      {isLoading && (
        <div className="py-10 text-sm text-neutral-600">Loading restock logs…</div>
      )}

      {error && !isLoading && (
        <div className="py-10">
          <p className="mb-3 text-sm text-red-600">Failed to load restock logs.</p>
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
              {typeof data?.total === 'number' ? (
                <>
                  {' '}
                  • <span className="font-semibold text-neutral-900">{data.total}</span> total
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
            <p className="mt-8 text-center text-sm text-neutral-600">No restock activity yet.</p>
          ) : (
            <div className="space-y-3 pb-8">
              {list.map((log) => (
                <RestockLogCard key={log.id} log={log} />
              ))}
            </div>
          )}
        </>
      )}
    </AppShell>
  );
}
