import { QueryClient } from "@tanstack/react-query";
import {
  buildRetryFunction,
  buildMutationRetryFunction,
  computeRetryDelay,
} from "@/lib/errors";

/**
 * Shared QueryClient instance with smart retry logic for mobile.
 *
 * - staleTime: 5 minutes (avoids refetching on every screen focus)
 * - retry: skips non-retryable errors (auth, permission, not-found); retries
 *   transient failures (network, server) up to 3 times for queries, 1 for mutations
 * - retryDelay: exponential backoff 1s → 2s → 4s → … capped at 10s
 * - refetchOnWindowFocus: false (not applicable on mobile)
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: buildRetryFunction(3),
      retryDelay: (attemptIndex) => computeRetryDelay(attemptIndex + 1),
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: buildMutationRetryFunction(),
      retryDelay: (attemptIndex) => computeRetryDelay(attemptIndex + 1),
    },
  },
});
