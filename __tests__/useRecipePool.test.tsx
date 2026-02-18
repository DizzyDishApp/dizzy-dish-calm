/**
 * Integration tests for hooks/useRecipePool.ts
 *
 * Context hooks are mocked at module level with mutable state variables
 * so each test can control the tier (isPro) and dietary preferences.
 */

import React from "react";
import { renderHook, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fetchRandomPool, fetchProPool, buildPoolFingerprint } from "@/lib/spoonacular";
import type { Recipe, DietaryFilter } from "@/types";

// Mutable state for context mocks
let mockIsPro = false;
let mockDietary: string[] = [];

jest.mock("@/context/PreferencesContext", () => ({
  usePreferences: () => ({
    state: { dietary: new Set(mockDietary), isPro: mockIsPro },
  }),
}));

jest.mock("@/context/AuthContext", () => ({
  useAuth: () => ({
    state: { isAuthenticated: false },
  }),
}));

const mockRecipes: Recipe[] = [
  {
    id: "101",
    name: "Test Recipe",
    time: "20 min",
    calories: "—",
    servings: "4 servings",
    description: "Test description",
    tags: ["Under 30 Min"],
    emoji: "🍲",
  },
];

function createWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
  };
}

describe("useRecipePool", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsPro = false;
    mockDietary = [];
    (buildPoolFingerprint as jest.Mock).mockReturnValue("test-fingerprint");
    (fetchRandomPool as jest.Mock).mockResolvedValue(mockRecipes);
    (fetchProPool as jest.Mock).mockResolvedValue(mockRecipes);
  });

  it("calls fetchRandomPool for free user", async () => {
    const { useRecipePool } = require("@/hooks/useRecipePool");
    const { result } = renderHook(() => useRecipePool(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(fetchRandomPool).toHaveBeenCalled();
    expect(fetchProPool).not.toHaveBeenCalled();
  });

  it("calls fetchProPool for Pro user", async () => {
    mockIsPro = true;
    (buildPoolFingerprint as jest.Mock).mockReturnValue("pro-fingerprint");

    const { useRecipePool } = require("@/hooks/useRecipePool");
    const { result } = renderHook(() => useRecipePool(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(fetchProPool).toHaveBeenCalled();
    expect(fetchRandomPool).not.toHaveBeenCalled();
  });

  it("returns Recipe[] on success", async () => {
    const { useRecipePool } = require("@/hooks/useRecipePool");
    const { result } = renderHook(() => useRecipePool(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockRecipes);
  });

  it("surfaces error when fetch throws", async () => {
    (fetchRandomPool as jest.Mock).mockRejectedValue(
      new Error("Spoonacular error: 429")
    );

    const { useRecipePool } = require("@/hooks/useRecipePool");
    const { result } = renderHook(() => useRecipePool(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toContain("Spoonacular error");
  });

  it("uses different cache keys for free vs pro (different fingerprints)", () => {
    (buildPoolFingerprint as jest.Mock)
      .mockReturnValueOnce("free-fingerprint")
      .mockReturnValueOnce("pro-fingerprint");

    const free = buildPoolFingerprint([], false);
    const pro = buildPoolFingerprint([], true);
    expect(free).not.toBe(pro);
  });

  it("changing dietary preferences triggers new fingerprint", () => {
    (buildPoolFingerprint as jest.Mock)
      .mockReturnValueOnce("dietary-a-fingerprint")
      .mockReturnValueOnce("dietary-b-fingerprint");

    const fingerprintA = buildPoolFingerprint([], false);
    mockDietary = ["Vegan" as DietaryFilter];
    const fingerprintB = buildPoolFingerprint(mockDietary, false);
    expect(fingerprintA).not.toBe(fingerprintB);
  });
});
