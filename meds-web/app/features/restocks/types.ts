/* eslint-disable @typescript-eslint/no-explicit-any */

export type RestockLog = {
  id: number;
  action: 'restock' | string;
  restock_date: string | null;
  created_at: string;

  before: Record<string, any> | null;
  after: Record<string, any> | null;

  user: { id: number; name: string; email: string };
  course: { id: number; name: string; strength: string | null };
  client: { id: number; initials: string | null };
};

export type Paginated<T> = {
  data: T[];
  current_page: number;
  per_page: number;
  last_page: number;
  total: number;
};
