import { NextResponse } from "next/server";
import { backendUrl, getTokenFromCookie } from "@/app/api/_utils/backend";

export const dynamic = "force-dynamic"; // ✅ ensures cookie-based auth always runs dynamically

export async function POST(req: Request) {
  const token = await getTokenFromCookie();

  // ✅ temporary debug (super useful): remove once working
  if (!token) {
    return NextResponse.json(
      {
        message: "Unauthenticated",
        debug: {
          hint: "Token cookie not found in this /api/invites request.",
        },
      },
      { status: 401 }
    );
  }

  const body = await req.json();

  const res = await fetch(backendUrl("/api/invites"), {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
