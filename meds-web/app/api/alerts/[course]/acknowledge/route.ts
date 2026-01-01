import { NextResponse } from 'next/server';
import { backendUrl, getTokenFromCookie } from '@/app/api/_utils/backend';

type Ctx = { params: Promise<{ course: string }> };

export async function POST(req: Request, ctx: Ctx) {
  const token = await getTokenFromCookie();
  if (!token) return NextResponse.json({ message: 'Unauthenticated' }, { status: 401 });

  const { course } = await ctx.params;
  const body = await req.json().catch(() => ({}));

  const res = await fetch(backendUrl(`/api/alerts/${course}/acknowledge`), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
