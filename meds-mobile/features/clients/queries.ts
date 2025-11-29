import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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

type ClientLookup = { id: number; initials: string; dob?: string; service?: { id?: number; name?: string } };

export function useClientLookup() {
  return useQuery<ClientLookup[]>({
    queryKey: ["clients","lookup"],
    queryFn: async () => {
      const res = await fetcher<ClientLookup[] | { data: ClientLookup[] }>("/api/clients/lookup");
      return Array.isArray(res) ? res : res?.data ?? [];
    },
    initialData: [],
  });
}

export function useDeleteClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await fetcher(`/api/clients/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      // refresh list after delete
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });
}