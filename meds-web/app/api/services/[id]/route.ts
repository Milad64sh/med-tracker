/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { backendUrl, getTokenFromCookie } from "@/app/api/_utils/backend";

type RouteParams = { id?: string | string[] };

function first(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

function normalizeId(params: RouteParams): number | null {
  const raw = first(params.id);
  if (!raw || raw === "undefined") return null;

  const n = Number(raw);
  if (!Number.isInteger(n) || n <= 0) return null;

  return n;
}

async function readBody(res: Response) {
  const text = await res.text().catch(() => "");
  if (!text) return { text: "", json: null as any };

  try {
    return { text, json: JSON.parse(text) };
  } catch {
    return { text, json: null as any };
  }
}

async function resolveParams(
  params: RouteParams | Promise<RouteParams>
): Promise<RouteParams> {
  return await Promise.resolve(params);
}

export async function GET(
  _req: Request,
  ctx: { params: RouteParams | Promise<RouteParams> }
) {
  const token = await getTokenFromCookie();
  if (!token)
    return NextResponse.json({ message: "Unauthenticated" }, { status: 401 });

  const params = await resolveParams(ctx.params);
  const id = normalizeId(params);

  if (!id) {
    return NextResponse.json(
      { message: "Invalid service id", debug: { params } },
      { status: 400 }
    );
  }

  const res = await fetch(backendUrl(`/api/services/${id}`), {
    headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
  });

  const { json, text } = await readBody(res);

  if (!json && text) {
    return NextResponse.json(
      { message: "Upstream returned non-JSON response", raw: text.slice(0, 2000) },
      { status: res.status }
    );
  }

  return NextResponse.json(json ?? null, { status: res.status });
}

export async function PATCH(
  req: Request,
  ctx: { params: RouteParams | Promise<RouteParams> }
) {
  const token = await getTokenFromCookie();
  if (!token)
    return NextResponse.json({ message: "Unauthenticated" }, { status: 401 });

  const params = await resolveParams(ctx.params);
  const id = normalizeId(params);

  if (!id) {
    return NextResponse.json(
      { message: "Invalid service id", debug: { params } },
      { status: 400 }
    );
  }

  const body = await req.json();

  const res = await fetch(backendUrl(`/api/services/${id}`), {
    method: "PATCH",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const { json, text } = await readBody(res);

  if (!json && text) {
    return NextResponse.json(
      { message: "Upstream returned non-JSON response", raw: text.slice(0, 2000) },
      { status: res.status }
    );
  }

  return NextResponse.json(json ?? null, { status: res.status });
}

export async function DELETE(
  _req: Request,
  ctx: { params: RouteParams | Promise<RouteParams> }
) {
  const token = await getTokenFromCookie();
  if (!token)
    return NextResponse.json({ message: "Unauthenticated" }, { status: 401 });

  const params = await resolveParams(ctx.params);
  const id = normalizeId(params);

  if (!id) {
    return NextResponse.json(
      { message: "Invalid service id", debug: { params } },
      { status: 400 }
    );
  }

  const res = await fetch(backendUrl(`/api/services/${id}`), {
    method: "DELETE",
    headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
  });

  if (res.status === 204) return new NextResponse(null, { status: 204 });

  const { json, text } = await readBody(res);

  if (!json && text) {
    return NextResponse.json(
      { message: "Upstream returned non-JSON response", raw: text.slice(0, 2000) },
      { status: res.status }
    );
  }

  return NextResponse.json(json ?? null, { status: res.status });
}
