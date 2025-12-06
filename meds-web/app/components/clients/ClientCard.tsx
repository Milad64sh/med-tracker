'use client';

import React from 'react';
import Link from 'next/link';
import { formatUK } from '@/app/utils/formatUK';
import type { Client } from '@/app/features/dashboard/types';

type ClientCardProps = {
  item: Client;
  onDelete: (id: number) => void;
  onPress?: () => void; // open modal
};

export function ClientCard({ item, onDelete, onPress }: ClientCardProps) {
  const editHref = `/clients/${item.id}/edit`;

  const handleDeleteClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    const name = item.initials ?? 'this client';
    const ok = window.confirm(`Are you sure you want to delete “${name}”?`);
    if (ok) {
      onDelete(item.id);
    }
  };

  const handleCardClick = () => {
    if (onPress) onPress();
  };

  return (
    <div
      onClick={handleCardClick}
      role={onPress ? 'button' : undefined}
      className="mb-3 rounded-2xl border border-neutral-200 bg-white p-4 cursor-pointer"
    >
      <p className="mb-1 text-lg font-semibold">
        {item.initials ?? '—'}
      </p>

      <div className="mb-3 text-sm">
        <p className="text-neutral-700">
          DOB:{' '}
          <span className="font-medium">
            {formatUK(item.dob) ?? '—'}
          </span>
        </p>
        <p className="text-neutral-700">
          Service:{' '}
          <span className="font-medium">
            {item.service?.name ?? '—'}
          </span>
        </p>
      </div>

      <div className="flex flex-row gap-3">
        {/* EDIT button */}
        <Link href={editHref} onClick={e => e.stopPropagation()}>
          <button
            type="button"
            className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-600 cursor-pointer"
          >
            Edit
          </button>
        </Link>

        {/* DELETE button */}
        <button
          type="button"
          onClick={handleDeleteClick}
          className="rounded-xl bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 cursor-pointer"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
