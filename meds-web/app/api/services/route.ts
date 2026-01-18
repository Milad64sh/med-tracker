import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    { ok: true, where: "services-route.ts", version: "v-2026-01-18" },
    { headers: { "x-route-fingerprint": "services-get-v-2026-01-18" } }
  );
}

export async function POST() {
  return NextResponse.json(
    { ok: true, where: "services-route.ts", post: true, version: "v-2026-01-18" },
    { headers: { "x-route-fingerprint": "services-post-v-2026-01-18" } }
  );
}
