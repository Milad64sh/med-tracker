
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
  { params }: { params: Promise<{ id: string }> }
) {
  const backendBase = getBackendBaseUrl();
  if (!backendBase) {
    return NextResponse.json(
      { message: "Server misconfiguration: backend base URL is not set." },
      { status: 500 }
    );
  }

  const token = await getTokenFromCookie();
  if (!token) return NextResponse.json({ message: "Unauthenticated" }, { status: 401 });

  const { id } = await params;

  const url = `${backendBase}/api/courses/${id}/restock`;

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
