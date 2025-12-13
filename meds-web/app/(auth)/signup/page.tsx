import { Suspense } from 'react';
import SignupClient from './SignupClient';

export default function SignUpPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
          <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white px-6 py-6 shadow-sm">
            <p className="text-sm text-neutral-700">Loading…</p>
          </div>
        </div>
      }
    >
      <SignupClient />
    </Suspense>
  );
}
