'use client';

import React from 'react';

import Link from 'next/link';
import { useAlert } from '@/app/AlertProvider';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/app/hooks/useAuth';

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
  const {isAdmin} = useAuth();
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

      {/* Actions */}
      {isAdmin &&
            <div className="flex flex-row gap-3">
        {/* EDIT */}
        <Link href={editHref} onClick={(e) => e.stopPropagation()}>
            <button
                        type="button"
                        className="inline-flex items-center justify-center rounded-xl border border-neutral-200 bg-white p-2 text-neutral-500 transition hover:bg-neutral-50 hover:text-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-300 cursor-pointer"
                      >
                        <PencilSquareIcon className="h-5 w-5" />
                      </button>
        </Link>

        {/* DELETE */}

          <button
                      type="button"
                      onClick={handleDeleteClick}
                      className="inline-flex items-center justify-center rounded-xl border border-neutral-200 bg-white p-2 text-neutral-500 transition hover:bg-neutral-50 hover:text-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-300 cursor-pointer"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
      </div>
      }

    </div>
  );
}
