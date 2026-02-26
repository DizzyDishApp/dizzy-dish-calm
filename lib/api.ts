import { supabase } from "@/lib/supabase";
import { queryKeys } from "@/lib/queryKeys";
import { buildPoolFingerprint, passesTimeFilter, passesCalorieFilter } from "@/lib/spoonacular";
import { ApiError } from "@/types";
import { classifyError } from "@/lib/errors";
import type { QueryClient } from "@tanstack/react-query";
import type {
  Recipe,
  WeeklyPlan,
  User,
  SubscriptionPlan,
  InstacartConnectRequest,
  DietaryFilter,
  TimeFilter,
  CalorieFilter,
  SharedIngredient,
} from "@/types";

/**
 * Raw fetcher functions — plain async functions that return typed data.
 * No React Query logic here. These are called by query/mutation hooks.
 *
 * Auth and saved recipes are wired to Supabase.
 * Recipe spin draws from the Spoonacular pool cached in React Query.
 */

// ── Draw Request ──

export interface DrawRequest {
  dietary: DietaryFilter[];
  time: TimeFilter;
  calories: CalorieFilter;
  isPro: boolean;
}

// ── Pool Draw Functions ──

/**
 * Draws a single recipe from the cached Spoonacular pool.
 * Applies client-side time + calorie filters, then picks randomly.
 * Throws with a user-friendly message if the filtered pool is empty.
 */
export function drawRecipeFromPool(
  queryClient: QueryClient,
  request: DrawRequest
): Recipe {
  const fingerprint = buildPoolFingerprint(request.dietary, request.isPro);
  const pool = queryClient.getQueryData<Recipe[]>(
    queryKeys.recipes.pool(fingerprint)
  );

  if (!pool || pool.length === 0) {
    throw new ApiError(
      "EMPTY_POOL",
      "No recipes available yet — the pool is still loading. Please try again."
    );
  }

  const filtered = pool.filter(
    (r) =>
      passesTimeFilter(r, request.time) &&
      passesCalorieFilter(r, request.calories)
  );

  if (filtered.length === 0) {
    throw new ApiError(
      "NO_MATCHING_RECIPES",
      "No recipes match your current filters. Try adjusting your time or calorie preferences."
    );
  }

  return filtered[Math.floor(Math.random() * filtered.length)];
}

/**
 * Draws 7 unique recipes from the pool and computes shared ingredients.
 */
export function drawWeeklyPlanFromPool(
  queryClient: QueryClient,
  request: DrawRequest
): WeeklyPlan {
  const fingerprint = buildPoolFingerprint(request.dietary, request.isPro);
  const pool = queryClient.getQueryData<Recipe[]>(
    queryKeys.recipes.pool(fingerprint)
  );

  if (!pool || pool.length === 0) {
    throw new ApiError(
      "EMPTY_POOL",
      "No recipes available yet — the pool is still loading. Please try again."
    );
  }

  const filtered = pool.filter(
    (r) =>
      passesTimeFilter(r, request.time) &&
      passesCalorieFilter(r, request.calories)
  );

  if (filtered.length < 7) {
    throw new ApiError(
      "NO_MATCHING_RECIPES",
      "Not enough recipes match your filters for a 7-day plan. Try adjusting your preferences."
    );
  }

  // Shuffle and take 7 unique recipes
  const shuffled = [...filtered].sort(() => Math.random() - 0.5);
  const days = shuffled.slice(0, 7);

  const DAYS_OF_WEEK = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const sharedIngredients = computeSharedIngredients(days);

  return {
    id: `wp-${Date.now()}`,
    days: days.map((recipe, i) => ({ day: DAYS_OF_WEEK[i], recipe })),
    sharedIngredients: sharedIngredients.shared,
    totalItems: sharedIngredients.totalItems,
    reducedItems: sharedIngredients.reducedItems,
  };
}

function computeSharedIngredients(recipes: Recipe[]): {
  shared: SharedIngredient[];
  totalItems: number;
  reducedItems: number;
} {
  const counts = new Map<string, number>();
  let totalItems = 0;

  for (const recipe of recipes) {
    if (!recipe.ingredients) continue;
    totalItems += recipe.ingredients.length;
    const seen = new Set<string>();
    for (const ing of recipe.ingredients) {
      const key = ing.name.toLowerCase().trim();
      if (!seen.has(key)) {
        counts.set(key, (counts.get(key) ?? 0) + 1);
        seen.add(key);
      }
    }
  }

  const shared: SharedIngredient[] = [];
  let savedCount = 0;

  for (const [name, count] of counts.entries()) {
    if (count >= 2) {
      shared.push({ name: name.charAt(0).toUpperCase() + name.slice(1), count });
      savedCount += count - 1; // each shared ingredient saves (count - 1) items
    }
  }

  shared.sort((a, b) => b.count - a.count);

  return {
    shared,
    totalItems,
    reducedItems: totalItems - savedCount,
  };
}

// ── Auth Helpers ──

export async function checkEmailExists(email: string): Promise<boolean> {
  const { data, error } = await supabase.rpc("check_email_exists", {
    email_input: email.toLowerCase().trim(),
  });
  if (error) return false;
  return data === true;
}

// ── Saved Recipes (Supabase) ──

export async function fetchSavedRecipes(): Promise<Recipe[]> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return [];

  const { data, error } = await supabase
    .from("saved_recipes")
    .select("recipe_id, recipe_data")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false });

  if (error) throw classifyError(error);
  return (data ?? []).map((row) => row.recipe_data as Recipe);
}

export async function saveRecipe(
  recipeId: string,
  recipe: Recipe
): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new ApiError("AUTH_ERROR", "Not authenticated", 401);

  const { error } = await supabase.from("saved_recipes").upsert(
    {
      user_id: session.user.id,
      recipe_id: recipeId,
      recipe_data: recipe,
    },
    { onConflict: "user_id,recipe_id" }
  );

  if (error) throw classifyError(error);
}

export async function unsaveRecipe(recipeId: string): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new ApiError("AUTH_ERROR", "Not authenticated", 401);

  const { error } = await supabase
    .from("saved_recipes")
    .delete()
    .eq("user_id", session.user.id)
    .eq("recipe_id", recipeId);

  if (error) throw classifyError(error);
}

// ── User Profile (Supabase) ──

export async function fetchUserProfile(): Promise<User> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new ApiError("AUTH_ERROR", "Not authenticated", 401);
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .single();

  if (error) throw classifyError(error);

  return {
    id: data.id,
    email: data.email ?? session.user.email ?? "",
    displayName: data.display_name,
    avatarUrl: data.avatar_url,
    isPro: data.is_pro ?? false,
    instacartConnected: data.instacart_connected ?? false,
  };
}

export async function fetchSubscription(): Promise<SubscriptionPlan> {
  const { getCustomerInfo, isProEntitlement } = await import("@/lib/revenueCat");
  const customerInfo = await getCustomerInfo();
  if (isProEntitlement(customerInfo)) {
    return { id: "plan-pro", name: "Pro", price: "", isActive: true };
  }
  return { id: "plan-free", name: "Free Plan", price: "$0/month", isActive: true };
}

/**
 * Writes the user's Pro status to Supabase profiles.
 * Called after a successful RevenueCat purchase or restore.
 */
export async function updateUserProStatus(isPro: boolean): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return;
  const { error } = await supabase
    .from("profiles")
    .update({ is_pro: isPro })
    .eq("id", session.user.id);
  if (error) throw classifyError(error);
}

// ── Instacart Fetchers (still mocked) ──

export async function connectInstacart(
  _request: InstacartConnectRequest
): Promise<void> {
  // MIGRATION NOTE: Replace with real API call
  await new Promise((resolve) => setTimeout(resolve, 600));
}
