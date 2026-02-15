/**
 * Query key factory for consistent cache key management.
 *
 * Convention:
 *   - Top-level key is the entity name (plural).
 *   - Nested keys narrow by filter/id.
 *
 * Usage:
 *   queryKey: queryKeys.recipes.saved()
 *   queryKey: queryKeys.user.profile()
 */
export const queryKeys = {
  recipes: {
    all: ["recipes"] as const,
    saved: () => [...queryKeys.recipes.all, "saved"] as const,
    detail: (id: string) => [...queryKeys.recipes.all, "detail", id] as const,
    spin: () => [...queryKeys.recipes.all, "spin"] as const,
  },
  weeklyPlans: {
    all: ["weeklyPlans"] as const,
    detail: (id: string) =>
      [...queryKeys.weeklyPlans.all, "detail", id] as const,
    spin: () => [...queryKeys.weeklyPlans.all, "spin"] as const,
  },
  user: {
    all: ["user"] as const,
    profile: () => [...queryKeys.user.all, "profile"] as const,
    subscription: () => [...queryKeys.user.all, "subscription"] as const,
  },
  instacart: {
    all: ["instacart"] as const,
    status: () => [...queryKeys.instacart.all, "status"] as const,
  },
} as const;
