'use client';

import React from 'react';
import Link from 'next/link';
import { formatUK } from '@/app/utils/formatUK';
import type { Client } from '@/app/features/dashboard/types';
import { useAlert } from '@/app/AlertProvider';
import { useAuth } from '@/app/hooks/useAuth';

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
            <button className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-600">
              Edit
            </button>
          </Link>

          <button
            onClick={handleDeleteClick}
            className="rounded-xl bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
