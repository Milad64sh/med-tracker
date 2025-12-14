'use client';

import React from 'react';
import Link from 'next/link';
import { useAlert } from '@/app/AlertProvider';

type ServiceCardProps = {
  item: {
    id: number;
    name: string;
    clients?: { id: number; initials?: string; dob?: string | null }[];
  };
  onDelete: (id: number) => void;
  onPress?: () => void; // open modal
};

export function ServiceCard({ item, onDelete, onPress }: ServiceCardProps) {
  const editHref = `/services/${item.id}/edit`;
  const {showAlert} = useAlert();

  const handleDeleteClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    const name = item.name ?? 'this service';
    showAlert({
      title: 'Confirm delete',
      message: `Are you sure you want to delete “${name}”? This cannot be undone.`,
      variant: 'warning',
      onOk: () => onDelete(item.id),
    });
  };

  const handleCardClick = () => {
    if (onPress) onPress();
  };

  // optional: show number of clients
  const clientsCount = item.clients?.length ?? 0;

  return (
    <div
      onClick={handleCardClick}
      role={onPress ? 'button' : undefined}
      className="mb-3 rounded-2xl border border-neutral-200 bg-white p-4 cursor-pointer"
    >
      <p className="mb-1 text-lg font-semibold">
        {item.name ?? 'Unknown service'}
      </p>

      <p className="mb-3 text-sm text-neutral-700">
        Clients:{' '}
        <span className="font-medium">
          {clientsCount}
        </span>
      </p>

      <div className="flex flex-row gap-3">
        {/* EDIT */}
        <Link href={editHref} onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-600 cursor-pointer"
          >
            Edit
          </button>
        </Link>

        {/* DELETE */}
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
