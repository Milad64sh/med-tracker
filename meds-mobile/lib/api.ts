// import axios from 'axios';

// http://192.168.0.177:8080
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ||
  'http://192.168.0.177:8080';

  
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';


export async function fetcher<T>(
  path: string,
  opts: { method?: HttpMethod; body?: any; headers?: Record<string, string> } = {}
): Promise<T> {
  const url = `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  const res = await fetch(url, {
    method: opts.method ?? 'GET',
    headers: {
      'Accept': 'application/json',
      ...(opts.body ? { 'Content-Type': 'application/json' } : {}),
      ...(opts.headers ?? {}),
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
  }
  return res.json() as Promise<T>;
}

// export type Service = { id: number; name: string; address?: string };
// export type Course = { id: number; name: string; strength?: string; form?: string; daily_use?: number; runout_date?: string | null; };
// export type Client = { id: number; initials?: string; dob?: string; service?: Service | null; courses?: Course[] };

// export async function getClient(id: number): Promise<Client> {
//   const { data } = await api.get(`/clients/${id}`);
//   return data.data ?? data;
// }
// export async function getServices(): Promise<Service[]> {
//   const { data } = await api.get('/services');
//   return data.data ?? data;
// }
