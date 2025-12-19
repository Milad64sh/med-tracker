
import { NextResponse } from "next/server";
import { backendUrl, getTokenFromCookie } from "@/app/api/_utils/backend";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

async function safeJson(res: Response) {
  const text = await res.text().catch(() => "");
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return { raw: text.slice(0, 2000) };
  }
}

function getQuery(req: Request) {
  const { searchParams } = new URL(req.url);
  const qs = searchParams.toString();
  return qs ? `?${qs}` : "";
}

export async function PATCH(req: Request, ctx: Ctx) {
  const token = await getTokenFromCookie();
  if (!token) return NextResponse.json({ message: "Unauthenticated" }, { status: 401 });

  const { id } = await ctx.params; // ✅ params is a Promise in your build
  if (!id || id === "undefined") {
    return NextResponse.json({ message: "Invalid user id", id }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));

  const res = await fetch(backendUrl(`/api/users/${encodeURIComponent(id)}${getQuery(req)}`), {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const data = await safeJson(res);
  return NextResponse.json(data ?? null, { status: res.status });
}
