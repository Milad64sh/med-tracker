/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { backendUrl } from "@/app/api/_utils/backend";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const url = backendUrl("/api/auth/login");
    console.log("LOGIN URL:", url);

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
      // no credentials needed here; we store token ourselves
    });

    const text = await res.text().catch(() => "");
    const data = text ? safeJson(text) : null;

    if (!res.ok) {
      // Always return something meaningful
      return NextResponse.json(
        {
          message:
            (data as any)?.message ||
            (data as any)?.error ||
            (typeof data === "object" ? "Login failed" : text?.slice(0, 300)) ||
            `Upstream HTTP ${res.status}`,
          status: res.status,
          upstream: data ?? text,
        },
        { status: res.status }
      );
    }

    const token =
      (data as any)?.token ||
      (data as any)?.access_token ||
      (data as any)?.data?.token;

    if (!token) {
      return NextResponse.json(
        { message: "No token returned from backend", upstream: data ?? text },
        { status: 500 }
      );
    }

    (await cookies()).set("mt_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return NextResponse.json({ user: (data as any)?.user ?? null }, { status: 200 });
  } catch (err: any) {
    console.error("Login route crashed:", err?.message || err, err?.stack);
    return NextResponse.json(
      { message: "Login route crashed", error: String(err?.message || err) },
      { status: 500 }
    );
  }
}

function safeJson(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}
