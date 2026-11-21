import { useQuery } from '@tanstack/react-query';
import { authApi } from '@/shared/api/endpoints';
import { isApiError } from '@/shared/api/ApiError';

export const ME_QUERY_KEY = ['auth', 'me'] as const;

/** Current session user, or null when not signed in (401). */
export function useCurrentUser() {
  return useQuery({
    queryKey: ME_QUERY_KEY,
    queryFn: async ({ signal }) => {
      try {
        return await authApi.me(signal);
      } catch (error) {
        if (isApiError(error) && error.status === 401) return null;
        throw error;
      }
    },
    retry: false,
    staleTime: 5 * 60_000,
  });
}
