import { cookies } from "next/headers";

const BACKEND = (process.env.BACKEND_API_BASE_URL || "").replace(/\/$/, "");

export function backendUrl(path: string) {
  if (!BACKEND) {
    throw new Error(
      "BACKEND_API_BASE_URL is not set. Set it in Vercel Environment Variables."
    );
  }
  return `${BACKEND}${path.startsWith("/") ? path : `/${path}`}`;
}

export async function getTokenFromCookie() {
  return (await cookies()).get("mt_token")?.value || null;
}
