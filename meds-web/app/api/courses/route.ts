import { NextResponse } from 'next/server';
import { backendUrl, getTokenFromCookie } from '@/app/api/_utils/backend';

export async function GET(req: Request) {
  const token = await getTokenFromCookie();
  if (!token) return NextResponse.json({ message: 'Unauthenticated' }, { status: 401 });

  const { search } = new URL(req.url);

  const res = await fetch(backendUrl(`/api/courses${search}`), {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const text = await res.text().catch(() => '');
  const data = text ? JSON.parse(text) : null;

  // If your backend wraps lists in { data: [...] }, return it as-is
  // so your existing frontend parsing continues to work.
  return NextResponse.json(data, { status: res.status });
}

export async function POST(req: Request) {
  const token = await getTokenFromCookie();
  if (!token) return NextResponse.json({ message: 'Unauthenticated' }, { status: 401 });

  const body = await req.json();

  const res = await fetch(backendUrl('/api/courses'), {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const text = await res.text().catch(() => '');
  const data = text ? JSON.parse(text) : null;

  return NextResponse.json(data, { status: res.status });
}
