import { redirect } from "next/navigation";
import { cookies, headers } from "next/headers";

async function getMe() {
  const cookieStore = await cookies();
  const token = cookieStore.get("mt_token")?.value;
  if (!token) return null;

  const h = await headers();
  const host = h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";

  if (!host) return null;

  const origin = `${proto}://${host}`;

  const res = await fetch(`${origin}/api/auth/me`, {
    headers: { cookie: `mt_token=${token}` },
    cache: "no-store",
  });

  if (!res.ok) return null;
  return res.json();
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const me = await getMe();

  const allowed =
    me && (me.role === "admin" || me.role === "owner" || me.is_admin === true);

  if (!allowed) redirect("/dashboard");

  return <>{children}</>;
}
