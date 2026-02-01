'use client';

import React from 'react';
import Link from 'next/link';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import type { Client } from '@/app/features/dashboard/types';
import type { MedicationCourse } from '@/app/features/courses/types';
import { useAlert } from '@/app/AlertProvider';
import { useAuth } from '@/app/hooks/useAuth';


type CourseWithRelations = MedicationCourse & {
  client?: Client | null;
};

type MedicationCardProps = {
  item: CourseWithRelations;
  onDelete: (id: number) => void;
  // optional props
  disableDelete?: boolean;
  showRestockButton?: boolean;
  onRestockPress?: () => void;
};

export function MedicationCard({
  item,
  onDelete,
  disableDelete = false,
  showRestockButton = false,
  onRestockPress,
}: MedicationCardProps) {
  const editHref = `/meds/${item.id}/edit`;
    const { isAdmin } = useAuth();
  const {showAlert} = useAlert();

  const clientInitials = item.client?.initials ?? '—';
  const serviceName = item.client?.service?.name ?? '—';

  const dose =
    item.dose_per_admin && item.admins_per_day
      ? `${item.dose_per_admin} units • ${item.admins_per_day}x/day`
      : '—';

  const packSize = item.pack_size ?? 0;
  const packsOnHand = item.packs_on_hand ?? 0;
  const looseUnits = item.loose_units ?? 0;
  const totalUnits = packSize * packsOnHand + looseUnits;

  const quantityLabel =
    totalUnits > 0
      ? `${totalUnits} units (packs: ${packsOnHand}, loose: ${looseUnits})`
      : '—';

  const handleDeleteClick = () => {
    showAlert({
      title: 'Confirm delete',
      message: `Are you sure you want to delete “${item.name}”? This cannot be undone.`,
      variant: 'warning',
      onOk: () => onDelete(item.id),
    });
  };

  return (
    <div className="mb-3 rounded-2xl border border-neutral-200 bg-white p-4">
      {/* Title */}
      <p className="mb-1 text-lg font-semibold">
        {item.name || 'Unnamed medication'}
      </p>

      {/* Details */}
      <div className="mb-3 text-sm">
        <p className="text-neutral-700">
          Client:{' '}
          <span className="font-medium">
            {clientInitials}
          </span>
        </p>
        <p className="text-neutral-700">
          Service:{' '}
          <span className="font-medium">
            {serviceName}
          </span>
        </p>
        <p className="text-neutral-700">
          Dose:{' '}
          <span className="font-medium">
            {dose}
          </span>
        </p>
        <p className="text-neutral-700">
          Quantity:{' '}
          <span className="font-medium">
            {quantityLabel}
          </span>
        </p>
      </div>
            {/* Actions */}
      {isAdmin &&
            <div className="flex flex-wrap gap-3">
        {/* Edit */}
        <Link href={editHref} aria-label={`Edit ${item.name ?? 'medication'}`}>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-xl border border-neutral-200 bg-white p-2 text-neutral-500 transition hover:bg-neutral-50 hover:text-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-300 cursor-pointer"
          >
            <PencilSquareIcon className="h-5 w-5" />
          </button>
        </Link>

        {/* Optional Restock */}
        {showRestockButton && (
          <button
            type="button"
            onClick={onRestockPress}
            className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 cursor-pointer"
          >
            Restock
          </button>
        )}

        {/* Delete */}
        {!disableDelete && (
          <button
            type="button"
            onClick={handleDeleteClick}
            aria-label={`Delete ${item.name ?? 'medication'}`}
            className="inline-flex items-center justify-center rounded-xl border border-neutral-200 bg-white p-2 text-neutral-500 transition hover:bg-neutral-50 hover:text-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-300 cursor-pointer"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        )}
      </div>
      }

    </div>
  );
}
