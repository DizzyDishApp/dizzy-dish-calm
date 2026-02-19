import { useQuery } from "@tanstack/react-query";
import { fetchRandomPool, fetchProPool, buildPoolFingerprint } from "@/lib/spoonacular";
import { queryKeys } from "@/lib/queryKeys";
import { usePreferences } from "@/context/PreferencesContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import type { Recipe } from "@/types";

const POOL_STALE_TIME = 1000 * 60 * 30; // 30 minutes

/**
 * Fetches and caches a pool of recipes from Spoonacular.
 *
 * Tier-aware: Pro users get the complexSearch pool (with nutrition/calories),
 * Free/Guest users get the random pool (no calories, cheaper API cost).
 *
 * isPro is sourced from the user's Supabase profile (verified by RevenueCat),
 * NOT from PreferencesContext. This prevents free users from self-upgrading.
 *
 * The pool is keyed on dietary preferences + tier so changing either triggers
 * a new fetch automatically. Pool stays fresh for 30 minutes.
 */
export function useRecipePool() {
  const { state: prefs } = usePreferences();
  const { data: userProfile } = useUserProfile();

  const dietaryArray = Array.from(prefs.dietary);
  const isPro = userProfile?.isPro ?? false;
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
