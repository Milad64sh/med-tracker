import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { backendUrl, getTokenFromCookie } from '@/app/api/_utils/backend';

export async function POST() {
  // 1) Try to revoke the token on Laravel (nice-to-have)
  try {
    const token = await getTokenFromCookie();
    if (token) {
      await fetch(backendUrl('/api/auth/logout'), {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
    }
  } catch {
    // ignore – logout should still clear cookie even if backend call fails
  }

  // 2) Clear the HttpOnly cookie (the real logout)
  const cookieStore = await cookies();
  cookieStore.set('mt_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  return NextResponse.json({ message: 'Logged out' }, { status: 200 });
}
