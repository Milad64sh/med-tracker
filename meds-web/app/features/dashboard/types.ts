export type Service = { 
  id: number; 
  name: string 
};
export type ClientLite = { 
  id: number; 
  name: string; 
  service: Service 
};

export type DashboardResponse = {
  kpis: {
    critical: number;
    low: number;
    ok: number;
    pendingOrders: number;
    nextScheduleAt: string | null; // ISO
  };
  alerts: AlertRow[];
};

export type Client = {
  id: number;
  initials: string | null;
  client_name?: string | null;
  dob?: string | null; // "YYYY-MM-DD"
  service?: { id: number; name: string } | null;
  gp_email?: string | null;
};
export type Paginated<T> = { 
  data: T[]; 
  links?: unknown; 
  meta?: unknown 
};

export type AlertRow = {
  course_id: number;
  medication: string | null;
  status: 'critical' | 'low' | 'ok' | 'unknown';
  units_remaining: number | null;
  days_remaining?: number | null;
  half_date: string | null;
  runout_date: string | null;
  ack?: AckInfo;     
  snooze?: SnoozeInfo;
  client: {
    id: number | null;
    name: string;
    initials?: string | null;
    dob?: string | null;
    gp_email: string | null;
    service: { id: number | null; name: string };
  };
};

export type ClientAlertGroup = {
  client: AlertRow['client'];
  alerts: AlertRow[];
};

export type AckInfo = {
  acknowledged_at: string | null; // ISO
  acknowledged_by: number | null;
  acknowledged_by_name: string | null;
  note: string | null;
};

export type SnoozeInfo = {
  snoozed_until: string | null; // ISO
  snoozed_by: number | null;
  snoozed_by_name: string | null;
  note: string | null;
};
