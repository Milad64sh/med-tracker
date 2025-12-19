import { NextResponse } from "next/server";
import { backendUrl, getTokenFromCookie } from "@/app/api/_utils/backend";

export const dynamic = "force-dynamic";

async function safeJson(res: Response) {
  const text = await res.text().catch(() => "");
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return { raw: text.slice(0, 2000) };
  }
}

export async function GET(req: Request) {
  const token = await getTokenFromCookie();
  if (!token) return NextResponse.json({ message: "Unauthenticated" }, { status: 401 });

  const url = new URL(req.url);
  const qs = url.searchParams.toString(); // page + filters

  const res = await fetch(backendUrl(`/api/restock-logs${qs ? `?${qs}` : ""}`), {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  const data = await safeJson(res);
  return NextResponse.json(data ?? null, { status: res.status });
}
