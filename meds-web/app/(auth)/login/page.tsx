'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetcher, setAuthToken } from '@/lib/api';

type LoginResponse = {
  token?: string;
  access_token?: string;
  data?: {
    token?: string;
  };
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please enter email and password.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetcher<LoginResponse>('/api/auth/login', {
        method: 'POST',
        body: {
          email: email.trim(),
          password,
        },
      });

      const token =
        res.token ||
        res.access_token ||
        res.data?.token ||
        null;

      if (!token) {
        throw new Error('No token returned from API. Adjust LoginResponse parsing.');
      }

      // store token in memory + localStorage
      setAuthToken(token);
      if (typeof window !== 'undefined') {
        localStorage.setItem('authToken', token);
      }

      // navigation similar to RN: go to main app screen
      router.push('/dashboard');
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : 'Sign in failed';
      setError(msg || 'Sign in failed, check your email and password.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <div className="flex flex-1 items-center justify-center px-4">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md rounded-xl bg-white px-6 py-8 shadow"
        >
          <h1 className="mb-6 text-2xl font-semibold">Sign in</h1>

          <label className="mb-1 block text-sm font-medium text-neutral-700">
            Email
          </label>
            <input
                value={email}
                onChange={e => setEmail(e.target.value)}
                type="email"
                autoComplete="email"
                className="mb-4 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400"
                />



          <label className="mb-1 block text-sm font-medium text-neutral-700">
            Password
          </label>
          <div className="mb-4 flex items-center rounded-lg border border-neutral-300 bg-white px-3">
           <input
            value={password}
            onChange={e => setPassword(e.target.value)}
            type={showPassword ? 'text' : 'password'}
            className="flex-1 border-none bg-transparent py-2 text-sm text-neutral-900 placeholder-neutral-400 outline-none"
            />

            <button
              type="button"
              onClick={() => setShowPassword(prev => !prev)}
              className="ml-2 text-xs text-neutral-600"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>

          {error && (
            <p className="mb-3 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mb-3 w-full rounded-lg bg-blue-600 py-3 text-center text-sm font-semibold text-white disabled:opacity-60"
          >
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>

          <div className="mb-4 text-center">
            <Link href="/forgot-password">
              <span className="cursor-pointer text-sm text-blue-600">
                Forgot password?
              </span>
            </Link>
          </div>

          <div className="mt-2 mb-4 flex flex-row justify-center text-sm">
            <span className="mr-1 text-neutral-700">No account?</span>
            <Link href="/signup">
              <span className="cursor-pointer text-blue-600">
                Sign up
              </span>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
