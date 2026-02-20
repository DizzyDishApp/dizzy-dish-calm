/**
 * Spoonacular API client.
 *
 * All Spoonacular-specific logic lives here — raw types, mappers, filters,
 * tag builders, and the two pool-fetch strategies (random vs. complexSearch).
 *
 * Pure functions — no React, no side effects beyond the fetch calls.
 *
 * SECURITY NOTE: The API key is visible in the Expo client bundle because it
 * uses the EXPO_PUBLIC_ prefix. Mitigate abuse by setting IP/domain restrictions
 * in the Spoonacular dashboard.
 */

import type { DietaryFilter, TimeFilter, CalorieFilter, Recipe, Ingredient, RecipeStep } from "@/types";
import { FIXTURE_RECIPES } from "@/lib/fixtures/spoonacularRecipes";

// ── Constants ──

const BASE = "https://api.spoonacular.com";
const API_KEY = process.env.EXPO_PUBLIC_SPOONACULAR_API_KEY ?? "";
const POOL_SIZE = 50;

// ── Raw Spoonacular Types ──

export interface SpoonacularIngredient {
  id: number;
  name: string;
  amount: number;
  unit: string;
  original: string;
}

export interface SpoonacularNutrient {
  name: string;
  amount: number;
  unit: string;
}

export interface SpoonacularRecipe {
  id: number;
  title: string;
  readyInMinutes: number;
  servings: number;
  image: string;
  summary: string;
  vegetarian: boolean;
  vegan: boolean;
  glutenFree: boolean;
  dairyFree: boolean;
  ketogenic: boolean;
  lowFodmap: boolean;
  sustainable: boolean;
  extendedIngredients: SpoonacularIngredient[];
  cuisines: string[];
  dishTypes: string[];
  sourceUrl: string;
  spoonacularScore?: number;
  aggregateLikes?: number;
  analyzedInstructions?: Array<{
    name: string;
    steps: Array<{
      number: number;
      step: string;
      length?: { number: number; unit: string };
    }>;
  }>;
  nutrition?: {
    nutrients: SpoonacularNutrient[];
  };
}

interface SpoonacularRandomResponse {
  recipes: SpoonacularRecipe[];
}

interface SpoonacularSearchResponse {
  results: SpoonacularRecipe[];
  totalResults: number;
  offset: number;
  number: number;
}

// ── Emoji Mapping ──

const DISH_TYPE_EMOJI: Record<string, string> = {
  "main course": "🍽️",
  "main dish": "🍽️",
  soup: "🍜",
  salad: "🥗",
  breakfast: "🍳",
  brunch: "🍳",
  dessert: "🍰",
  "side dish": "🥘",
  snack: "🥙",
  appetizer: "🥗",
};

const CUISINE_EMOJI: Record<string, string> = {
  italian: "🍝",
  mexican: "🌮",
  japanese: "🍣",
  indian: "🍛",
  american: "🍔",
  french: "🥖",
  chinese: "🥡",
  thai: "🍜",
  mediterranean: "🫒",
  greek: "🫒",
  spanish: "🥘",
  korean: "🍱",
  vietnamese: "🍲",
  "middle eastern": "🧆",
};

export function pickEmoji(dishTypes: string[], cuisines: string[]): string {
  for (const dt of dishTypes) {
    const emoji = DISH_TYPE_EMOJI[dt.toLowerCase()];
    if (emoji) return emoji;
  }
  for (const c of cuisines) {
    const emoji = CUISINE_EMOJI[c.toLowerCase()];
    if (emoji) return emoji;
  }
  return "🍲";
}

// ── HTML Stripping ──

export function stripHtml(html: string): string {
  const stripped = html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return stripped.length > 280 ? stripped.slice(0, 277) + "..." : stripped;
}

// ── Tag Building ──

const DIETARY_TO_INCLUDE_TAG: Partial<Record<DietaryFilter, string>> = {
  Vegetarian: "vegetarian",
  Vegan: "vegan",
  "Gluten Free": "gluten+free",
  "Dairy Free": "dairy+free",
  Keto: "ketogenic",
  Paleo: "paleo",
  Pescatarian: "pescatarian",
  "Low FODMAP": "fodmap+friendly",
};

const DIETARY_TO_EXCLUDE_TAG: Partial<Record<DietaryFilter, string>> = {
  "No Pork": "pork",
  "No Beef": "beef",
  "No Peanuts": "peanuts",
  "No Tree Nuts": "tree+nuts",
  "No Shrimp": "shrimp",
  "No Shellfish": "shellfish",
  "No Fish": "fish",
  "No Soy": "soy",
  "No Eggs": "eggs",
  "No Sesame": "sesame",
};

export function buildTagParams(dietary: DietaryFilter[]): {
  includeTags: string;
  excludeTags: string;
} {
  const includeParts: string[] = ["main+course"];
  const excludeParts: string[] = [];

  for (const filter of dietary) {
    const inc = DIETARY_TO_INCLUDE_TAG[filter];
    if (inc) includeParts.push(inc);

    const exc = DIETARY_TO_EXCLUDE_TAG[filter];
    if (exc) excludeParts.push(exc);
    // "Sugar Free" intentionally skipped — no reliable Spoonacular equivalent
  }

  return {
    includeTags: includeParts.join(","),
    excludeTags: excludeParts.join(","),
  };
}

// ── complexSearch dietary mapping (for Pro pool) ──

const DIETARY_TO_DIET_PARAM: Partial<Record<DietaryFilter, string>> = {
  Vegetarian: "vegetarian",
  Vegan: "vegan",
  "Gluten Free": "gluten free",
  "Dairy Free": "dairy free",
  Keto: "ketogenic",
  Paleo: "paleo",
  Pescatarian: "pescetarian",
  "Low FODMAP": "fodmap",
};

const DIETARY_TO_INTOLERANCE: Partial<Record<DietaryFilter, string>> = {
  "No Peanuts": "peanut",
  "No Tree Nuts": "tree nut",
  "No Shellfish": "shellfish",
  "No Fish": "seafood",
  "No Shrimp": "shellfish",
  "No Soy": "soy",
  "No Eggs": "egg",
  "No Sesame": "sesame",
  "No Pork": "pork",
  "No Beef": "red meat",
};

function buildComplexSearchParams(dietary: DietaryFilter[]): {
  diet: string;
  intolerances: string;
} {
  const diets: string[] = [];
  const intolerances: string[] = [];

  for (const filter of dietary) {
    const diet = DIETARY_TO_DIET_PARAM[filter];
    if (diet && !diets.includes(diet)) diets.push(diet);

    const intol = DIETARY_TO_INTOLERANCE[filter];
    if (intol && !intolerances.includes(intol)) intolerances.push(intol);
  }

  return {
    diet: diets.join(","),
    intolerances: intolerances.join(","),
  };
}

// ── Pool Fingerprint ──

export function buildPoolFingerprint(
  dietary: DietaryFilter[],
  isPro: boolean
): string {
  return (
    [...dietary].sort().join(",") + (isPro ? "|pro" : "|free")
  );
}

// ── Ingredient Keyword Scan ──

const NO_X_KEYWORDS: Partial<Record<DietaryFilter, string[]>> = {
  "No Pork": ["pork", "bacon", "ham", "lard", "prosciutto", "pancetta", "salami", "chorizo", "sausage"],
  "No Beef": ["beef", "steak", "brisket", "veal", "ground beef"],
  "No Peanuts": ["peanut", "peanut butter"],
  "No Tree Nuts": ["almond", "walnut", "cashew", "pecan", "pistachio", "hazelnut", "macadamia", "pine nut"],
  "No Shrimp": ["shrimp", "prawn"],
  "No Shellfish": ["shellfish", "crab", "lobster", "clam", "oyster", "scallop", "mussel", "shrimp", "prawn"],
  "No Fish": ["fish", "salmon", "tuna", "cod", "tilapia", "halibut", "trout", "anchovy", "sardine"],
  "No Soy": ["soy", "tofu", "tempeh", "edamame", "miso", "tamari"],
  "No Eggs": ["egg", "eggs", "yolk"],
  "No Sesame": ["sesame", "tahini"],
};

export function passesIngredientFilter(
  raw: SpoonacularRecipe,
  dietary: DietaryFilter[]
): boolean {
  const ingredientText = (raw.extendedIngredients ?? [])
    .map((i) => `${i.name} ${i.original}`)
    .join(" ")
    .toLowerCase();

  for (const filter of dietary) {
    const keywords = NO_X_KEYWORDS[filter];
    if (!keywords) continue;
    for (const kw of keywords) {
      if (ingredientText.includes(kw)) return false;
    }
  }
  return true;
}

// ── Client-side Filters (on mapped Recipe) ──

export function passesTimeFilter(recipe: Recipe, time: TimeFilter): boolean {
  if (time === "Any") return true;
  const minutes = parseInt(recipe.time, 10);
  if (isNaN(minutes)) return true;
  if (time === "Under 30 Min") return minutes <= 30;
  if (time === "Under 60 Min") return minutes <= 60;
  return true;
}

export function passesCalorieFilter(
  recipe: Recipe,
  calories: CalorieFilter
): boolean {
  if (recipe.calories === "—") return true; // No nutrition data — always pass
  const cal = parseInt(recipe.calories, 10);
  if (isNaN(cal)) return true;
  if (calories === "Light") return cal < 400;
  if (calories === "Moderate") return cal >= 400 && cal <= 700;
  if (calories === "Hearty") return cal > 700;
  return true;
}

// ── Tag Builder (for mapped Recipe tags) ──

function buildTags(raw: SpoonacularRecipe): string[] {
  const tags: string[] = [];

  if (raw.vegetarian) tags.push("Vegetarian");
  if (raw.vegan) tags.push("Vegan");
  if (raw.glutenFree) tags.push("Gluten Free");
  if (raw.dairyFree) tags.push("Dairy Free");
  if (raw.ketogenic) tags.push("Keto");
  if (raw.lowFodmap) tags.push("Low FODMAP");

  if (raw.readyInMinutes <= 30) tags.push("Under 30 Min");
  else if (raw.readyInMinutes <= 60) tags.push("Under 60 Min");

  for (const cuisine of raw.cuisines ?? []) {
    const label =
      cuisine.charAt(0).toUpperCase() + cuisine.slice(1).toLowerCase();
    if (!tags.includes(label)) tags.push(label);
  }

  return tags;
}

// ── Ingredient Mapper ──

function mapIngredient(raw: SpoonacularIngredient): Ingredient {
  return {
    id: raw.id,
    name: raw.name,
    amount: raw.amount,
    unit: raw.unit,
    original: raw.original,
  };
}

// ── Step Timing Helpers ──

function convertToSeconds(n: number, unit: string): number {
  if (unit.toLowerCase().startsWith("hour")) return n * 3600;
  return n * 60; // default to minutes
}

export function detectDurationFromText(text: string): number | undefined {
  const match = text.match(/(\d+)\s*(?:to\s*\d+\s*)?(minutes?|hours?)/i);
  if (!match) return undefined;
  const n = parseInt(match[1], 10);
  return match[2].toLowerCase().startsWith("hour") ? n * 3600 : n * 60;
}

// ── Recipe Mapper ──

export function mapSpoonacularRecipe(raw: SpoonacularRecipe): Recipe {
  const calorieNutrient = raw.nutrition?.nutrients.find(
    (n) => n.name === "Calories"
  );

  const mappedSteps: RecipeStep[] = raw.analyzedInstructions?.[0]?.steps?.map((s) => {
    const fromLength = s.length ? convertToSeconds(s.length.number, s.length.unit) : undefined;
    const fromText = fromLength === undefined ? detectDurationFromText(s.step) : undefined;
    return { text: s.step, durationSeconds: fromLength ?? fromText };
  }) ?? [];

  return {
    id: String(raw.id),
    name: raw.title,
    time: `${raw.readyInMinutes} min`,
    calories: calorieNutrient
      ? `${Math.round(calorieNutrient.amount)} cal`
      : "—",
    servings: `${raw.servings} servings`,
    description: stripHtml(raw.summary),
    tags: buildTags(raw),
    emoji: pickEmoji(raw.dishTypes ?? [], raw.cuisines ?? []),
    imageUrl: raw.image || undefined,
    ingredients: raw.extendedIngredients?.map(mapIngredient),
    instructions: mappedSteps.length > 0 ? mappedSteps : undefined,
    rating: raw.spoonacularScore ? Math.round(raw.spoonacularScore) : undefined,
    sourceUrl: raw.sourceUrl || undefined,
  };
}

// ── Fixture Fallback Pool ──

/**
 * Returns the fixture pool filtered and mapped through the same pipeline as
 * live API data. Used when the API key is absent, quota is exceeded, or a
 * network error occurs.
 *
 * @param isPro - When false, strips nutrition data so calories show "—",
 *                mirroring what the free /recipes/random endpoint returns.
 */
function getFixturePool(dietary: DietaryFilter[], isPro: boolean): Recipe[] {
  const raws = isPro
    ? FIXTURE_RECIPES
    : FIXTURE_RECIPES.map((r) => ({ ...r, nutrition: undefined }));

  return raws
    .filter((r) => passesIngredientFilter(r, dietary))
    .map(mapSpoonacularRecipe);
}

// ── Fetch Functions ──

/**
 * Fetches a pool of recipes for Guest/Free users using /recipes/random.
 * No nutrition data — calories will show "—".
 * Falls back to the fixture pool on any API/network error.
 */
export async function fetchRandomPool(
  dietary: DietaryFilter[]
): Promise<Recipe[]> {
  if (!API_KEY) {
    if (__DEV__) console.log("[spoonacular] No API key — using fixture pool");
    return getFixturePool(dietary, false);
  }

  const { includeTags, excludeTags } = buildTagParams(dietary);

  const params = new URLSearchParams({
    apiKey: API_KEY,
    number: String(POOL_SIZE),
    "include-tags": includeTags,
  });
  if (excludeTags) params.set("exclude-tags", excludeTags);

  let response: Response;
  try {
    response = await fetch(`${BASE}/recipes/random?${params.toString()}`);
  } catch (err) {
    console.log("[spoonacular] Network error — using fixture pool:", err);
    return getFixturePool(dietary, false);
  }

  if (!response.ok) {
    const label =
      response.status === 402
        ? "QUOTA EXCEEDED (402)"
        : response.status === 401
          ? "INVALID API KEY (401)"
          : `HTTP ERROR ${response.status}`;
    console.log(`[spoonacular] ${label} — using fixture pool`);
    return getFixturePool(dietary, false);
  }

  const data: SpoonacularRandomResponse = await response.json();
  const recipes = (data.recipes ?? []).filter((r) =>
    passesIngredientFilter(r, dietary)
  );

  if (recipes.length === 0) {
    // Spoonacular sometimes returns HTTP 200 with an empty recipes array
    // when quota is silently exceeded (JSON body has code:402) or when
    // tags return no results. Fall back to fixtures either way.
    console.log("[spoonacular] API returned 0 recipes — using fixture pool");
    return getFixturePool(dietary, false);
  }

  return recipes.map(mapSpoonacularRecipe);
}

/**
 * Fetches a pool of recipes for Pro users using /recipes/complexSearch.
 * Includes nutrition data — calories will show real values.
 * Falls back to the fixture pool on any API/network error.
 */
export async function fetchProPool(
  dietary: DietaryFilter[]
): Promise<Recipe[]> {
  if (!API_KEY) {
    if (__DEV__) console.log("[spoonacular] No API key — using fixture pool");
    return getFixturePool(dietary, true);
  }

  const { diet, intolerances } = buildComplexSearchParams(dietary);

  const params = new URLSearchParams({
    apiKey: API_KEY,
    number: String(POOL_SIZE),
    sort: "random",
    addRecipeInformation: "true",
    addRecipeNutrition: "true",
    type: "main course",
  });
  if (diet) params.set("diet", diet);
  if (intolerances) params.set("intolerances", intolerances);

  let response: Response;
  try {
    response = await fetch(`${BASE}/recipes/complexSearch?${params.toString()}`);
  } catch (err) {
    console.log("[spoonacular] Network error — using fixture pool:", err);
    return getFixturePool(dietary, true);
  }

  if (!response.ok) {
    const label =
      response.status === 402
        ? "QUOTA EXCEEDED (402)"
        : response.status === 401
          ? "INVALID API KEY (401)"
          : `HTTP ERROR ${response.status}`;
    console.log(`[spoonacular] ${label} — using fixture pool`);
    return getFixturePool(dietary, true);
  }

  const data: SpoonacularSearchResponse = await response.json();
  const recipes = (data.results ?? []).filter((r) =>
    passesIngredientFilter(r, dietary)
  );

  if (recipes.length === 0) {
    console.log("[spoonacular] API returned 0 recipes — using fixture pool");
    return getFixturePool(dietary, true);
  }

  return recipes.map(mapSpoonacularRecipe);
}
