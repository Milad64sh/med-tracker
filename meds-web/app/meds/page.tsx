'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import React from 'react';
import { AppShell } from '../components/AppShell';
import { useCourses, useDeleteCourse } from '../features/courses/queries';
import { useClients } from '../features/clients/queries';
import type { Client } from '../features/dashboard/types';
import { MedicationCard } from '../components/meds/medicationCard';
import { useRouter } from 'next/navigation';

type CourseWithRelations = any; 

// Small chip component for the filter
const ClientFilterChip: React.FC<{
  label: string;
  selected: boolean;
  onClick: () => void;
}> = ({ label, selected, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`mr-2 mb-2 rounded-full border px-3 py-1.5 text-sm cursor-pointer ${
      selected
        ? 'bg-emerald-500 border-emerald-500 text-white font-medium'
        : 'bg-white border-neutral-300 text-neutral-800'
    }`}
  >
    {label}
  </button>
);

export default function MedsPage() {
  const router = useRouter();

  const { data, isLoading, error, refetch, isFetching } = useCourses();
  const del = useDeleteCourse();

  const {
    data: clientsData,
    isLoading: loadingClients,
    error: clientsError,
  } = useClients();

  const [clientFilter, setClientFilter] = React.useState<'all' | number>('all');
  const [filterOpen, setFilterOpen] = React.useState(false);

  // Normalize meds list
  const raw = Array.isArray(data) ? data : (data as any)?.data ?? [];
  const list: CourseWithRelations[] = raw as CourseWithRelations[];

  // Normalize clients
  const clientsRaw = Array.isArray(clientsData)
    ? clientsData
    : (clientsData as any)?.data ?? [];
  const clientOptions: Client[] = clientsRaw as Client[];

  // Filtered meds list
  const filteredList = React.useMemo(
    () =>
      clientFilter === 'all'
        ? list
        : list.filter((it: any) => {
            const cid =
              typeof it.client_id === 'string'
                ? Number(it.client_id)
                : it.client_id;
            return cid === clientFilter;
          }),
    [list, clientFilter]
  );

  return (
    <AppShell>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">Medications</h1>

        <button
          type="button"
          onClick={() => router.push('/meds/newMed')}
          className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
        >
          Add
        </button>
      </div>

      {/* Loading state */}
      {isLoading && !data && !error && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-neutral-700" />
          <p className="mt-2 text-sm text-neutral-600">
            Loading medications…
          </p>
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <div className="flex flex-col items-center justify-center py-16">
          <p className="mb-3 text-sm text-red-600">
            Failed to load medications.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="rounded-xl bg-neutral-800 px-4 py-2 text-sm text-white"
          >
            Retry
          </button>
        </div>
      )}

      {/* Content */}
      {!isLoading && !error && (
        <>
          {/* Client Filter section */}
          <div className="mb-4 border-b border-neutral-300 pb-2">
            <div className="mb-1 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setFilterOpen((prev) => !prev)}
                className="inline-flex items-center rounded-full border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-800"
              >
                <span className="mr-1 leading-none">Filter by client</span>
                <span className="text-xs">
                  {filterOpen ? '▲' : '▼'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => refetch()}
                disabled={isFetching}
                className="text-xs text-neutral-600 hover:text-neutral-900"
              >
                {isFetching ? 'Refreshing…' : 'Refresh'}
              </button>
            </div>

            {filterOpen && (
              <div className="mt-2 flex flex-wrap">
                <ClientFilterChip
                  label="All clients"
                  selected={clientFilter === 'all'}
                  onClick={() => setClientFilter('all')}
                />

                {clientOptions.map((c) => (
                  <ClientFilterChip
                    key={c.id}
                    label={c.initials ?? `Client #${c.id}`}
                    selected={clientFilter === c.id}
                    onClick={() => setClientFilter(c.id)}
                  />
                ))}

                {loadingClients && (
                  <p className="mt-2 text-sm text-neutral-500">
                    Loading clients…
                  </p>
                )}
                {clientsError && (
                  <p className="mt-2 text-sm text-red-600">
                    Failed to load clients.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* List */}
          {filteredList.length === 0 ? (
            <p className="mt-8 text-center text-sm text-neutral-600">
              {clientFilter === 'all'
                ? 'No medications yet.'
                : 'No medications for this client.'}
            </p>
          ) : (
            <div className="space-y-3 pb-8">
              {filteredList.map((item: any) => (
                <MedicationCard
                  key={String(item.id)}
                  item={item}
                  onDelete={(id: number) => del.mutate(id)}
                />
              ))}
            </div>
          )}
        </>
      )}
    </AppShell>
  );
}
