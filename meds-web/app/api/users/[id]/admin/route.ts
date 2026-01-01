import { NextResponse } from "next/server";
import { backendUrl, getTokenFromCookie } from "@/app/api/_utils/backend";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

async function safeJson(res: Response) {
  const text = await res.text().catch(() => "");
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return { raw: text.slice(0, 2000) };
  }
}

export async function PATCH(req: Request, ctx: Ctx) {
  const token = await getTokenFromCookie();
  if (!token) return NextResponse.json({ message: "Unauthenticated" }, { status: 401 });

  const { id } = await ctx.params;
  if (!id || id === "undefined") {
    return NextResponse.json({ message: "Missing user id" }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));

  const res = await fetch(backendUrl(`/api/users/${id}/admin`), {
    method: "PATCH",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const data = await safeJson(res);

  if (!res.ok) {
    return NextResponse.json(
      { message: "Backend returned an error", status: res.status, raw: data },
      { status: res.status }
    );
  }

  return NextResponse.json(data);
}
