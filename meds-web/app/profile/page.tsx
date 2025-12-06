'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AppShell } from '@/app/components/AppShell';
import { fetcher } from '@/lib/api';

type User = {
  id: number;
  name: string;
  email: string;
  created_at?: string | null;
};

function getInitials(name?: string | null) {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
}

type EditingField = 'name' | 'email' | 'memberSince' | null;

export default function ProfilePage() {
  const queryClient = useQueryClient();

  // Load current user from backend
  const {
    data: user,
    isLoading,
    error,
  } = useQuery<User>({
    queryKey: ['me'],
    queryFn: () => fetcher<User>('/api/auth/me'),
    retry: false,
  });

  const memberSinceFromUser = user?.created_at
    ? new Date(user.created_at).toLocaleDateString()
    : '—';

  const [editingField, setEditingField] = useState<EditingField>(null);
  const [draftValue, setDraftValue] = useState('');
  const [saving, setSaving] = useState(false);

  const [localName, setLocalName] = useState(user?.name ?? '');
  const [localEmail, setLocalEmail] = useState(user?.email ?? '');
  const [localMemberSince, setLocalMemberSince] = useState(memberSinceFromUser);

  // Sync local state when the user object changes
  useEffect(() => {
    if (user) {
      setLocalName(user.name);
      setLocalEmail(user.email);
      setLocalMemberSince(
        user.created_at
          ? new Date(user.created_at).toLocaleDateString()
          : '—'
      );
    }
  }, [user?.id, user?.name, user?.email, user?.created_at]);

  const startEditing = (field: EditingField) => {
    setEditingField(field);
    if (field === 'name') setDraftValue(localName);
    if (field === 'email') setDraftValue(localEmail);
    if (field === 'memberSince') setDraftValue(localMemberSince);
  };

  const cancelEditing = () => {
    setEditingField(null);
    setDraftValue('');
  };

  const saveEditing = async () => {
    if (!editingField) return;
    const trimmed = draftValue.trim();
    if (!trimmed) {
      cancelEditing();
      return;
    }

    try {
      setSaving(true);

      if (editingField === 'name' || editingField === 'email') {
        const payload: any = {};
        payload[editingField] = trimmed;

        // Adjust this to match your Laravel route
        const updated = await fetcher<User>('/api/auth/me', {
          method: 'PUT',
          body: payload,
        });

        // Update cache + local state
        queryClient.setQueryData(['me'], updated);

        setLocalName(updated.name);
        setLocalEmail(updated.email);
        setLocalMemberSince(
          updated.created_at
            ? new Date(updated.created_at).toLocaleDateString()
            : '—'
        );
      } else if (editingField === 'memberSince') {
        // UI only, not persisted
        setLocalMemberSince(trimmed);
      }

      setEditingField(null);
      setDraftValue('');
    } catch (e: any) {
      console.error('Failed to update profile', e);
      window.alert(
        e?.message || 'Could not save your changes. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  const renderRow = (
    label: string,
    value: string,
    field: EditingField
  ) => {
    const isEditing = editingField === field;

    return (
      <div className="border-b border-neutral-100 py-3">
        <div className="flex items-center justify-between">
          {/* Label */}
          <div className="text-sm text-neutral-700">{label}</div>

          {/* Edit / Save / Cancel */}
          {!isEditing ? (
            <button
              type="button"
              onClick={() => startEditing(field)}
              className="rounded-full border border-neutral-300 px-3 py-1 text-xs text-neutral-700 hover:bg-neutral-50 cursor-pointer"
            >
              Edit
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={saveEditing}
                disabled={saving}
                className="rounded-full bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-700 disabled:opacity-70 cursor-pointer"
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
              <button
                type="button"
                onClick={cancelEditing}
                disabled={saving}
                className="rounded-full border border-neutral-300 px-3 py-1 text-xs text-neutral-700 hover:bg-neutral-50 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Value / Input */}
        <div className="mt-2">
          {isEditing ? (
            <input
              value={draftValue}
              onChange={(e) => setDraftValue(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900"
              type={field === 'email' ? 'email' : 'text'}
            />
          ) : (
            <p className="text-sm text-neutral-500">{value}</p>
          )}
        </div>
      </div>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <AppShell>
        <div className="flex min-height-[60vh] flex-col items-center justify-center">
          <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-neutral-700" />
          <p className="mt-2 text-sm text-neutral-600">Loading profile…</p>
        </div>
      </AppShell>
    );
  }

  // Error / no user state
  if (error || !user) {
    // Helpful for debugging in dev tools
    if (error) {
      console.error('Error loading /api/auth/me:', error);
    }

    return (
      <AppShell>
        <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
          <p className="text-base text-neutral-700">
            Failed to load profile. Please refresh or sign in again.
          </p>
        </div>
      </AppShell>
    );
  }

  // Main content
  return (
    <AppShell>
      <div className="mx-auto w-full max-w-xl pt-2">
        {/* Avatar + name */}
        <div className="mb-6 flex flex-col items-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-600">
            <span className="text-2xl font-semibold text-white">
              {getInitials(localName)}
            </span>
          </div>

          <h1 className="mt-3 text-xl font-semibold text-neutral-900">
            {localName}
          </h1>
          <p className="mt-1 text-sm text-neutral-500">{localEmail}</p>
        </div>

        {/* Account details card */}
        <div className="mb-4 rounded-2xl border border-neutral-200 bg-white px-4 py-3">
          <p className="mb-3 text-sm font-semibold text-neutral-700">
            Account details
          </p>

          {renderRow('Name', localName, 'name')}
          {renderRow('Email', localEmail, 'email')}
          {renderRow('Member since', localMemberSince, 'memberSince')}
        </div>
      </div>
    </AppShell>
  );
}
