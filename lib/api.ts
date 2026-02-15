import type {
  Recipe,
  WeeklyPlan,
  SpinRequest,
  SpinResponse,
  User,
  SubscriptionPlan,
  InstacartConnectRequest,
} from "@/types";

/**
 * Raw fetcher functions — plain async functions that return typed data.
 * No React Query logic here. These are called by query/mutation hooks.
 *
 * MIGRATION NOTE: All endpoints are stubbed with mock data.
 * Replace BASE_URL and remove mock responses when the real API is ready.
 */

const BASE_URL = "https://api.dizzydish.app/v1";

// ── Helpers ──

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      // MIGRATION NOTE: Auth header should be injected via an interceptor
      // or passed as a parameter when the real API is integrated.
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

// ── Mock Data ──

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

// ── Recipe Fetchers ──

export async function spinRecipe(_request: SpinRequest): Promise<Recipe> {
  // MIGRATION NOTE: Replace with real API call:
  // return request<SpinResponse>('/recipes/spin', { method: 'POST', body: JSON.stringify(request) });
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

export async function fetchSavedRecipes(): Promise<Recipe[]> {
  // MIGRATION NOTE: Replace with real API call:
  // return request<Recipe[]>('/recipes/saved');
  await new Promise((resolve) => setTimeout(resolve, 300));
  return MOCK_RECIPES;
}

export async function saveRecipe(recipeId: string): Promise<void> {
  // MIGRATION NOTE: Replace with real API call:
  // return request<void>(`/recipes/${recipeId}/save`, { method: 'POST' });
  await new Promise((resolve) => setTimeout(resolve, 200));
}

export async function unsaveRecipe(recipeId: string): Promise<void> {
  // MIGRATION NOTE: Replace with real API call:
  // return request<void>(`/recipes/${recipeId}/unsave`, { method: 'DELETE' });
  await new Promise((resolve) => setTimeout(resolve, 200));
}

export async function fetchRecipeDetail(id: string): Promise<Recipe> {
  // MIGRATION NOTE: Replace with real API call:
  // return request<Recipe>(`/recipes/${id}`);
  await new Promise((resolve) => setTimeout(resolve, 200));
  return MOCK_RECIPES.find((r) => r.id === id) ?? MOCK_RECIPES[0];
}

// ── User Fetchers ──

export async function fetchUserProfile(): Promise<User> {
  // MIGRATION NOTE: Replace with real API call:
  // return request<User>('/user/profile');
  await new Promise((resolve) => setTimeout(resolve, 300));
  return {
    id: "user-1",
    email: "user@example.com",
    displayName: "Chef",
    isPro: false,
    instacartConnected: false,
  };
}

export async function fetchSubscription(): Promise<SubscriptionPlan> {
  // MIGRATION NOTE: Replace with real API call
  await new Promise((resolve) => setTimeout(resolve, 200));
  return {
    id: "plan-pro",
    name: "Pro Plan",
    price: "$3/month",
    isActive: false,
  };
}

// ── Auth Fetchers ──

export async function loginWithEmail(
  email: string,
  _password: string
): Promise<{ user: User; accessToken: string; refreshToken: string }> {
  // MIGRATION NOTE: Replace with real API call
  await new Promise((resolve) => setTimeout(resolve, 500));
  return {
    user: {
      id: "user-1",
      email,
      displayName: "Chef",
      isPro: false,
      instacartConnected: false,
    },
    accessToken: "mock-access-token",
    refreshToken: "mock-refresh-token",
  };
}

export async function loginWithSocial(
  _provider: "google" | "facebook" | "apple"
): Promise<{ user: User; accessToken: string; refreshToken: string }> {
  // MIGRATION NOTE: Replace with real social auth via expo-auth-session
  await new Promise((resolve) => setTimeout(resolve, 500));
  return {
    user: {
      id: "user-1",
      email: "user@example.com",
      displayName: "Chef",
      isPro: false,
      instacartConnected: false,
    },
    accessToken: "mock-access-token",
    refreshToken: "mock-refresh-token",
  };
}

// ── Instacart Fetchers ──

export async function connectInstacart(
  _request: InstacartConnectRequest
): Promise<void> {
  // MIGRATION NOTE: Replace with real API call
  await new Promise((resolve) => setTimeout(resolve, 600));
}
