import { useQuery } from '@tanstack/react-query';
import { fetcher } from '@/lib/api';

export function useAuth() {
  const { data, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: () => fetcher('/api/auth/me'),
    staleTime: 5 * 60 * 1000,
  });

  return {
    user: data,
    isAdmin: Boolean(data?.is_admin),
    isLoading,
  };
}
