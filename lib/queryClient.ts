import { QueryClient } from "@tanstack/react-query";

/**
 * Shared QueryClient instance with sensible defaults for mobile.
 *
 * - staleTime: 5 minutes (avoids refetching on every screen focus)
 * - retry: 2 (retry failed requests twice before surfacing error)
 * - refetchOnWindowFocus: false (not applicable on mobile)
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 2,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});
