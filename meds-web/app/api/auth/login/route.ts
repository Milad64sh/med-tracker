import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { backendUrl } from "@/app/api/_utils/backend";

export async function POST(req: Request) {
  const body = await req.json();

  const res = await fetch(backendUrl("/api/auth/login"), {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
       Accept: "application/json"
       },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    return NextResponse.json(data, { status: res.status });
  }

  const token = data?.token || data?.access_token || data?.data?.token;
  if (!token) {
    return NextResponse.json({ message: "No token returned" }, { status: 500 });
  }

  // HttpOnly cookie (best)
  (await
    // HttpOnly cookie (best)
    cookies()).set("mt_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
  const url = backendUrl("/api/auth/login");
console.log("LOGIN URL:", url);


  // Return user (token not needed on client)
  return NextResponse.json({ user: data.user }, { status: 200 });
}
