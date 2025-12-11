
//  192.168.0.177
//  192.168.1.174
// https://api.miladshalikarian.co.uk
// http://localhost:8080

/* eslint-disable @typescript-eslint/no-explicit-any */

export const API_BASE_URL =
  (process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.miladshalikarian.co.uk").replace(/\/$/, "");



type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
type FetcherOpts = { method?: HttpMethod; body?: any; headers?: Record<string, string> };

function toUrl(path: string) {
  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

function tryParseJson(text: string) {
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return { raw: text };
  }
}

/** Unwrap `{ data: ... }` if present, else return the object as-is */
export function unwrapData<T = any>(payload: any): T {
  if (payload && typeof payload === "object" && "data" in payload) return payload.data as T;
  return payload as T;
}

/**
 * Global auth token, set from AuthContext.
 * This is used automatically in all fetcher() calls.
 */
let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

export async function fetcher<T = any>(path: string, opts: FetcherOpts = {}): Promise<T> {
  const url = toUrl(path);
  let res: Response;

  try {
    res = await fetch(url, {
      method: opts.method ?? "GET",
      headers: {
        Accept: "application/json",
        ...(opts.body ? { "Content-Type": "application/json" } : {}),
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        ...(opts.headers ?? {}),
      },
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    });
  } catch (netErr: any) {
    const msg = `Network error fetching ${url}: ${netErr?.message || netErr}`;
    throw Object.assign(new Error(msg), { cause: netErr });
  }

  const isNoContent = res.status === 204 || res.headers.get("Content-Length") === "0";
  const text = isNoContent ? "" : await res.text().catch(() => "");
  const data = text ? tryParseJson(text) : null;

  if (!res.ok) {
    const msg =
      (data && (data.message || data.error)) ||
      (typeof data?.raw === "string" && data.raw.slice(0, 300)) ||
      res.statusText ||
      `HTTP ${res.status}`;
    const err: any = new Error(`HTTP ${res.status} ${res.statusText}: ${msg}`);
    err.status = res.status;
    err.url = url;
    err.details = data;
    throw err;
  }

  if (!text) return undefined as unknown as T;

  return data as T;
}
