'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetcher } from '@/lib/api';
import { useAlert } from '@/app/AlertProvider';

type MeResponse = {
  id: number;
  name: string;
  email: string;
  is_admin?: boolean;
};

type InviteResponse = {
  invite_link: string;
  expires_at?: string;
};

export default function AdminInvitesPage() {
  const router = useRouter();
  const { showAlert } = useAlert();

  const [me, setMe] = useState<MeResponse | null>(null);
  const [loadingMe, setLoadingMe] = useState(true);

  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);

  // Fetch /auth/me and verify admin (cookie-based via Next API route)
  useEffect(() => {
    async function loadMe() {
      try {
        const res = await fetcher<MeResponse>('/api/auth/me', { method: 'GET' });

        if (!res?.is_admin) {
          showAlert({
            title: 'Access denied',
            message: 'You do not have permission to view this page.',
            variant: 'error',
            onOk: () => router.push('/dashboard'),
          });
          return;
        }

        setMe(res);
      } catch (e: any) {
        // If your fetcher includes status/details, this handles both 401 and other errors
        const message =
          e?.details?.message ||
          e?.message ||
          'Unable to verify your session. Please sign in again.';

        showAlert({
          title: 'Sign in required',
          message,
          variant: 'warning',
          onOk: () => router.push('/login'),
        });
      } finally {
        setLoadingMe(false);
      }
    }

    loadMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function createInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviteLink(null);
    setExpiresAt(null);

    const trimmed = email.trim().toLowerCase();
    if (!trimmed) {
      showAlert({
        title: 'Missing email',
        message: 'Please enter an email address.',
        variant: 'warning',
      });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetcher<InviteResponse>('/api/invites', {
        method: 'POST',
        body: { email: trimmed },
      });

      setInviteLink(res.invite_link);
      setExpiresAt(res.expires_at || null);

      showAlert({
        title: 'Invite created',
        message: 'Invite link generated successfully.',
        variant: 'success',
      });
    } catch (e: any) {
      const message =
        e?.details?.message ||
        (e?.details?.errors?.email?.[0] as string) ||
        'Failed to create invite. Please try again.';

      showAlert({
        title: 'Invite failed',
        message,
        variant: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function copyLink() {
    if (!inviteLink) return;
    try {
      await navigator.clipboard.writeText(inviteLink);
      showAlert({
        title: 'Copied',
        message: 'Invite link copied to clipboard.',
        variant: 'success',
      });
    } catch {
      showAlert({
        title: 'Copy failed',
        message: 'Please copy the link manually.',
        variant: 'warning',
      });
    }
  }

  if (loadingMe) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
        <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-neutral-700">Loading…</p>
        </div>
      </div>
    );
  }

  if (!me?.is_admin) return null;

  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-8">
      <div className="mx-auto w-full max-w-2xl rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-neutral-900">Invite users</h1>
          <p className="mt-1 text-sm text-neutral-600">
            Generate a single-use invite link for a staff member.
          </p>
          <div className="mt-2 text-xs text-neutral-500">
            Signed in as: <span className="font-medium">{me.email}</span>
          </div>
        </div>

        <form onSubmit={createInvite} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-neutral-700">User email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="new.staff@company.com"
              className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-400"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Generating…' : 'Generate invite link'}
          </button>
        </form>

        {inviteLink && (
          <div className="mt-6 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
            <div className="mb-2 text-sm font-medium text-neutral-900">Invite link</div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <input
                value={inviteLink}
                readOnly
                className="w-full flex-1 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900"
              />
              <button
                type="button"
                onClick={copyLink}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Copy
              </button>
            </div>

            {expiresAt && (
              <div className="mt-2 text-xs text-neutral-600">
                Expires at: {expiresAt}
              </div>
            )}
          </div>
        )}

        <div className="mt-6 flex items-center justify-between text-sm">
          <Link href="/dashboard" className="text-blue-600 hover:underline">
            Back to dashboard
          </Link>

          <Link href="/login" className="text-neutral-600 hover:underline">
            Sign in page
          </Link>
        </div>
      </div>
    </div>
  );
}
