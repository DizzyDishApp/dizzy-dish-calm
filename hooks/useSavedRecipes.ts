import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchSavedRecipes, saveRecipe, unsaveRecipe } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import type { Recipe } from "@/types";

/**
 * Query hook for fetching the user's saved recipes.
 */
export function useSavedRecipes() {
  return useQuery<Recipe[], Error>({
    queryKey: queryKeys.recipes.saved(),
    queryFn: fetchSavedRecipes,
  });
}

/**
 * Mutation hook for saving a recipe.
 * Uses optimistic update to immediately show the saved state.
 */
export function useSaveRecipe() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { recipeId: string; recipe: Recipe }>({
    mutationFn: ({ recipeId }) => saveRecipe(recipeId),
    onMutate: async ({ recipe }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.recipes.saved() });
      const previous = queryClient.getQueryData<Recipe[]>(
        queryKeys.recipes.saved()
      );
      queryClient.setQueryData<Recipe[]>(queryKeys.recipes.saved(), (old) => [
        ...(old ?? []),
        recipe,
      ]);
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context && "previous" in context) {
        queryClient.setQueryData(
          queryKeys.recipes.saved(),
          (context as { previous: Recipe[] }).previous
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recipes.saved() });
    },
  });
}

/**
 * Mutation hook for unsaving a recipe.
 */
export function useUnsaveRecipe() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: unsaveRecipe,
    onMutate: async (recipeId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.recipes.saved() });
      const previous = queryClient.getQueryData<Recipe[]>(
        queryKeys.recipes.saved()
      );
      queryClient.setQueryData<Recipe[]>(queryKeys.recipes.saved(), (old) =>
        (old ?? []).filter((r) => r.id !== recipeId)
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context && "previous" in context) {
        queryClient.setQueryData(
          queryKeys.recipes.saved(),
          (context as { previous: Recipe[] }).previous
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recipes.saved() });
    },
  });
}
