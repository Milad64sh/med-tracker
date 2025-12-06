import { useQuery } from '@tanstack/react-query';
import { fetcher } from '@/lib/api';
import type { DashboardResponse } from './types';

export const qk = {
  dashboard: ['dashboard'] as const,
};

export function useDashboard() {
  return useQuery({
    queryKey: qk.dashboard,
    queryFn: () => fetcher<DashboardResponse>('/api/dashboard'),
    refetchInterval: 90_000, // auto-refresh every 90 sec
  });
}
