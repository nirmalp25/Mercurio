import { QueryClient } from '@tanstack/react-query';
import { isApiError } from '@/shared/api/ApiError';

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        refetchOnWindowFocus: false,
        // Retry transient failures only; a 4xx will not fix itself.
        retry: (failureCount, error) =>
          failureCount < 2 && !(isApiError(error) && error.status >= 400 && error.status < 500),
      },
    },
  });
}
