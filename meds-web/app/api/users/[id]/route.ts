import { NextResponse } from "next/server";
import { backendUrl, getTokenFromCookie } from "@/app/api/_utils/backend";

export const dynamic = "force-dynamic";

async function jsonOrRaw(res: Response) {
  const text = await res.text().catch(() => "");
  try { return text ? JSON.parse(text) : null; } catch { return { raw: text }; }
}

export async function PATCH(req: Request, ctx: { params: { id: string } }) {
  const token = await getTokenFromCookie();
  if (!token) return NextResponse.json({ message: "Unauthenticated" }, { status: 401 });

  const body = await req.json().catch(() => ({}));

  const res = await fetch(backendUrl(`/api/users/${ctx.params.id}`), {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });

  return NextResponse.json(await jsonOrRaw(res), { status: res.status });
}

export async function DELETE(_req: Request, ctx: { params: { id: string } }) {
  const token = await getTokenFromCookie();
  if (!token) return NextResponse.json({ message: "Unauthenticated" }, { status: 401 });

  const res = await fetch(backendUrl(`/api/users/${ctx.params.id}`), {
    method: "DELETE",
    headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
  });

  return NextResponse.json(await jsonOrRaw(res), { status: res.status });
}
