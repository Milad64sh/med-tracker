'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetcher } from '@/lib/api';

export default function SignUpPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ---- PASSWORD RULES VALIDATION ----
  const rules = useMemo(
    () => ({
      length: password.length >= 12,
      upper: /[A-Z]/.test(password),
      lower: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    }),
    [password]
  );

  const allRulesPassed = Object.values(rules).every(Boolean);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name || !email || !password || !passwordConfirm) {
      window.alert('All fields are required.');
      return;
    }

    if (!allRulesPassed) {
      window.alert('Please meet all password requirements.');
      return;
    }

    if (password !== passwordConfirm) {
      window.alert('Passwords do not match.');
      return;
    }

    setSubmitting(true);

    try {
      await fetcher('/api/auth/register', {
        method: 'POST',
        body: {
          name,
          email,
          password,
          password_confirmation: passwordConfirm,
        },
      });

      window.alert('Your account has been created. Please sign in.');
      router.push('/login'); // or '/signin' if that’s your route
    } catch (e: any) {
      console.log('Sign up error:', e?.details || e);
      const message =
        e?.details?.message ||
        'Unable to create account. Check your details and try again.';
      window.alert(message);
    } finally {
      setSubmitting(false);
    }
  };

  const Rule = ({ ok, label }: { ok: boolean; label: string }) => (
    <div className="mb-1 flex items-center">
      <span
        className={`inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] ${
          ok ? 'bg-emerald-500 text-white' : 'bg-neutral-300 text-neutral-600'
        }`}
      >
        {ok ? '✓' : '✕'}
      </span>
      <span
        className={`ml-2 text-sm ${
          ok ? 'text-emerald-600' : 'text-neutral-600'
        }`}
      >
        {label}
      </span>
    </div>
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white px-6 py-6 shadow-sm">
        <h1 className="mb-6 text-2xl font-semibold text-neutral-900">
          Create an account
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* FULL NAME */}
          <div>
            <label className="mb-1 block text-sm text-neutral-700">
              Full Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-400"
            />
          </div>

          {/* EMAIL */}
          <div>
            <label className="mb-1 block text-sm text-neutral-700">
              Email
            </label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              type="email"
              className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-400"
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label className="mb-1 block text-sm text-neutral-700">
              Password
            </label>
            <div className="flex items-center rounded-lg border border-neutral-300 bg-white px-3">
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                className="flex-1 py-2 text-sm text-neutral-900 outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="ml-2 text-xs text-neutral-600 hover:text-neutral-800"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>

            {/* PASSWORD RULES DISPLAY */}
            <div className="mt-2 pl-1">
              <Rule ok={rules.length} label="At least 12 characters" />
              <Rule ok={rules.upper} label="Contains an uppercase letter (A–Z)" />
              <Rule ok={rules.lower} label="Contains a lowercase letter (a–z)" />
              <Rule ok={rules.number} label="Contains a number (0–9)" />
              <Rule
                ok={rules.special}
                label="Contains a special character (!@#$%^&*)"
              />
            </div>
          </div>

          {/* CONFIRM PASSWORD */}
          <div>
            <label className="mb-1 block text-sm text-neutral-700">
              Confirm Password
            </label>
            <div className="flex items-center rounded-lg border border-neutral-300 bg-white px-3">
              <input
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                type={showPasswordConfirm ? 'text' : 'password'}
                autoComplete="new-password"
                className="flex-1 py-2 text-sm text-neutral-900 outline-none"
              />
              <button
                type="button"
                onClick={() =>
                  setShowPasswordConfirm((prev) => !prev)
                }
                className="ml-2 text-xs text-neutral-600 hover:text-neutral-800"
              >
                {showPasswordConfirm ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={submitting}
            className={`mt-2 flex w-full items-center justify-center rounded-lg py-2.5 text-sm font-semibold text-white ${
              allRulesPassed && !submitting
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-neutral-300 cursor-not-allowed'
            }`}
          >
            {submitting ? 'Creating account…' : 'Sign Up'}
          </button>
        </form>

        {/* LINK TO SIGN IN */}
        <div className="mt-4 flex justify-center">
          <p className="mr-1 text-sm text-neutral-700">
            Already have an account?
          </p>
          <Link href="/login" className="text-sm text-blue-600 hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
