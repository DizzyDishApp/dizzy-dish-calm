import { useQuery } from "@tanstack/react-query";
import { fetchRandomPool, fetchProPool, buildPoolFingerprint } from "@/lib/spoonacular";
import { queryKeys } from "@/lib/queryKeys";
import { useAuth } from "@/context/AuthContext";
import { usePreferences } from "@/context/PreferencesContext";
import type { Recipe } from "@/types";

const POOL_STALE_TIME = 1000 * 60 * 30; // 30 minutes

/**
 * Fetches and caches a pool of recipes from Spoonacular.
 *
 * Tier-aware: Pro users get the complexSearch pool (with nutrition/calories),
 * Free/Guest users get the random pool (no calories, cheaper API cost).
 *
 * The pool is keyed on dietary preferences + tier so changing either triggers
 * a new fetch automatically. Pool stays fresh for 30 minutes.
 */
export function useRecipePool() {
  const { state: prefs } = usePreferences();
  const { state: _auth } = useAuth();

  const dietaryArray = Array.from(prefs.dietary);
  const isPro = prefs.isPro;
  const fingerprint = buildPoolFingerprint(dietaryArray, isPro);

  return useQuery<Recipe[], Error>({
    queryKey: queryKeys.recipes.pool(fingerprint),
    queryFn: () =>
      isPro
        ? fetchProPool(dietaryArray)
        : fetchRandomPool(dietaryArray),
    staleTime: POOL_STALE_TIME,
  });
}
