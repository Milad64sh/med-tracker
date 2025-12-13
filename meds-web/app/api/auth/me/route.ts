import { NextResponse } from "next/server";
import { backendUrl, getTokenFromCookie } from "@/app/api/_utils/backend";

export async function GET() {
  const token = await getTokenFromCookie();
  if (!token) return NextResponse.json({ message: "Unauthenticated" }, { status: 401 });

  const res = await fetch(backendUrl("/api/auth/me"), {
    headers: { 
      Accept: "application/json", 
      Authorization: `Bearer ${token}`
     },
  });

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
