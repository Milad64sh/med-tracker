'use client';

import React from 'react';
import Link from 'next/link';

import type { Client } from '@/app/features/dashboard/types';
import type { MedicationCourse } from '@/app/features/courses/types';

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
    const ok = window.confirm(
      `Are you sure you want to delete “${item.name ?? 'this medication'}”?`
    );
    if (ok) {
      onDelete(item.id);
    }
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
      <div className="flex flex-wrap gap-3">
        {/* Edit */}
        <Link href={editHref}>
          <button
            type="button"
            className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-600 cursor-pointer"
          >
            Edit
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
            className="rounded-xl bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 cursor-pointer"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
