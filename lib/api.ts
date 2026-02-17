import { supabase } from "@/lib/supabase";
import type {
  Recipe,
  WeeklyPlan,
  SpinRequest,
  User,
  SubscriptionPlan,
  InstacartConnectRequest,
} from "@/types";

/**
 * Raw fetcher functions — plain async functions that return typed data.
 * No React Query logic here. These are called by query/mutation hooks.
 *
 * Auth and saved recipes are wired to Supabase.
 * Recipe spin endpoints are still mocked until the real API is built.
 */

// ── Auth Helpers ──

export async function checkEmailExists(email: string): Promise<boolean> {
  const { data, error } = await supabase.rpc("check_email_exists", {
    email_input: email.toLowerCase().trim(),
  });
  if (error) return false;
  return data === true;
}

// ── Mock Data (spin still uses these) ──

const MOCK_RECIPES: Recipe[] = [
  {
    id: "1",
    name: "Honey Garlic Salmon",
    time: "25 min",
    calories: "420 cal",
    servings: "4 servings",
    description:
      "Pan-seared salmon glazed with honey, garlic, and soy sauce. Served over jasmine rice with steamed broccoli.",
    tags: ["Gluten Free", "Under 30 Min", "High Protein"],
    emoji: "\u{1F363}",
  },
  {
    id: "2",
    name: "Chicken Tikka Masala",
    time: "40 min",
    calories: "520 cal",
    servings: "4 servings",
    description:
      "Tender chicken pieces in a creamy, spiced tomato sauce served with basmati rice and warm naan.",
    tags: ["High Protein", "Comfort Food"],
    emoji: "\u{1F35B}",
  },
  {
    id: "3",
    name: "Pesto Pasta",
    time: "20 min",
    calories: "380 cal",
    servings: "4 servings",
    description:
      "Al dente pasta tossed with fresh basil pesto, cherry tomatoes, and shaved parmesan.",
    tags: ["Vegetarian", "Under 30 Min"],
    emoji: "\u{1F35D}",
  },
  {
    id: "4",
    name: "Black Bean Tacos",
    time: "15 min",
    calories: "340 cal",
    servings: "4 servings",
    description:
      "Seasoned black beans with fresh pico de gallo, avocado, and lime crema on warm corn tortillas.",
    tags: ["Vegan", "Under 30 Min", "Budget"],
    emoji: "\u{1F32E}",
  },
];

const MOCK_WEEKLY_PLAN: WeeklyPlan = {
  id: "wp-1",
  days: [
    { day: "Monday", recipe: { ...MOCK_RECIPES[0], emoji: "\u{1F363}" } },
    {
      day: "Tuesday",
      recipe: {
        id: "5",
        name: "Garlic Butter Shrimp Pasta",
        time: "20 min",
        calories: "460 cal",
        servings: "4 servings",
        description: "Succulent shrimp in garlic butter sauce over linguine.",
        tags: ["Under 30 Min"],
        emoji: "\u{1F364}",
      },
    },
    {
      day: "Wednesday",
      recipe: {
        id: "6",
        name: "Chicken Stir Fry",
        time: "25 min",
        calories: "390 cal",
        servings: "4 servings",
        description: "Crispy chicken with colorful vegetables in savory sauce.",
        tags: ["Under 30 Min", "High Protein"],
        emoji: "\u{1F357}",
      },
    },
    {
      day: "Thursday",
      recipe: {
        id: "7",
        name: "Garlic Chicken Tacos",
        time: "20 min",
        calories: "410 cal",
        servings: "4 servings",
        description: "Garlic-marinated chicken with fresh toppings on flour tortillas.",
        tags: ["Under 30 Min"],
        emoji: "\u{1F32E}",
      },
    },
    {
      day: "Friday",
      recipe: {
        id: "8",
        name: "Salmon Rice Bowls",
        time: "15 min",
        calories: "380 cal",
        servings: "4 servings",
        description: "Flaked salmon over seasoned rice with cucumber and avocado.",
        tags: ["Under 30 Min", "Gluten Free"],
        emoji: "\u{1F371}",
      },
    },
    {
      day: "Saturday",
      recipe: {
        id: "9",
        name: "Honey Soy Chicken",
        time: "35 min",
        calories: "450 cal",
        servings: "4 servings",
        description: "Sticky honey soy glazed chicken thighs with steamed vegetables.",
        tags: ["High Protein"],
        emoji: "\u{1F357}",
      },
    },
    {
      day: "Sunday",
      recipe: {
        id: "10",
        name: "Shrimp Fried Rice",
        time: "20 min",
        calories: "410 cal",
        servings: "4 servings",
        description: "Quick fried rice with plump shrimp, eggs, and mixed vegetables.",
        tags: ["Under 30 Min"],
        emoji: "\u{1F35A}",
      },
    },
  ],
  sharedIngredients: [
    { name: "Garlic", count: 7 },
    { name: "Soy Sauce", count: 5 },
    { name: "Honey", count: 3 },
    { name: "Jasmine Rice", count: 4 },
    { name: "Chicken", count: 3 },
  ],
  totalItems: 42,
  reducedItems: 28,
};

// ── Recipe Fetchers (still mocked) ──

export async function spinRecipe(_request: SpinRequest): Promise<Recipe> {
  // MIGRATION NOTE: Replace with real API call when recipe generation API is built
  await new Promise((resolve) => setTimeout(resolve, 800));
  const random = MOCK_RECIPES[Math.floor(Math.random() * MOCK_RECIPES.length)];
  return random;
}

export async function spinWeeklyPlan(
  _request: SpinRequest
): Promise<WeeklyPlan> {
  // MIGRATION NOTE: Replace with real API call
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return MOCK_WEEKLY_PLAN;
}

export async function fetchRecipeDetail(id: string): Promise<Recipe> {
  // MIGRATION NOTE: Replace with real API call
  await new Promise((resolve) => setTimeout(resolve, 200));
  return MOCK_RECIPES.find((r) => r.id === id) ?? MOCK_RECIPES[0];
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

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => row.recipe_data as Recipe);
}

export async function saveRecipe(
  recipeId: string,
  recipe: Recipe
): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");

  const { error } = await supabase.from("saved_recipes").upsert(
    {
      user_id: session.user.id,
      recipe_id: recipeId,
      recipe_data: recipe,
    },
    { onConflict: "user_id,recipe_id" }
  );

  if (error) throw new Error(error.message);
}

export async function unsaveRecipe(recipeId: string): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("saved_recipes")
    .delete()
    .eq("user_id", session.user.id)
    .eq("recipe_id", recipeId);

  if (error) throw new Error(error.message);
}

// ── User Profile (Supabase) ──

export async function fetchUserProfile(): Promise<User> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error("Not authenticated");
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .single();

  if (error) throw new Error(error.message);

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
  // MIGRATION NOTE: Replace with RevenueCat integration
  return {
    id: "plan-free",
    name: "Free Plan",
    price: "$0/month",
    isActive: true,
  };
}

// ── Instacart Fetchers (still mocked) ──

export async function connectInstacart(
  _request: InstacartConnectRequest
): Promise<void> {
  // MIGRATION NOTE: Replace with real API call
  await new Promise((resolve) => setTimeout(resolve, 600));
}
