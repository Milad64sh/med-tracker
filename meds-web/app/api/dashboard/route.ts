/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { backendUrl, getTokenFromCookie } from '@/app/api/_utils/backend';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

export async function GET(req: Request) {
  const token = await getTokenFromCookie();
  if (!token) {
    return NextResponse.json({ message: 'Unauthenticated' }, { status: 401 });
  }

  const { search } = new URL(req.url);

  const res = await fetch(backendUrl(`/api/dashboard${search}`), {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
    next: { revalidate: 0 },
  });

  const text = await res.text().catch(() => '');
  let data: any = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { message: 'Invalid JSON from backend', raw: text };
  }

  return NextResponse.json(data, {
    status: res.status,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
    },
  });
}
