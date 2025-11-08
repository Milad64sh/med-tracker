import { useQuery } from '@tanstack/react-query';
import { fetcher } from '@/lib/api';
import type { Client, Paginated } from '@/features/dashboard/types';

export function useClients() {
  return useQuery<Client[], Error>({
    queryKey: ['clients'],
    queryFn: async () => {
      const res = await fetcher<Client[] | Paginated<Client>>('/api/clients');
      return Array.isArray(res) ? res : res?.data ?? [];
    },
  });
}
