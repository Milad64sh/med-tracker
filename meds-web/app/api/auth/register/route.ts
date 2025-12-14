/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function getBackendBaseUrl() {
  // Prefer server-only env var (set this in Vercel)
  const base =
    process.env.BACKEND_API_BASE_URL ||
    process.env.NEXT_PUBLIC_BACKEND_API_BASE_URL ||
    "";

  return base.replace(/\/$/, "");
}

export async function POST(req: Request) {
  const backendBase = getBackendBaseUrl();

  if (!backendBase) {
    return NextResponse.json(
      {
        message: "Server misconfiguration: BACKEND_API_BASE_URL is not set on Vercel.",
        hint: "Set BACKEND_API_BASE_URL to https://api.miladshalikarian.co.uk in Vercel Project Settings → Environment Variables, then redeploy.",
      },
      { status: 500 }
    );
  }

  const body = await req.json().catch(() => ({}));

  const url = `${backendBase}/api/auth/register`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const text = await res.text().catch(() => "");
    const data = text ? safeJson(text) : null;

    return NextResponse.json(data ?? null, { status: res.status });
  } catch (err: any) {
    return NextResponse.json(
      {
        message: "Failed to reach backend register endpoint.",
        url,
        error: err?.message || String(err),
      },
      { status: 502 }
    );
  }
}

function safeJson(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text.slice(0, 2000) };
  }
}
