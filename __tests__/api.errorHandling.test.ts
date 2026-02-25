import { supabase } from "@/lib/supabase";
import {
  fetchUserProfile,
  fetchSavedRecipes,
  saveRecipe,
  unsaveRecipe,
  updateUserProStatus,
  drawRecipeFromPool,
} from "@/lib/api";
import { ApiError } from "@/types";
import { queryKeys } from "@/lib/queryKeys";
import { createTestQueryClient } from "@/__tests__/test-utils";
import type { DrawRequest } from "@/lib/api";
import type { Recipe } from "@/types";

const mockGetSession = supabase.auth.getSession as jest.Mock;
const mockFrom = supabase.from as jest.Mock;

const mockSession = { user: { id: "user-abc" } };

beforeEach(() => {
  jest.clearAllMocks();
  mockGetSession.mockResolvedValue({ data: { session: null }, error: null });
});

// ── fetchUserProfile ──

describe("fetchUserProfile", () => {
  it("throws AUTH_ERROR when session is null", async () => {
    const error = await fetchUserProfile().catch((e) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.code).toBe("AUTH_ERROR");
  });

  it("throws SERVER_ERROR when Supabase returns status 500", async () => {
    mockGetSession.mockResolvedValueOnce({ data: { session: mockSession } });
    mockFrom.mockReturnValueOnce({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest
        .fn()
        .mockResolvedValue({ data: null, error: { message: "DB error", status: 500 } }),
    });

    const error = await fetchUserProfile().catch((e) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.code).toBe("SERVER_ERROR");
  });

  it("throws PERMISSION_ERROR when Supabase returns status 403", async () => {
    mockGetSession.mockResolvedValueOnce({ data: { session: mockSession } });
    mockFrom.mockReturnValueOnce({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest
        .fn()
        .mockResolvedValue({ data: null, error: { message: "Forbidden", status: 403 } }),
    });

    const error = await fetchUserProfile().catch((e) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.code).toBe("PERMISSION_ERROR");
  });
});

// ── fetchSavedRecipes ──

describe("fetchSavedRecipes", () => {
  it("returns [] when session is null (no throw)", async () => {
    const result = await fetchSavedRecipes();
    expect(result).toEqual([]);
  });

  it("throws SERVER_ERROR when Supabase returns status 500", async () => {
    mockGetSession.mockResolvedValueOnce({ data: { session: mockSession } });
    mockFrom.mockReturnValueOnce({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest
        .fn()
        .mockResolvedValue({ data: null, error: { message: "DB error", status: 500 } }),
    });

    const error = await fetchSavedRecipes().catch((e) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.code).toBe("SERVER_ERROR");
  });
});

// ── saveRecipe ──

describe("saveRecipe", () => {
  const mockRecipe: Recipe = {
    id: "r1",
    name: "Test",
    time: "30 min",
    calories: "400 cal",
    servings: "2",
    description: "A recipe",
    tags: [],
    emoji: "🍲",
  };

  it("throws AUTH_ERROR when session is null", async () => {
    const error = await saveRecipe("r1", mockRecipe).catch((e) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.code).toBe("AUTH_ERROR");
  });

  it("throws SERVER_ERROR when Supabase upsert returns status 500", async () => {
    mockGetSession.mockResolvedValueOnce({ data: { session: mockSession } });
    mockFrom.mockReturnValueOnce({
      upsert: jest.fn().mockResolvedValue({ error: { message: "fail", status: 500 } }),
    });

    const error = await saveRecipe("r1", mockRecipe).catch((e) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.code).toBe("SERVER_ERROR");
  });
});

// ── unsaveRecipe ──

describe("unsaveRecipe", () => {
  it("throws AUTH_ERROR when session is null", async () => {
    const error = await unsaveRecipe("r1").catch((e) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.code).toBe("AUTH_ERROR");
  });

  it("throws PERMISSION_ERROR when Supabase delete returns status 403", async () => {
    mockGetSession.mockResolvedValueOnce({ data: { session: mockSession } });

    // Two-step setup so the circular self-reference resolves correctly.
    const eqMock = jest.fn();
    eqMock.mockReturnValueOnce({ eq: eqMock }); // first .eq() continues the chain
    eqMock.mockResolvedValueOnce({ error: { message: "Forbidden", status: 403 } }); // second .eq() resolves

    mockFrom.mockReturnValueOnce({
      delete: jest.fn().mockReturnValue({ eq: eqMock }),
    });

    const error = await unsaveRecipe("r1").catch((e) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.code).toBe("PERMISSION_ERROR");
  });
});

// ── updateUserProStatus ──

describe("updateUserProStatus", () => {
  it("returns undefined when session is null (no throw)", async () => {
    const result = await updateUserProStatus(true);
    expect(result).toBeUndefined();
  });

  it("throws SERVER_ERROR when Supabase update returns status 500", async () => {
    mockGetSession.mockResolvedValueOnce({ data: { session: mockSession } });
    mockFrom.mockReturnValueOnce({
      update: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: { message: "fail", status: 500 } }),
      }),
    });

    const error = await updateUserProStatus(true).catch((e) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.code).toBe("SERVER_ERROR");
  });
});

// ── drawRecipeFromPool ──

describe("drawRecipeFromPool", () => {
  const request: DrawRequest = {
    dietary: [],
    time: "Any",
    calories: "Moderate",
    isPro: false,
  };

  it("throws EMPTY_POOL when pool is not in RQ cache", () => {
    const qc = createTestQueryClient();
    const error = (() => {
      try {
        drawRecipeFromPool(qc, request);
      } catch (e) {
        return e;
      }
    })();
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).code).toBe("EMPTY_POOL");
  });

  it("throws NO_MATCHING_RECIPES when all pool recipes are filtered out", () => {
    const qc = createTestQueryClient();
    const stubRecipe = { id: "1" } as Recipe;
    qc.setQueryData(queryKeys.recipes.pool(""), [stubRecipe]);

    const { passesTimeFilter } = require("@/lib/spoonacular") as {
      passesTimeFilter: jest.Mock;
    };
    passesTimeFilter.mockReturnValueOnce(false);

    const error = (() => {
      try {
        drawRecipeFromPool(qc, request);
      } catch (e) {
        return e;
      }
    })();
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).code).toBe("NO_MATCHING_RECIPES");
  });
});
