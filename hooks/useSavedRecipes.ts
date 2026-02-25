import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchSavedRecipes, saveRecipe, unsaveRecipe } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { useUI } from "@/context/UIContext";
import { ApiError } from "@/types";
import { toUserMessage } from "@/lib/errors";
import type { Recipe } from "@/types";

interface OptimisticContext {
  previous: Recipe[] | undefined;
}

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
 * Shows an error toast if the save fails.
 */
export function useSaveRecipe() {
  const queryClient = useQueryClient();
  const { showToast } = useUI();

  return useMutation<
    void,
    Error,
    { recipeId: string; recipe: Recipe },
    OptimisticContext
  >({
    mutationFn: ({ recipeId, recipe }) => saveRecipe(recipeId, recipe),
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
    onError: (err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.recipes.saved(), context.previous);
      }
      const msg =
        err instanceof ApiError
          ? toUserMessage(err.code)
          : "Something went wrong saving that recipe.";
      showToast(msg, "error");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recipes.saved() });
    },
  });
}

/**
 * Mutation hook for unsaving a recipe.
 * Uses optimistic update to immediately hide the recipe.
 * Shows an error toast if the unsave fails.
 */
export function useUnsaveRecipe() {
  const queryClient = useQueryClient();
  const { showToast } = useUI();

  return useMutation<void, Error, string, OptimisticContext>({
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
    onError: (err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.recipes.saved(), context.previous);
      }
      const msg =
        err instanceof ApiError
          ? toUserMessage(err.code)
          : "Something went wrong removing that recipe.";
      showToast(msg, "error");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recipes.saved() });
    },
  });
}
