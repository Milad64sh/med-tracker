/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { backendUrl, getTokenFromCookie } from "@/app/api/_utils/backend";

export const dynamic = "force-dynamic";

async function readBody(res: Response) {
  const text = await res.text().catch(() => "");
  if (!text) return { text: "", json: null as any };
  try {
    return { text, json: JSON.parse(text) };
  } catch {
    return { text, json: null as any };
  }
}

export async function POST(req: Request) {
  const token = await getTokenFromCookie();
  if (!token) return NextResponse.json({ message: "Unauthenticated" }, { status: 401 });

  const body = await req.json().catch(() => ({}));

  const res = await fetch(backendUrl("/api/alerts/email-gp"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });

  const { text, json } = await readBody(res);

  return NextResponse.json(
    json ?? { message: "Backend returned non-JSON response", status: res.status, raw: text.slice(0, 2000) },
    { status: res.status }
  );
}
