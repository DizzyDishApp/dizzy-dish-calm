import { useMutation, useQueryClient } from "@tanstack/react-query";
import { drawRecipeFromPool, drawWeeklyPlanFromPool } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import type { Recipe, WeeklyPlan } from "@/types";
import type { DrawRequest } from "@/lib/api";

/**
 * Mutation hook for spinning a single recipe.
 * Draws from the Spoonacular pool cached in React Query and pre-populates
 * the recipe detail cache so the result screen can read it immediately.
 */
export function useSpinRecipe() {
  const queryClient = useQueryClient();

  return useMutation<Recipe, Error, DrawRequest>({
    mutationFn: (req) => Promise.resolve(drawRecipeFromPool(queryClient, req)),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.recipes.detail(data.id), data);
    },
  });
}

/**
 * Mutation hook for spinning a weekly meal plan.
 * Draws 7 unique recipes from the pool and pre-populates the weekly plan cache.
 */
export function useSpinWeeklyPlan() {
  const queryClient = useQueryClient();

  return useMutation<WeeklyPlan, Error, DrawRequest>({
    mutationFn: (req) => Promise.resolve(drawWeeklyPlanFromPool(queryClient, req)),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.weeklyPlans.detail(data.id), data);
    },
  });
}
