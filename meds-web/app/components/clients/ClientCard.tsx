'use client';

import React from 'react';
import Link from 'next/link';
import { formatUK } from '@/app/utils/formatUK';
import type { Client } from '@/app/features/dashboard/types';
import { useAlert } from '@/app/AlertProvider';
import { useAuth } from '@/app/hooks/useAuth';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';

type ClientCardProps = {
  item: Client;
  onDelete: (id: number) => void;
  onPress?: () => void;
};

export function ClientCard({ item, onDelete, onPress }: ClientCardProps) {
  const { isAdmin } = useAuth();
  const { showAlert } = useAlert();

  const editHref = `/clients/${item.id}/edit`;

  const handleDeleteClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    showAlert({
      title: 'Confirm delete',
      message: `Are you sure you want to delete “${item.initials ?? 'this client'}”?`,
      variant: 'warning',
      onOk: () => onDelete(item.id),
    });
  };

  return (
    <div
      onClick={onPress}
      role={onPress ? 'button' : undefined}
      className="mb-3 rounded-2xl border border-neutral-200 bg-white p-4 cursor-pointer"
    >
      <p className="mb-1 text-lg font-semibold">
        {item.initials ?? '—'}
      </p>

      <p className="mb-2 text-sm text-neutral-600">
        {item.client_name || '—'}
      </p>

      <div className="mb-3 text-sm">
        <p className="text-neutral-700">
          DOB: <span className="font-medium">{formatUK(item.dob) ?? '—'}</span>
        </p>
        <p className="text-neutral-700">
          Service:{' '}
          <span className="font-medium">{item.service?.name ?? '—'}</span>
        </p>
      </div>

      {/* ADMIN ACTIONS ONLY */}
      {isAdmin && (
        <div className="flex flex-row gap-3">
          <Link href={editHref} onClick={(e) => e.stopPropagation()}>
            <button
                        type="button"
                        className="inline-flex items-center justify-center rounded-xl border border-neutral-200 bg-white p-2 text-neutral-500 transition hover:bg-neutral-50 hover:text-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-300 cursor-pointer"
                      >
                        <PencilSquareIcon className="h-5 w-5" />
                      </button>
          </Link>

          <button
                      type="button"
                      onClick={handleDeleteClick}
                      className="inline-flex items-center justify-center rounded-xl border border-neutral-200 bg-white p-2 text-neutral-500 transition hover:bg-neutral-50 hover:text-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-300 cursor-pointer"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
        </div>
      )}
    </div>
  );
}
