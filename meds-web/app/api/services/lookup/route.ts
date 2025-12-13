import { NextResponse } from "next/server";
import { backendUrl, getTokenFromCookie } from "@/app/api/_utils/backend";

export async function GET(req: Request) {
  const token = await getTokenFromCookie();
  if (!token) {
    return NextResponse.json({ message: "Unauthenticated" }, { status: 401 });
  }

  const { search } = new URL(req.url);

  const res = await fetch(backendUrl(`/api/services${search}`), {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json().catch(() => ({}));

  // Return only the rows array (nice for dropdowns)
  const rows =
    Array.isArray(data) ? data :
    Array.isArray(data?.data) ? data.data :
    Array.isArray(data?.data?.data) ? data.data.data :
    [];

  return NextResponse.json(rows, { status: res.status });
}
