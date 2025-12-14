/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getTokenFromCookie } from "@/app/api/_utils/backend";

export const dynamic = "force-dynamic";

function getBackendBaseUrl() {
  // ✅ server env var (set this in Vercel)
  const base =
    process.env.BACKEND_API_BASE_URL ||
    process.env.NEXT_PUBLIC_BACKEND_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "";

  return base.replace(/\/$/, "");
}

function safeJson(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text.slice(0, 2000) };
  }
}

export async function POST(req: Request) {
  const backendBase = getBackendBaseUrl();

  if (!backendBase) {
    return NextResponse.json(
      {
        message: "Server misconfiguration: backend base URL is not set.",
        hint: "Set BACKEND_API_BASE_URL in Vercel to https://api.miladshalikarian.co.uk and redeploy.",
      },
      { status: 500 }
    );
  }

  const token = await getTokenFromCookie();
  if (!token) {
    return NextResponse.json({ message: "Unauthenticated" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const url = `${backendBase}/api/invites`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const text = await res.text().catch(() => "");
    const data = text ? safeJson(text) : null;

    return NextResponse.json(data ?? null, { status: res.status });
  } catch (err: any) {
    return NextResponse.json(
      {
        message: "Failed to reach backend invites endpoint.",
        url,
        error: err?.message || String(err),
      },
      { status: 502 }
    );
  }
}
