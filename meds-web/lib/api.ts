
// //  192.168.0.177
// //  192.168.1.174
// // https://api.miladshalikarian.co.uk
// // http://localhost:8080

/* eslint-disable @typescript-eslint/no-explicit-any */

const isServer = typeof window === 'undefined';

export const API_BASE_URL = isServer
  ? (process.env.BACKEND_API_BASE_URL || '')
  : (process.env.NEXT_PUBLIC_API_BASE_URL || '');

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
type FetcherOpts = { method?: HttpMethod; body?: any; headers?: Record<string, string> };

function toUrl(path: string) {
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

function tryParseJson(text: string) {
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return { raw: text };
  }
}

export async function fetcher<T = any>(path: string, opts: FetcherOpts = {}): Promise<T> {
  const url = toUrl(path);
  let res: Response;

  try {
    res = await fetch(url, {
      method: opts.method ?? 'GET',
      credentials: 'include', // important for HttpOnly cookie auth
      headers: {
        Accept: 'application/json',
        ...(opts.body ? { 'Content-Type': 'application/json' } : {}),
        ...(opts.headers ?? {}),
      },
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    });
  } catch (netErr: any) {
    const msg = `Network error fetching ${url}: ${netErr?.message || netErr}`;
    throw Object.assign(new Error(msg), { cause: netErr });
  }

  const isNoContent = res.status === 204 || res.headers.get('Content-Length') === '0';
  const text = isNoContent ? '' : await res.text().catch(() => '');
  const data = text ? tryParseJson(text) : null;

  if (!res.ok) {
    const msg =
      (data && (data.message || data.error)) ||
      (typeof data?.raw === 'string' && data.raw.slice(0, 300)) ||
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
