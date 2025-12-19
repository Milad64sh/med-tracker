'use client';

import React from 'react';
import { AppShell } from '@/app/components/AppShell';
import { useAuth } from '@/app/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetcher } from '@/lib/api';
import { UserCard, type UserRow } from '@/app/components/users/UserCard';
import { useAlert } from '@/app/AlertProvider';

type EditState = {
  open: boolean;
  user: UserRow | null;
};

export default function AdminUsersPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const { showAlert } = useAlert();

  const { isAdmin, isLoading: authLoading, user: me } = useAuth();

  // If not admin, kick out
  React.useEffect(() => {
    if (!authLoading && !isAdmin) router.replace('/dashboard');
  }, [authLoading, isAdmin, router]);

  // Load users list (admin-only)
  const { data, isLoading, error, refetch, isFetching } = useQuery<UserRow[]>({
    queryKey: ['admin-users'],
    queryFn: () => fetcher('/api/users'),
    enabled: isAdmin,
    retry: false,
  });

  // Local edit modal state
  const [edit, setEdit] = React.useState<EditState>({ open: false, user: null });
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');

  React.useEffect(() => {
    if (edit.open && edit.user) {
      setName(edit.user.name ?? '');
      setEmail(edit.user.email ?? '');
    }
  }, [edit.open, edit.user]);

  // Mutations
  const toggleAdmin = useMutation({
    mutationFn: ({ id, is_admin }: { id: number; is_admin: boolean }) =>
      fetcher(`/api/users/${id}/admin`, { method: 'PATCH', body: { is_admin } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  const deleteUser = useMutation({
    mutationFn: (id: number) => fetcher(`/api/users/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  const updateUser = useMutation({
    mutationFn: ({ id, body }: { id: number; body: { name: string; email: string } }) =>
      fetcher(`/api/users/${id}`, { method: 'PATCH', body }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      setEdit({ open: false, user: null });
    },
  });

  const list = data ?? [];

  const busyForUserId = (id: number) => {
    const a = toggleAdmin.variables?.id === id && toggleAdmin.isPending;
    const b = deleteUser.variables === id && deleteUser.isPending;
    const c = updateUser.variables?.id === id && updateUser.isPending;
    return Boolean(a || b || c);
  };

  const openEdit = (u: UserRow) => setEdit({ open: true, user: u });

  const closeEdit = () => {
    if (updateUser.isPending) return;
    setEdit({ open: false, user: null });
  };

  const submitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!edit.user) return;

    const nextName = name.trim();
    const nextEmail = email.trim();

    if (!nextName || !nextEmail) {
      showAlert({
        title: 'Missing fields',
        message: 'Name and email are required.',
        variant: 'warning',
      });
      return;
    }

    updateUser.mutate({
      id: edit.user.id,
      body: { name: nextName, email: nextEmail },
    });
  };

  return (
    <AppShell>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-neutral-900">Users</h1>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => refetch()}
            className="rounded-xl bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-60"
            disabled={isFetching}
          >
            {isFetching ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="py-10 text-sm text-neutral-600">Loading users…</div>
      )}

      {error && (
        <div className="py-10">
          <p className="mb-3 text-sm text-red-600">Failed to load users.</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="rounded-xl bg-neutral-900 px-4 py-2 text-sm text-white"
          >
            Retry
          </button>
        </div>
      )}

      {!isLoading && !error && (
        <>
          {list.length === 0 ? (
            <p className="mt-8 text-center text-sm text-neutral-600">No users found.</p>
          ) : (
            <div className="space-y-3">
              {list.map((u) => (
                <UserCard
                  key={u.id}
                  user={u}
                  currentUserId={me?.id ?? null}
                  busy={busyForUserId(u.id)}
                  onEdit={openEdit}
                  onDelete={(id) => deleteUser.mutate(id)}
                  onToggleAdmin={(id, nextIsAdmin) => toggleAdmin.mutate({ id, is_admin: nextIsAdmin })}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Edit modal */}
      {edit.open && edit.user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-3">
          <div className="w-full max-w-lg rounded-2xl bg-white p-4 shadow-lg">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="truncate text-lg font-semibold text-neutral-900">Edit user</h2>
                <p className="truncate text-sm text-neutral-600">{edit.user.email}</p>
              </div>

              <button
                type="button"
                onClick={closeEdit}
                className="rounded-xl bg-neutral-100 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-200 disabled:opacity-60"
                disabled={updateUser.isPending}
              >
                ✕
              </button>
            </div>

            <form onSubmit={submitEdit} className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500"
                  placeholder="Full name"
                  autoComplete="name"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">Email</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500"
                  placeholder="Email"
                  autoComplete="email"
                />
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeEdit}
                  className="rounded-xl bg-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-800 hover:bg-neutral-300 disabled:opacity-60"
                  disabled={updateUser.isPending}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-60"
                  disabled={updateUser.isPending}
                >
                  {updateUser.isPending ? 'Saving…' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
