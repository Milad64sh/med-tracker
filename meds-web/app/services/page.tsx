'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState } from 'react';
import Link from 'next/link';
import { AppShell } from '../components/AppShell';
import { useServices, useDeleteService } from '../features/services/queries';
import { ServiceCard } from '../components/services/ServiceCard';
import { formatUK } from '../utils/formatUK';
import { useAuth } from '@/app/hooks/useAuth';


export default function ServicesPage() {
  const { data, isLoading, error, refetch } = useServices();
  const del = useDeleteService();
  const { isAdmin } = useAuth();


  const [selectedService, setSelectedService] = useState<any | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const list = data ?? [];

  const handleOpenServiceModal = (service: any) => {
    console.log('SERVICE OBJECT:', JSON.stringify(service, null, 2));
    setSelectedService(service);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedService(null);
  };

  return (
    <AppShell>
      {/* Header row: title + Add button */}
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">Services</h1>
        {isAdmin && (
          <Link href="/services/newService">
            <button
              type="button"
              className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 cursor-pointer"
            >
              Add
            </button>
          </Link>
        )}
      </div>

      {/* Loading state */}
      {isLoading && !data && !error && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-neutral-700" />
          <p className="mt-2 text-sm text-neutral-600">Loading services…</p>
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <div className="flex flex-col items-center justify-center py-16">
          <p className="mb-3 text-sm text-red-600">
            Failed to load services.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="rounded-xl bg-neutral-800 px-4 py-2 text-sm text-white cursor-pointer"
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
              No services yet.
            </p>
          ) : (
            <div className="space-y-3 pb-8">
              {list.map((item: any) => (
                <ServiceCard
                  key={String(item.id)}
                  item={item}
                  onDelete={(id: number) => del.mutate(id)}
                  onPress={() => handleOpenServiceModal(item)}
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
              {selectedService?.name ?? 'Service details'}
            </h2>

            <p className="mb-3 text-sm text-neutral-700">
              Clients on this service:
            </p>

            {selectedService?.clients?.length ? (
              <div className="mb-4 max-h-80 space-y-3 overflow-y-auto">
                {selectedService.clients.map((client: any) => (
                  <div
                    key={client.id}
                    className="rounded-xl bg-neutral-100 p-3"
                  >
                    <p className="mb-1 font-semibold">
                      {client.initials ?? 'Unknown initials'}
                    </p>

                    {!!client.dob && (
                      <p className="text-sm text-neutral-700">
                        DOB: {formatUK(client.dob)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="mb-4 text-xs text-neutral-500">
                No clients assigned to this service.
              </p>
            )}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCloseModal}
                className="rounded-xl bg-neutral-200 px-4 py-2 text-sm text-neutral-800 cursor-pointer"
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
