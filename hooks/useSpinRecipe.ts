import { useMutation, useQueryClient } from "@tanstack/react-query";
import { spinRecipe, spinWeeklyPlan } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import type { Recipe, SpinRequest, WeeklyPlan } from "@/types";

/**
 * Mutation hook for spinning a single recipe.
 * Invalidates saved recipes cache after spin (user might save the result).
 */
export function useSpinRecipe() {
  const queryClient = useQueryClient();

  return useMutation<Recipe, Error, SpinRequest>({
    mutationFn: spinRecipe,
    onSuccess: (data) => {
      // Pre-populate the recipe detail cache
      queryClient.setQueryData(queryKeys.recipes.detail(data.id), data);
    },
  });
}

/**
 * Mutation hook for spinning a weekly plan.
 */
export function useSpinWeeklyPlan() {
  const queryClient = useQueryClient();

  return useMutation<WeeklyPlan, Error, SpinRequest>({
    mutationFn: spinWeeklyPlan,
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.weeklyPlans.detail(data.id), data);
    },
  });
}
