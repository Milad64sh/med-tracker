/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { backendUrl, getTokenFromCookie } from '@/app/api/_utils/backend';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: Request, ctx: Ctx) {
console.log("✅ HIT /api/audit-logs/[id]/pdf route");

  try {
    const token = await getTokenFromCookie();
    if (!token) return NextResponse.json({ message: 'Unauthenticated' }, { status: 401 });

     const origin = new URL(req.url).origin;
  console.log("BACKEND_API_BASE_URL =", process.env.BACKEND_API_BASE_URL);
  console.log("Request origin =", origin);

  const { id } = await ctx.params;
  const url = backendUrl(`/api/audit-logs/${id}/pdf`);
  console.log("Proxy is fetching =", url);

    const res = await fetch(url, {
      headers: {
        Accept: 'application/pdf',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      return NextResponse.json(
        {
          message: 'Backend PDF endpoint returned an error',
          status: res.status,
          raw: text.slice(0, 2000),
        },
        { status: res.status }
      );
    }

    const buf = await res.arrayBuffer();

    return new NextResponse(buf, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition':
          res.headers.get('content-disposition') ?? `attachment; filename="audit-log-${id}.pdf"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (err: any) {
    // This is what you need to see in your terminal logs
    console.error('PDF proxy route crashed:', err);
    return NextResponse.json(
      { message: 'PDF proxy route crashed', error: String(err?.message ?? err) },
      { status: 500 }
    );
  }
}
