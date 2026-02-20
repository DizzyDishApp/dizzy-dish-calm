/**
 * Pure function unit tests for lib/spoonacular.ts
 *
 * Uses jest.unmock to test the real implementations, since jest.setup.js
 * mocks the whole module by default.
 */

jest.unmock("@/lib/spoonacular");

import {
  buildTagParams,
  buildPoolFingerprint,
  mapSpoonacularRecipe,
  passesTimeFilter,
  passesCalorieFilter,
  passesIngredientFilter,
  pickEmoji,
  stripHtml,
  detectDurationFromText,
} from "@/lib/spoonacular";
import type { Recipe } from "@/types";

// ── Helpers ──

function makeRawRecipe(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    title: "Test Recipe",
    readyInMinutes: 25,
    servings: 4,
    image: "https://example.com/image.jpg",
    summary: "<p>A test recipe description.</p>",
    vegetarian: false,
    vegan: false,
    glutenFree: false,
    dairyFree: false,
    ketogenic: false,
    lowFodmap: false,
    sustainable: false,
    extendedIngredients: [],
    cuisines: [],
    dishTypes: ["main course"],
    sourceUrl: "https://example.com/recipe",
    ...overrides,
  };
}

// ── buildTagParams ──

describe("buildTagParams", () => {
  it("always includes main+course in includeTags", () => {
    const { includeTags } = buildTagParams([]);
    expect(includeTags).toContain("main+course");
  });

  it("Vegetarian → include-tag 'vegetarian'", () => {
    const { includeTags } = buildTagParams(["Vegetarian"]);
    expect(includeTags).toContain("vegetarian");
  });

  it("Vegan + Gluten Free → comma-separated includeTags", () => {
    const { includeTags } = buildTagParams(["Vegan", "Gluten Free"]);
    expect(includeTags).toContain("vegan");
    expect(includeTags).toContain("gluten+free");
  });

  it("No Pork → excludeTags 'pork'", () => {
    const { excludeTags } = buildTagParams(["No Pork"]);
    expect(excludeTags).toContain("pork");
  });

  it("No Tree Nuts → excludeTags 'tree+nuts'", () => {
    const { excludeTags } = buildTagParams(["No Tree Nuts"]);
    expect(excludeTags).toContain("tree+nuts");
  });

  it("Sugar Free → no tag emitted (no-op)", () => {
    const { includeTags, excludeTags } = buildTagParams(["Sugar Free"]);
    // Only main+course, Sugar Free is skipped
    expect(includeTags).toBe("main+course");
    expect(excludeTags).toBe("");
  });

  it("combined include + exclude filters", () => {
    const { includeTags, excludeTags } = buildTagParams(["Vegan", "No Pork"]);
    expect(includeTags).toContain("vegan");
    expect(excludeTags).toContain("pork");
  });

  it("empty dietary → only main+course in includeTags", () => {
    const { includeTags, excludeTags } = buildTagParams([]);
    expect(includeTags).toBe("main+course");
    expect(excludeTags).toBe("");
  });
});

// ── buildPoolFingerprint ──

describe("buildPoolFingerprint", () => {
  it("same fingerprint regardless of input order", () => {
    const a = buildPoolFingerprint(["Vegan", "Gluten Free"], false);
    const b = buildPoolFingerprint(["Gluten Free", "Vegan"], false);
    expect(a).toBe(b);
  });

  it("free vs pro users produce different fingerprints", () => {
    const free = buildPoolFingerprint(["Vegan"], false);
    const pro = buildPoolFingerprint(["Vegan"], true);
    expect(free).not.toBe(pro);
    expect(free).toContain("|free");
    expect(pro).toContain("|pro");
  });

  it("empty dietary array → '|free' / '|pro'", () => {
    expect(buildPoolFingerprint([], false)).toBe("|free");
    expect(buildPoolFingerprint([], true)).toBe("|pro");
  });
});

// ── mapSpoonacularRecipe ──

describe("mapSpoonacularRecipe", () => {
  it("maps id to string", () => {
    const result = mapSpoonacularRecipe(makeRawRecipe({ id: 42 }));
    expect(result.id).toBe("42");
  });

  it("formats time as '25 min'", () => {
    const result = mapSpoonacularRecipe(makeRawRecipe({ readyInMinutes: 25 }));
    expect(result.time).toBe("25 min");
  });

  it("formats servings as '4 servings'", () => {
    const result = mapSpoonacularRecipe(makeRawRecipe({ servings: 4 }));
    expect(result.servings).toBe("4 servings");
  });

  it("calories = '—' when no nutrition data", () => {
    const result = mapSpoonacularRecipe(makeRawRecipe());
    expect(result.calories).toBe("—");
  });

  it("calories = '420 cal' when nutrition nutrient present", () => {
    const result = mapSpoonacularRecipe(
      makeRawRecipe({
        nutrition: {
          nutrients: [{ name: "Calories", amount: 420.4, unit: "kcal" }],
        },
      })
    );
    expect(result.calories).toBe("420 cal");
  });

  it("strips HTML from summary", () => {
    const result = mapSpoonacularRecipe(
      makeRawRecipe({ summary: "<p>A <b>great</b> recipe.</p>" })
    );
    expect(result.description).not.toContain("<");
    expect(result.description).toContain("great");
  });

  it("maps extendedIngredients to Ingredient[]", () => {
    const result = mapSpoonacularRecipe(
      makeRawRecipe({
        extendedIngredients: [
          {
            id: 1,
            name: "chicken",
            amount: 1.5,
            unit: "lbs",
            original: "1.5 lbs chicken",
          },
        ],
      })
    );
    expect(result.ingredients).toHaveLength(1);
    expect(result.ingredients![0].name).toBe("chicken");
  });

  it("adds 'Under 30 Min' tag for ≤30 min recipe", () => {
    const result = mapSpoonacularRecipe(makeRawRecipe({ readyInMinutes: 30 }));
    expect(result.tags).toContain("Under 30 Min");
  });

  it("adds 'Under 60 Min' tag for 31–60 min recipe", () => {
    const result = mapSpoonacularRecipe(makeRawRecipe({ readyInMinutes: 45 }));
    expect(result.tags).toContain("Under 60 Min");
    expect(result.tags).not.toContain("Under 30 Min");
  });

  it("vegetarian flag → 'Vegetarian' tag", () => {
    const result = mapSpoonacularRecipe(makeRawRecipe({ vegetarian: true }));
    expect(result.tags).toContain("Vegetarian");
  });

  it("sets imageUrl and sourceUrl", () => {
    const result = mapSpoonacularRecipe(
      makeRawRecipe({
        image: "https://example.com/img.jpg",
        sourceUrl: "https://example.com/recipe",
      })
    );
    expect(result.imageUrl).toBe("https://example.com/img.jpg");
    expect(result.sourceUrl).toBe("https://example.com/recipe");
  });

  it("maps analyzedInstructions to RecipeStep[]", () => {
    const result = mapSpoonacularRecipe(
      makeRawRecipe({
        analyzedInstructions: [
          {
            name: "",
            steps: [
              { number: 1, step: "Boil water for 8 minutes." },
              { number: 2, step: "Add pasta and stir.", length: { number: 10, unit: "minutes" } },
            ],
          },
        ],
      })
    );
    expect(result.instructions).toHaveLength(2);
    expect(result.instructions![0].text).toBe("Boil water for 8 minutes.");
    expect(result.instructions![1].text).toBe("Add pasta and stir.");
    expect(result.instructions![1].durationSeconds).toBe(600);
  });

  it("uses length field when present (overrides text detection)", () => {
    const result = mapSpoonacularRecipe(
      makeRawRecipe({
        analyzedInstructions: [
          {
            name: "",
            steps: [
              { number: 1, step: "Simmer for 5 minutes.", length: { number: 3, unit: "minutes" } },
            ],
          },
        ],
      })
    );
    // length field wins over text "5 minutes" — should be 3 min = 180s
    expect(result.instructions![0].durationSeconds).toBe(180);
  });

  it("falls back to text detection when no length field", () => {
    const result = mapSpoonacularRecipe(
      makeRawRecipe({
        analyzedInstructions: [
          {
            name: "",
            steps: [
              { number: 1, step: "Bake for 25 minutes until golden." },
            ],
          },
        ],
      })
    );
    expect(result.instructions![0].durationSeconds).toBe(1500);
  });

  it("instructions is undefined when no analyzedInstructions", () => {
    const result = mapSpoonacularRecipe(makeRawRecipe());
    expect(result.instructions).toBeUndefined();
  });
});

// ── passesTimeFilter ──

describe("passesTimeFilter", () => {
  function recipe(time: string): Recipe {
    return { id: "1", name: "", time, calories: "—", servings: "", description: "", tags: [], emoji: "" };
  }

  it("passes 'Under 30 Min' for 25-min recipe", () => {
    expect(passesTimeFilter(recipe("25 min"), "Under 30 Min")).toBe(true);
  });

  it("fails 'Under 30 Min' for 31-min recipe", () => {
    expect(passesTimeFilter(recipe("31 min"), "Under 30 Min")).toBe(false);
  });

  it("passes 'Under 60 Min' for 45-min recipe", () => {
    expect(passesTimeFilter(recipe("45 min"), "Under 60 Min")).toBe(true);
  });

  it("passes 'Any' always", () => {
    expect(passesTimeFilter(recipe("90 min"), "Any")).toBe(true);
  });
});

// ── passesCalorieFilter ──

describe("passesCalorieFilter", () => {
  function recipe(calories: string): Recipe {
    return { id: "1", name: "", time: "", calories, servings: "", description: "", tags: [], emoji: "" };
  }

  it("'Light' passes recipe < 400 cal", () => {
    expect(passesCalorieFilter(recipe("350 cal"), "Light")).toBe(true);
  });

  it("'Light' fails recipe > 400 cal", () => {
    expect(passesCalorieFilter(recipe("500 cal"), "Light")).toBe(false);
  });

  it("'—' (no nutrition) always passes regardless of filter", () => {
    expect(passesCalorieFilter(recipe("—"), "Light")).toBe(true);
    expect(passesCalorieFilter(recipe("—"), "Moderate")).toBe(true);
    expect(passesCalorieFilter(recipe("—"), "Hearty")).toBe(true);
  });
});

// ── passesIngredientFilter ──

describe("passesIngredientFilter", () => {
  function makeRaw(ingredientNames: string[]) {
    return makeRawRecipe({
      extendedIngredients: ingredientNames.map((name, i) => ({
        id: i,
        name,
        amount: 1,
        unit: "cup",
        original: `1 cup ${name}`,
      })),
    });
  }

  it("rejects recipe with bacon when No Pork active", () => {
    expect(passesIngredientFilter(makeRaw(["bacon", "eggs"]), ["No Pork"])).toBe(false);
  });

  it("accepts recipe with no pork ingredients when No Pork active", () => {
    expect(passesIngredientFilter(makeRaw(["chicken", "garlic"]), ["No Pork"])).toBe(true);
  });

  it("case-insensitive match (BEEF → rejected)", () => {
    const raw = makeRawRecipe({
      extendedIngredients: [
        { id: 1, name: "BEEF", amount: 1, unit: "lb", original: "1 lb BEEF" },
      ],
    });
    expect(passesIngredientFilter(raw, ["No Beef"])).toBe(false);
  });

  it("'soy sauce' → rejected for No Soy", () => {
    expect(passesIngredientFilter(makeRaw(["soy sauce"]), ["No Soy"])).toBe(false);
  });

  it("no filters active → always passes", () => {
    expect(passesIngredientFilter(makeRaw(["bacon", "beef", "shrimp"]), [])).toBe(true);
  });
});

// ── pickEmoji ──

describe("pickEmoji", () => {
  it("soup dishType → 🍜", () => {
    expect(pickEmoji(["soup"], [])).toBe("🍜");
  });

  it("mexican cuisine → 🌮", () => {
    expect(pickEmoji([], ["Mexican"])).toBe("🌮");
  });

  it("dishType takes priority over cuisine", () => {
    expect(pickEmoji(["soup"], ["Mexican"])).toBe("🍜");
  });

  it("unknown → fallback emoji", () => {
    expect(pickEmoji([], [])).toBe("🍲");
  });
});

// ── detectDurationFromText ──

describe("detectDurationFromText", () => {
  it("'cook for 8 minutes' → 480", () => {
    expect(detectDurationFromText("cook for 8 minutes")).toBe(480);
  });

  it("'simmer for 1 hour' → 3600", () => {
    expect(detectDurationFromText("simmer for 1 hour")).toBe(3600);
  });

  it("'bake 25 to 30 minutes' → 1500 (uses first number)", () => {
    expect(detectDurationFromText("bake 25 to 30 minutes")).toBe(1500);
  });

  it("'stir well' → undefined", () => {
    expect(detectDurationFromText("stir well")).toBeUndefined();
  });

  it("case-insensitive: 'cook 5 Minutes' → 300", () => {
    expect(detectDurationFromText("cook 5 Minutes")).toBe(300);
  });

  it("'2 hours' → 7200", () => {
    expect(detectDurationFromText("roast for 2 hours")).toBe(7200);
  });
});

// ── stripHtml ──

describe("stripHtml", () => {
  it("removes HTML tags", () => {
    expect(stripHtml("<p>Hello <b>world</b></p>")).toBe("Hello world");
  });

  it("collapses whitespace", () => {
    expect(stripHtml("<p>  lots   of   spaces  </p>")).toBe("lots of spaces");
  });

  it("caps at 280 chars", () => {
    const long = "A".repeat(300);
    const result = stripHtml(long);
    expect(result.length).toBeLessThanOrEqual(280);
    expect(result).toContain("...");
  });
});
