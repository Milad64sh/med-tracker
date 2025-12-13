import { NextResponse } from 'next/server';
import { backendUrl, getTokenFromCookie } from '@/app/api/_utils/backend';

export async function GET(req: Request) {
  const token = await getTokenFromCookie();
  if (!token) {
    return NextResponse.json({ message: 'Unauthenticated' }, { status: 401 });
  }

  const { search } = new URL(req.url);

  const res = await fetch(backendUrl(`/api/clients${search}`), {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}

export async function POST(req: Request) {
  const token = await getTokenFromCookie();
  if (!token) {
    return NextResponse.json({ message: 'Unauthenticated' }, { status: 401 });
  }

  const body = await req.json();

  const res = await fetch(backendUrl('/api/clients'), {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
