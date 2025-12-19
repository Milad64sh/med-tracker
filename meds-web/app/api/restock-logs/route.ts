/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { backendUrl, getTokenFromCookie } from "@/app/api/_utils/backend";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function readJsonOrText(res: Response) {
  const text = await res.text().catch(() => "");
  if (!text) return { json: null, text: "" };
  try {
    return { json: JSON.parse(text), text };
  } catch {
    return { json: null, text };
  }
}

export async function GET(req: Request) {
  try {
    const token = await getTokenFromCookie();
    if (!token) {
      return NextResponse.json({ message: "Unauthenticated" }, { status: 401 });
    }

    // Forward ALL query params (page + filters)
    const u = new URL(req.url);
    const qs = u.searchParams.toString();

    const backend = backendUrl(`/api/restock-logs${qs ? `?${qs}` : ""}`);

    // Guard: if env var missing, backendUrl might return empty/invalid
    if (!backend || !backend.startsWith("http")) {
      return NextResponse.json(
        {
          message: "Server misconfiguration: backend base URL is missing/invalid",
          backend_url: backend,
          hint: "Set BACKEND_API_BASE_URL (or your expected env var) in Vercel project settings.",
        },
        { status: 500 }
      );
    }

    const res = await fetch(backend, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    const { json, text } = await readJsonOrText(res);

    // If backend error, return it to frontend so you can see it
    if (!res.ok) {
      return NextResponse.json(
        {
          message: "Backend error calling restock logs",
          status: res.status,
          backend_url: backend,
          backend_body: json ?? text?.slice(0, 2000),
        },
        { status: res.status }
      );
    }

    return NextResponse.json(json ?? {}, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      {
        message: "Route handler crashed",
        error: err?.message ?? String(err),
      },
      { status: 500 }
    );
  }
}
