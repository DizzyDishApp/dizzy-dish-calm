/**
 * Unit tests for hooks/useSpinRecipe.ts
 *
 * Tests that mutations delegate to drawRecipeFromPool / drawWeeklyPlanFromPool
 * and pre-populate the React Query cache on success.
 */

import React from "react";
import { renderHook, act, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import type { Recipe, WeeklyPlan } from "@/types";
import type { DrawRequest } from "@/lib/api";

// Mock the api module's draw functions
const mockDrawRecipe = jest.fn();
const mockDrawWeeklyPlan = jest.fn();

jest.mock("@/lib/api", () => ({
  drawRecipeFromPool: (...args: unknown[]) => mockDrawRecipe(...args),
  drawWeeklyPlanFromPool: (...args: unknown[]) => mockDrawWeeklyPlan(...args),
}));

const mockRecipe: Recipe = {
  id: "42",
  name: "Test Recipe",
  time: "25 min",
  calories: "—",
  servings: "4 servings",
  description: "A test",
  tags: ["Under 30 Min"],
  emoji: "🍲",
};

const mockWeeklyPlan: WeeklyPlan = {
  id: "wp-test",
  days: [
    { day: "Monday", recipe: mockRecipe },
    { day: "Tuesday", recipe: { ...mockRecipe, id: "43" } },
    { day: "Wednesday", recipe: { ...mockRecipe, id: "44" } },
    { day: "Thursday", recipe: { ...mockRecipe, id: "45" } },
    { day: "Friday", recipe: { ...mockRecipe, id: "46" } },
    { day: "Saturday", recipe: { ...mockRecipe, id: "47" } },
    { day: "Sunday", recipe: { ...mockRecipe, id: "48" } },
  ],
  sharedIngredients: [],
  totalItems: 0,
  reducedItems: 0,
};

const mockRequest: DrawRequest = {
  dietary: [],
  time: "Any",
  calories: "Moderate",
  isPro: false,
};

function createWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 }, mutations: { retry: false } },
  });
  return {
    qc,
    Wrapper: function Wrapper({ children }: { children: React.ReactNode }) {
      return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
    },
  };
}

describe("useSpinRecipe", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls drawRecipeFromPool with queryClient and request", async () => {
    mockDrawRecipe.mockReturnValue(mockRecipe);
    const { qc, Wrapper } = createWrapper();

    const { useSpinRecipe } = require("@/hooks/useSpinRecipe");
    const { result } = renderHook(() => useSpinRecipe(), { wrapper: Wrapper });

    await act(async () => {
      result.current.mutate(mockRequest);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockDrawRecipe).toHaveBeenCalledWith(qc, mockRequest);
  });

  it("returns selected recipe as mutation data", async () => {
    mockDrawRecipe.mockReturnValue(mockRecipe);
    const { Wrapper } = createWrapper();

    const { useSpinRecipe } = require("@/hooks/useSpinRecipe");
    const { result } = renderHook(() => useSpinRecipe(), { wrapper: Wrapper });

    await act(async () => {
      result.current.mutate(mockRequest);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockRecipe);
  });

  it("pre-populates recipe detail cache on success", async () => {
    mockDrawRecipe.mockReturnValue(mockRecipe);
    const { qc, Wrapper } = createWrapper();
    const setQueryDataSpy = jest.spyOn(qc, "setQueryData");

    const { useSpinRecipe } = require("@/hooks/useSpinRecipe");
    const { result } = renderHook(() => useSpinRecipe(), { wrapper: Wrapper });

    await act(async () => {
      result.current.mutate(mockRequest);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Verify onSuccess pre-populated the recipe detail cache
    expect(setQueryDataSpy).toHaveBeenCalledWith(
      queryKeys.recipes.detail("42"),
      mockRecipe
    );
  });

  it("isError true when drawRecipeFromPool throws", async () => {
    mockDrawRecipe.mockImplementation(() => {
      throw new Error("No recipes match your filters.");
    });
    const { Wrapper } = createWrapper();

    const { useSpinRecipe } = require("@/hooks/useSpinRecipe");
    const { result } = renderHook(() => useSpinRecipe(), { wrapper: Wrapper });

    await act(async () => {
      result.current.mutate(mockRequest);
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toContain("No recipes match");
  });
});

describe("useSpinWeeklyPlan", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls drawWeeklyPlanFromPool with queryClient and request", async () => {
    mockDrawWeeklyPlan.mockReturnValue(mockWeeklyPlan);
    const { qc, Wrapper } = createWrapper();

    const { useSpinWeeklyPlan } = require("@/hooks/useSpinRecipe");
    const { result } = renderHook(() => useSpinWeeklyPlan(), { wrapper: Wrapper });

    await act(async () => {
      result.current.mutate(mockRequest);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockDrawWeeklyPlan).toHaveBeenCalledWith(qc, mockRequest);
  });

  it("returns WeeklyPlan as mutation data", async () => {
    mockDrawWeeklyPlan.mockReturnValue(mockWeeklyPlan);
    const { Wrapper } = createWrapper();

    const { useSpinWeeklyPlan } = require("@/hooks/useSpinRecipe");
    const { result } = renderHook(() => useSpinWeeklyPlan(), { wrapper: Wrapper });

    await act(async () => {
      result.current.mutate(mockRequest);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockWeeklyPlan);
  });

  it("pre-populates weekly plan cache on success", async () => {
    mockDrawWeeklyPlan.mockReturnValue(mockWeeklyPlan);
    const { qc, Wrapper } = createWrapper();
    const setQueryDataSpy = jest.spyOn(qc, "setQueryData");

    const { useSpinWeeklyPlan } = require("@/hooks/useSpinRecipe");
    const { result } = renderHook(() => useSpinWeeklyPlan(), { wrapper: Wrapper });

    await act(async () => {
      result.current.mutate(mockRequest);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Verify onSuccess pre-populated the weekly plan cache
    expect(setQueryDataSpy).toHaveBeenCalledWith(
      queryKeys.weeklyPlans.detail("wp-test"),
      mockWeeklyPlan
    );
  });

  it("isError true when drawWeeklyPlanFromPool throws", async () => {
    mockDrawWeeklyPlan.mockImplementation(() => {
      throw new Error("Not enough recipes match your filters.");
    });
    const { Wrapper } = createWrapper();

    const { useSpinWeeklyPlan } = require("@/hooks/useSpinRecipe");
    const { result } = renderHook(() => useSpinWeeklyPlan(), { wrapper: Wrapper });

    await act(async () => {
      result.current.mutate(mockRequest);
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toContain("Not enough recipes");
  });
});
