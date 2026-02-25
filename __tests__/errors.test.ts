import { ApiError } from "@/types";
import {
  classifyError,
  isRetryable,
  toUserMessage,
  buildRetryFunction,
  buildMutationRetryFunction,
  computeRetryDelay,
} from "@/lib/errors";

describe("classifyError", () => {
  it("passes through an existing ApiError unchanged", () => {
    const original = new ApiError("AUTH_ERROR", "already typed");
    const result = classifyError(original);
    expect(result).toBe(original);
  });

  it("classifies TypeError as NETWORK_ERROR", () => {
    const err = new TypeError("Network request failed");
    const result = classifyError(err);
    expect(result).toBeInstanceOf(ApiError);
    expect(result.code).toBe("NETWORK_ERROR");
  });

  it("classifies Supabase status 401 as AUTH_ERROR", () => {
    const err = { message: "Unauthorized", status: 401 };
    const result = classifyError(err);
    expect(result).toBeInstanceOf(ApiError);
    expect(result.code).toBe("AUTH_ERROR");
  });

  it("classifies Supabase status 403 as PERMISSION_ERROR", () => {
    const err = { message: "Forbidden", status: 403 };
    const result = classifyError(err);
    expect(result).toBeInstanceOf(ApiError);
    expect(result.code).toBe("PERMISSION_ERROR");
  });

  it("classifies Supabase status 500 as SERVER_ERROR", () => {
    const err = { message: "Internal Server Error", status: 500 };
    const result = classifyError(err);
    expect(result).toBeInstanceOf(ApiError);
    expect(result.code).toBe("SERVER_ERROR");
  });

  it("classifies Supabase code PGRST116 as NOT_FOUND_ERROR", () => {
    const err = { message: "Row not found", code: "PGRST116" };
    const result = classifyError(err);
    expect(result).toBeInstanceOf(ApiError);
    expect(result.code).toBe("NOT_FOUND_ERROR");
  });

  it("classifies generic Error with no status as UNKNOWN_ERROR", () => {
    const err = new Error("Something went wrong");
    const result = classifyError(err);
    expect(result).toBeInstanceOf(ApiError);
    expect(result.code).toBe("UNKNOWN_ERROR");
  });
});

describe("isRetryable", () => {
  it("AUTH_ERROR → false", () => {
    expect(isRetryable("AUTH_ERROR")).toBe(false);
  });

  it("PERMISSION_ERROR → false", () => {
    expect(isRetryable("PERMISSION_ERROR")).toBe(false);
  });

  it("NOT_FOUND_ERROR → false", () => {
    expect(isRetryable("NOT_FOUND_ERROR")).toBe(false);
  });

  it("NETWORK_ERROR → true", () => {
    expect(isRetryable("NETWORK_ERROR")).toBe(true);
  });

  it("SERVER_ERROR → true", () => {
    expect(isRetryable("SERVER_ERROR")).toBe(true);
  });

  it("UNKNOWN_ERROR → true", () => {
    expect(isRetryable("UNKNOWN_ERROR")).toBe(true);
  });
});

describe("toUserMessage", () => {
  it("AUTH_ERROR → sign in message", () => {
    expect(toUserMessage("AUTH_ERROR")).toBe("Please sign in again to continue.");
  });

  it("PERMISSION_ERROR → permission message", () => {
    expect(toUserMessage("PERMISSION_ERROR")).toBe("You don't have permission to do that.");
  });

  it("NETWORK_ERROR → connection message", () => {
    expect(toUserMessage("NETWORK_ERROR")).toBe("Check your connection and try again.");
  });

  it("SERVER_ERROR → server error message", () => {
    expect(toUserMessage("SERVER_ERROR")).toBe(
      "Something went wrong on our end. Try again in a moment."
    );
  });

  it("NOT_FOUND_ERROR → not found message", () => {
    expect(toUserMessage("NOT_FOUND_ERROR")).toBe("That item could not be found.");
  });

  it("UNKNOWN_ERROR → generic error message", () => {
    expect(toUserMessage("UNKNOWN_ERROR")).toBe("Something went wrong. Please try again.");
  });
});

describe("buildRetryFunction — queries", () => {
  const retry = buildRetryFunction(3);

  it("AUTH_ERROR, failureCount=1 → false", () => {
    const err = new ApiError("AUTH_ERROR", "not authenticated");
    expect(retry(1, err)).toBe(false);
  });

  it("NETWORK_ERROR, failureCount=1 → true", () => {
    const err = new ApiError("NETWORK_ERROR", "network error");
    expect(retry(1, err)).toBe(true);
  });

  it("NETWORK_ERROR, failureCount=3 → true", () => {
    const err = new ApiError("NETWORK_ERROR", "network error");
    expect(retry(3, err)).toBe(true);
  });

  it("NETWORK_ERROR, failureCount=4 → false (exceeds max 3)", () => {
    const err = new ApiError("NETWORK_ERROR", "network error");
    expect(retry(4, err)).toBe(false);
  });

  it("SERVER_ERROR, failureCount=4 → false", () => {
    const err = new ApiError("SERVER_ERROR", "server error");
    expect(retry(4, err)).toBe(false);
  });
});

describe("buildMutationRetryFunction", () => {
  const retry = buildMutationRetryFunction();

  it("AUTH_ERROR, failureCount=1 → false", () => {
    const err = new ApiError("AUTH_ERROR", "not authenticated");
    expect(retry(1, err)).toBe(false);
  });

  it("NETWORK_ERROR, failureCount=1 → true", () => {
    const err = new ApiError("NETWORK_ERROR", "network error");
    expect(retry(1, err)).toBe(true);
  });

  it("NETWORK_ERROR, failureCount=2 → false (exceeds max 1)", () => {
    const err = new ApiError("NETWORK_ERROR", "network error");
    expect(retry(2, err)).toBe(false);
  });
});

describe("computeRetryDelay", () => {
  it("attempt 1 → 1000ms", () => {
    expect(computeRetryDelay(1)).toBe(1000);
  });

  it("attempt 2 → 2000ms", () => {
    expect(computeRetryDelay(2)).toBe(2000);
  });

  it("attempt 3 → 4000ms", () => {
    expect(computeRetryDelay(3)).toBe(4000);
  });

  it("attempt 4 → 8000ms", () => {
    expect(computeRetryDelay(4)).toBe(8000);
  });

  it("attempt 5 → 10000ms (capped)", () => {
    expect(computeRetryDelay(5)).toBe(10000);
  });
});
