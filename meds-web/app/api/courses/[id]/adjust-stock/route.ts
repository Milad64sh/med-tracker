import { NextRequest, NextResponse } from "next/server";
import { getTokenFromCookie } from "@/app/api/_utils/backend";

export const dynamic = "force-dynamic";

function getBackendBaseUrl() {
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

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> } // ✅ params is a Promise in your environment
) {
  const backendBase = getBackendBaseUrl();
  if (!backendBase) {
    return NextResponse.json(
      { message: "Server misconfiguration: backend base URL is not set." },
      { status: 500 }
    );
  }

  const token = await getTokenFromCookie();
  if (!token) {
    return NextResponse.json({ message: "Unauthenticated" }, { status: 401 });
  }

  // ✅ unwrap params properly
  const { id } = await context.params;

  // ✅ hard guard so you never send "undefined" to the backend again
  if (!id || id === "undefined") {
    return NextResponse.json(
      { message: "Invalid course id." },
      { status: 400 }
    );
  }

  const url = `${backendBase}/api/courses/${id}/adjust-stock`;

  const bodyText = await req.text().catch(() => "");
  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: bodyText || undefined,
  });

  const text = await res.text().catch(() => "");
  const data = text ? safeJson(text) : null;

  return NextResponse.json(data, { status: res.status });
}
