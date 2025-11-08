export type Service = { id: number; name: string };
export type ClientLite = { id: number; name: string; service: Service };
export type AlertRow = {
  course_id: number;
  medication: string;
  days_remaining: number | null;
  runout_date: string | null;
  half_date: string | null;
  client: ClientLite;
  status: 'critical' | 'low' | 'ok' | 'unknown';
};

export type DashboardResponse = {
  kpis: {
    critical: number;
    low: number;
    ok: number;
    pendingOrders: number;
    nextScheduleAt: string | null; // ISO
  };
  topAlerts: AlertRow[];
};

export type Client = {
  id: number;
  initials: string | null;
  dob?: string | null; // "YYYY-MM-DD"
  service?: { id: number; name: string } | null;
};
export type Paginated<T> = { data: T[]; links?: unknown; meta?: unknown };
