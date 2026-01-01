'use client';

import React from 'react';
import { useAlert } from '@/app/AlertProvider';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';

export type UserRow = {
  id: number;
  name: string;
  email: string;
  is_admin: boolean;
  created_at?: string | null;
};

type UserCardProps = {
  user: UserRow;

  // current logged-in user id (for disabling self-delete / self-demote)
  currentUserId?: number | null;

  onEdit: (user: UserRow) => void;
  onDelete: (id: number) => void;
  onToggleAdmin: (id: number, nextIsAdmin: boolean) => void;

  // optional: show loading state per-user while mutation runs
  busy?: boolean;
};

export function UserCard({
  user,
  currentUserId = null,
  onEdit,
  onDelete,
  onToggleAdmin,
  busy = false,
}: UserCardProps) {
  const { showAlert } = useAlert();

  const isSelf = currentUserId != null && user.id === currentUserId;

const handleDelete = (e?: React.MouseEvent) => {
  e?.preventDefault();
  e?.stopPropagation();

  // then re-enable showAlert after you confirm the click fires
  showAlert({
    title: 'Confirm delete',
    message: `Delete "${user.name}" (${user.email})? This cannot be undone.`,
    variant: 'warning',
    onOk: () => onDelete(user.id),
  });
};


  const handleToggle = () => {
    const next = !user.is_admin;
    console.log({ cardUserId: user.id, currentUserId, isSelf, is_admin: user.is_admin });


    if (isSelf && next === false) {
      showAlert({
        title: 'Not allowed',
        message: "You can't remove your own admin access.",
        variant: 'warning',
      });
      return;
    }

    onToggleAdmin(user.id, next);
  };

  const iconBtnBase =
    'inline-flex items-center justify-center rounded-xl border border-neutral-200 bg-white p-2 text-neutral-500 transition ' +
    'hover:bg-neutral-50 hover:text-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-300';

  const iconBtnDisabled = 'opacity-60 cursor-not-allowed hover:bg-white hover:text-neutral-500';

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-base font-semibold text-neutral-900">
            {user.name}
            {isSelf ? <span className="ml-2 text-xs text-neutral-500">(You)</span> : null}
          </p>
          <p className="truncate text-sm text-neutral-600">{user.email}</p>
        </div>

        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
            user.is_admin
              ? 'bg-emerald-100 text-emerald-800'
              : 'bg-neutral-100 text-neutral-700'
          }`}
        >
          {user.is_admin ? 'Admin' : 'User'}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        {/* Admin toggle */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-neutral-700">Admin</span>

          <button
            type="button"
            onClick={handleToggle}
            disabled={busy || (isSelf && user.is_admin)}
            className={[
              'relative inline-flex h-6 w-11 items-center rounded-full transition',
              user.is_admin ? 'bg-emerald-500' : 'bg-neutral-300',
              busy || (isSelf && user.is_admin)
                ? 'opacity-60 cursor-not-allowed'
                : 'cursor-pointer',
            ].join(' ')}
            aria-pressed={user.is_admin}
            aria-label={`Toggle admin for ${user.email}`}
            title={isSelf && user.is_admin ? "You can't remove your own admin" : 'Toggle admin'}
          >
            <span
              className={[
                'inline-block h-5 w-5 transform rounded-full bg-white transition',
                user.is_admin ? 'translate-x-5' : 'translate-x-1',
              ].join(' ')}
            />
          </button>
        </div>

        {/* Actions */}
        <div className="relative z-20 flex items-center gap-2">
          {/* Edit icon */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onEdit(user);
            }}
            disabled={busy}
            aria-label={`Edit ${user.email}`}
            title="Edit user"
            className={[iconBtnBase, busy ? iconBtnDisabled : 'cursor-pointer'].join(' ')}
          >
            <PencilSquareIcon className="h-5 w-5" />
          </button>
          {/* Delete icon */}
          <button
            type="button"
            onClick={handleDelete}  
            disabled={busy || isSelf}
            aria-label={`Delete ${user.email}`}
            title={isSelf ? "You can't delete your own account" : 'Delete user'}
            className={[
              iconBtnBase,
              busy || isSelf ? iconBtnDisabled : 'cursor-pointer',
            ].join(' ')}
          >
            <TrashIcon className="h-5 w-5" />
          </button>

        </div>
      </div>
    </div>
  );
}
