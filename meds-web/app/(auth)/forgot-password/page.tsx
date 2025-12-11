'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import Link from 'next/link';
import { fetcher } from '@/lib/api';
import { useAlert } from '@/app/AlertProvider';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const {showAlert} = useAlert();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email.trim()) {
      showAlert({
        title: 'Email required',
        message: 'Please enter an email address to continue.',
        variant: 'warning',
      });
      return;
    }

    setSubmitting(true);
    try {
      await fetcher('/api/auth/forgot-password', {
        method: 'POST',
        body: { email: email.trim() },
      });

      showAlert({
        title: 'Reset Link Sent',
        message: 'If an account with that email exists, a password reset link has been sent.',
        variant: 'info',
      });

    } catch (e: any) {

      const message =
        e?.details?.message ||
        'Forgot password error.';
      showAlert({
        title: 'Failed to send link',
        message: message,
        variant: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white px-6 py-6 shadow-sm">
        <h1 className="mb-6 text-2xl font-semibold text-neutral-900">
          Forgot password
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* EMAIL */}
          <div>
            <label className="mb-1 block text-sm text-neutral-700">
              Email
            </label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoCapitalize="none"
              autoComplete="email"
              type="email"
              className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-400"
            />
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {submitting ? 'Sending…' : 'Send reset link'}
          </button>
        </form>

        {/* LINK BACK TO SIGN IN */}
        <div className="mt-4 flex justify-center">
          <Link href="/login" className="text-sm text-blue-600 hover:underline">
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
