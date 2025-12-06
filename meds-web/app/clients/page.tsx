'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState } from 'react';
import Link from 'next/link';
import { AppShell } from '../components/AppShell';
import { useClients, useDeleteClient } from '../features/clients/queries';
import { ClientCard } from '../components/clients/ClientCard';
import { formatUK } from '../utils/formatUK';
import { BackButton } from '../components/ui/BackButton';

export default function ClientsPage() {
  const { data, isLoading, error, refetch } = useClients();
  const del = useDeleteClient();

  const [selectedClient, setSelectedClient] = useState<any | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const list = data ?? [];

  const handleOpenClientModal = (client: any) => {
    console.log('CLIENT OBJECT:', JSON.stringify(client, null, 2));
    setSelectedClient(client);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedClient(null);
  };

  return (
    <AppShell>
      {/* Header row: title + Add button */}
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">Clients</h1>

        <Link href="/clients/newClient">
          <button
            type="button"
            className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 cursor-pointer"
          >
            Add
          </button>
        </Link>
      </div>
      <BackButton className='mb-4'/>

      {/* Loading state */}
      {isLoading && !data && !error && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-neutral-700" />
          <p className="mt-2 text-sm text-neutral-600">Loading clients…</p>
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <div className="flex flex-col items-center justify-center py-16">
          <p className="mb-3 text-sm text-red-600">
            Failed to load clients.
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

      {/* List */}
      {!isLoading && !error && (
        <>
          {list.length === 0 ? (
            <p className="mt-8 text-center text-sm text-neutral-600">
              No clients yet.
            </p>
          ) : (
            <div className="space-y-3 pb-8">
              {list.map((item: any) => (
                <ClientCard
                  key={String(item.id)}
                  item={item}
                  onDelete={(id: number) => del.mutate(id)}
                  onPress={() => handleOpenClientModal(item)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Modal */}
      {modalVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="max-h-[80%] w-11/12 max-w-xl rounded-2xl bg-white p-4 shadow-lg">
            <h2 className="mb-2 text-lg font-semibold">
              {selectedClient?.initials ?? 'Client details'}
            </h2>

            <p className="mb-3 text-sm text-neutral-700">
              Medication courses:
            </p>

            {selectedClient?.courses?.length ? (
              <div className="mb-4 max-h-80 space-y-3 overflow-y-auto">
                {selectedClient.courses.map((course: any) => (
                  <div
                    key={course.id}
                    className="rounded-xl bg-neutral-100 p-3"
                  >
                    <p className="mb-1 font-semibold">
                      {course.name}
                      {course.strength ? ` ${course.strength}` : ''}
                      {course.form ? ` (${course.form})` : ''}
                    </p>

                    {!!course.dose_per_admin && (
                      <p className="text-sm text-neutral-700">
                        Dose per admin: {course.dose_per_admin}
                      </p>
                    )}

                    {!!course.admins_per_day && (
                      <p className="text-sm text-neutral-700">
                        Admins per day: {course.admins_per_day}
                      </p>
                    )}

                    {!!course.daily_use && (
                      <p className="text-sm text-neutral-700">
                        Daily use: {course.daily_use}
                      </p>
                    )}

                    {!!course.start_date && (
                      <p className="text-sm text-neutral-700">
                        Start: {formatUK(course.start_date)}
                      </p>
                    )}

                    {!!course.half_date && (
                      <p className="text-sm text-neutral-700">
                        Half date: {formatUK(course.half_date)}
                      </p>
                    )}

                    {!!course.runout_date && (
                      <p className="text-sm text-neutral-700">
                        Run out: {formatUK(course.runout_date)}
                      </p>
                    )}

                    {!!course.status && (
                      <p className="text-sm text-neutral-700">
                        Status: {course.status}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="mb-4 text-xs text-neutral-500">
                No medication courses for this client.
              </p>
            )}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCloseModal}
                className="rounded-xl bg-neutral-200 px-4 py-2 text-sm text-neutral-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
