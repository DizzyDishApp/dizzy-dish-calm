// ── Recipe Types ──

export interface Ingredient {
  id: number;
  name: string;
  amount: number;
  unit: string;
  original: string;
}

export interface RecipeStep {
  text: string;
  durationSeconds?: number; // from Spoonacular length field or regex-parsed
}

export interface Recipe {
  id: string;
  name: string;
  time: string;
  calories: string;       // "420 cal" for Pro, "—" for Guest/Free
  servings: string;
  description: string;
  tags: string[];
  emoji: string;
  imageUrl?: string;
  ingredients?: Ingredient[];  // from extendedIngredients — required for Instacart
  instructions?: RecipeStep[]; // ordered cooking steps with optional timing
  rating?: number;             // spoonacularScore 0–100
  sourceUrl?: string;          // for "View Recipe" link
}

export interface WeeklyPlanDay {
  day: string;
  recipe: Recipe;
}

export interface WeeklyPlan {
  id: string;
  days: WeeklyPlanDay[];
  sharedIngredients: SharedIngredient[];
  totalItems: number;
  reducedItems: number;
}

export interface SharedIngredient {
  name: string;
  count: number;
}

// ── User Types ──

export interface User {
  id: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  isPro: boolean;
  instacartConnected: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// ── Preferences Types ──

export type DietaryFilter =
  | "Vegetarian"
  | "Vegan"
  | "Gluten Free"
  | "Dairy Free"
  | "Sugar Free"
  | "No Pork"
  | "No Beef"
  | "No Peanuts"
  | "No Tree Nuts"
  | "No Shrimp"
  | "No Shellfish"
  | "No Fish"
  | "No Soy"
  | "No Eggs"
  | "No Sesame"
  | "Keto"
  | "Paleo"
  | "Pescatarian"
  | "Low FODMAP";

export type TimeFilter = "Under 30 Min" | "Under 60 Min" | "Any";
export type CalorieFilter = "Light" | "Moderate" | "Hearty";

export interface UserPreferences {
  dietary: Set<DietaryFilter>;
  time: TimeFilter;
  calories: CalorieFilter;
  weeklyMode: boolean;
}

// ── API Types ──

export interface SpinResponse {
  recipe?: Recipe;
  weeklyPlan?: WeeklyPlan;
}

export interface SaveRecipeRequest {
  recipeId: string;
}

export interface InstacartConnectRequest {
  email: string;
  password: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: string;
  isActive: boolean;
  productId?: string;
}

// ── Navigation Types ──

export type RootStackParamList = {
  index: undefined;
  "(tabs)": undefined;
  result: { recipeId: string };
  "weekly-result": { planId: string };
  "(modal)/settings": undefined;
  "(modal)/instacart": undefined;
};

// ── Theme Types ──

export type ThemeMode = "light" | "dark";

// ── Error Types ──

export type ApiErrorCode =
  | "AUTH_ERROR"
  | "PERMISSION_ERROR"
  | "NOT_FOUND_ERROR"
  | "NETWORK_ERROR"
  | "SERVER_ERROR"
  | "EMPTY_POOL"
  | "NO_MATCHING_RECIPES"
  | "UNKNOWN_ERROR";

export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly originalMessage: string;
  readonly status?: number;

  constructor(code: ApiErrorCode, message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.originalMessage = message;
    this.status = status;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}
