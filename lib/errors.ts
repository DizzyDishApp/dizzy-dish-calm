import { ApiError, type ApiErrorCode } from "@/types";

/**
 * Classifies any thrown value into a typed ApiError.
 * - Already an ApiError → passthrough
 * - TypeError → NETWORK_ERROR
 * - Supabase error with PGRST116 code → NOT_FOUND_ERROR
 * - Supabase error with HTTP status → AUTH/PERMISSION/SERVER error
 * - Generic Error → UNKNOWN_ERROR
 */
export function classifyError(err: unknown): ApiError {
  if (err instanceof ApiError) return err;

  if (err instanceof TypeError) {
    return new ApiError("NETWORK_ERROR", err.message);
  }

  if (err !== null && typeof err === "object") {
    const e = err as Record<string, unknown>;

    if (e.code === "PGRST116") {
      return new ApiError("NOT_FOUND_ERROR", String(e.message ?? "Not found"));
    }

    const status = typeof e.status === "number" ? e.status : undefined;
    const message = String(e.message ?? "An error occurred");

    if (status === 401) return new ApiError("AUTH_ERROR", message, status);
    if (status === 403) return new ApiError("PERMISSION_ERROR", message, status);
    if (status !== undefined && status >= 500) {
      return new ApiError("SERVER_ERROR", message, status);
    }
  }

  if (err instanceof Error) {
    return new ApiError("UNKNOWN_ERROR", err.message);
  }

  return new ApiError("UNKNOWN_ERROR", "An unknown error occurred");
}

/** Returns true if the error code warrants automatic retry. */
export function isRetryable(code: ApiErrorCode): boolean {
  const nonRetryable: ApiErrorCode[] = ["AUTH_ERROR", "PERMISSION_ERROR", "NOT_FOUND_ERROR"];
  return !nonRetryable.includes(code);
}

/** Maps an ApiErrorCode to a user-facing message string. */
export function toUserMessage(code: ApiErrorCode): string {
  switch (code) {
    case "AUTH_ERROR":
      return "Please sign in again to continue.";
    case "PERMISSION_ERROR":
      return "You don't have permission to do that.";
    case "NETWORK_ERROR":
      return "Check your connection and try again.";
    case "SERVER_ERROR":
      return "Something went wrong on our end. Try again in a moment.";
    case "NOT_FOUND_ERROR":
      return "That item could not be found.";
    case "EMPTY_POOL":
    case "NO_MATCHING_RECIPES":
    case "UNKNOWN_ERROR":
    default:
      return "Something went wrong. Please try again.";
  }
}

/**
 * Builds a React Query retry function.
 * Non-retryable errors (auth, permission, not-found) are never retried.
 * All others retry up to maxRetries times (inclusive).
 */
export function buildRetryFunction(
  maxRetries = 3
): (failureCount: number, error: unknown) => boolean {
  return (failureCount: number, error: unknown): boolean => {
    if (error instanceof ApiError && !isRetryable(error.code)) return false;
    return failureCount <= maxRetries;
  };
}

/**
 * Builds a React Query retry function for mutations.
 * Same logic as buildRetryFunction but with a lower max (1 retry).
 */
export function buildMutationRetryFunction(): (
  failureCount: number,
  error: unknown
) => boolean {
  return buildRetryFunction(1);
}

/**
 * Exponential backoff delay: 1s, 2s, 4s, … capped at 10s.
 * @param attempt 1-based attempt index.
 */
export function computeRetryDelay(attempt: number): number {
  return Math.min(1000 * Math.pow(2, attempt - 1), 10_000);
}
