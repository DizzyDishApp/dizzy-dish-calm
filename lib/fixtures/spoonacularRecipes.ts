/**
 * Fixture pool — 25 hand-crafted recipes in raw SpoonacularRecipe format.
 *
 * Used as a fallback when:
 *   - No API key is configured
 *   - The Spoonacular API returns a quota/auth error (402/401)
 *   - A network error prevents reaching the API
 *
 * The existing mapper, ingredient filter, and tag-builder pipeline in
 * lib/spoonacular.ts runs on these identically to live API data.
 */

import type { SpoonacularRecipe } from "@/lib/spoonacular";

export const FIXTURE_RECIPES: SpoonacularRecipe[] = [
  // ── 1. Honey Garlic Salmon ──────────────────────────────────────────────
  {
    id: 10001,
    title: "Honey Garlic Salmon",
    readyInMinutes: 25,
    servings: 2,
    image: "",
    summary:
      "Pan-seared salmon fillets glazed with a sticky honey garlic sauce. Quick, healthy, and packed with omega-3s.",
    vegetarian: false,
    vegan: false,
    glutenFree: true,
    dairyFree: true,
    ketogenic: false,
    lowFodmap: false,
    sustainable: false,
    cuisines: ["american"],
    dishTypes: ["main course"],
    sourceUrl: "",
    extendedIngredients: [
      { id: 1, name: "salmon fillets", amount: 2, unit: "pieces", original: "2 salmon fillets (6 oz each)" },
      { id: 2, name: "honey", amount: 3, unit: "tbsp", original: "3 tbsp honey" },
      { id: 3, name: "garlic", amount: 4, unit: "cloves", original: "4 garlic cloves, minced" },
      { id: 4, name: "soy sauce", amount: 2, unit: "tbsp", original: "2 tbsp gluten-free soy sauce" },
      { id: 5, name: "olive oil", amount: 1, unit: "tbsp", original: "1 tbsp olive oil" },
      { id: 6, name: "lemon", amount: 1, unit: "whole", original: "1 lemon, sliced" },
    ],
    nutrition: {
      nutrients: [{ name: "Calories", amount: 380, unit: "kcal" }],
    },
  },

  // ── 2. Chicken Tikka Masala ─────────────────────────────────────────────
  {
    id: 10002,
    title: "Chicken Tikka Masala",
    readyInMinutes: 45,
    servings: 4,
    image: "",
    summary:
      "Tender chicken pieces simmered in a rich, spiced tomato and cream sauce. A beloved Indian-inspired comfort dish.",
    vegetarian: false,
    vegan: false,
    glutenFree: false,
    dairyFree: false,
    ketogenic: false,
    lowFodmap: false,
    sustainable: false,
    cuisines: ["indian"],
    dishTypes: ["main course"],
    sourceUrl: "",
    extendedIngredients: [
      { id: 1, name: "chicken thighs", amount: 1.5, unit: "lb", original: "1.5 lb boneless chicken thighs, cubed" },
      { id: 2, name: "heavy cream", amount: 0.5, unit: "cup", original: "1/2 cup heavy cream" },
      { id: 3, name: "crushed tomatoes", amount: 14, unit: "oz", original: "14 oz crushed tomatoes" },
      { id: 4, name: "garam masala", amount: 2, unit: "tsp", original: "2 tsp garam masala" },
      { id: 5, name: "garlic", amount: 4, unit: "cloves", original: "4 garlic cloves, minced" },
      { id: 6, name: "ginger", amount: 1, unit: "tbsp", original: "1 tbsp fresh ginger, grated" },
      { id: 7, name: "onion", amount: 1, unit: "whole", original: "1 large onion, diced" },
    ],
    nutrition: {
      nutrients: [{ name: "Calories", amount: 520, unit: "kcal" }],
    },
  },

  // ── 3. Spaghetti Carbonara ──────────────────────────────────────────────
  {
    id: 10003,
    title: "Spaghetti Carbonara",
    readyInMinutes: 25,
    servings: 2,
    image: "",
    summary:
      "Classic Roman pasta with crispy pancetta, eggs, and Pecorino Romano. Silky, rich, and ready in under 30 minutes.",
    vegetarian: false,
    vegan: false,
    glutenFree: false,
    dairyFree: false,
    ketogenic: false,
    lowFodmap: false,
    sustainable: false,
    cuisines: ["italian"],
    dishTypes: ["main course"],
    sourceUrl: "",
    extendedIngredients: [
      { id: 1, name: "spaghetti", amount: 8, unit: "oz", original: "8 oz spaghetti" },
      { id: 2, name: "pancetta", amount: 4, unit: "oz", original: "4 oz pancetta or guanciale, diced" },
      { id: 3, name: "eggs", amount: 3, unit: "whole", original: "3 large eggs" },
      { id: 4, name: "Pecorino Romano", amount: 0.75, unit: "cup", original: "3/4 cup grated Pecorino Romano" },
      { id: 5, name: "black pepper", amount: 1, unit: "tsp", original: "1 tsp freshly cracked black pepper" },
    ],
    nutrition: {
      nutrients: [{ name: "Calories", amount: 620, unit: "kcal" }],
    },
  },

  // ── 4. Black Bean Tacos ─────────────────────────────────────────────────
  {
    id: 10004,
    title: "Black Bean Tacos",
    readyInMinutes: 20,
    servings: 4,
    image: "",
    summary:
      "Smoky spiced black beans piled into corn tortillas with fresh avocado, pico de gallo, and lime. Vegan and gluten-free.",
    vegetarian: true,
    vegan: true,
    glutenFree: true,
    dairyFree: true,
    ketogenic: false,
    lowFodmap: false,
    sustainable: false,
    cuisines: ["mexican"],
    dishTypes: ["main course"],
    sourceUrl: "",
    extendedIngredients: [
      { id: 1, name: "black beans", amount: 15, unit: "oz", original: "15 oz canned black beans, drained" },
      { id: 2, name: "corn tortillas", amount: 8, unit: "whole", original: "8 corn tortillas" },
      { id: 3, name: "avocado", amount: 1, unit: "whole", original: "1 ripe avocado, sliced" },
      { id: 4, name: "tomato", amount: 2, unit: "whole", original: "2 roma tomatoes, diced" },
      { id: 5, name: "lime", amount: 1, unit: "whole", original: "1 lime, juiced" },
      { id: 6, name: "cumin", amount: 1, unit: "tsp", original: "1 tsp cumin" },
      { id: 7, name: "cilantro", amount: 0.25, unit: "cup", original: "1/4 cup fresh cilantro" },
    ],
    nutrition: {
      nutrients: [{ name: "Calories", amount: 340, unit: "kcal" }],
    },
  },

  // ── 5. Thai Green Curry with Chicken ────────────────────────────────────
  {
    id: 10005,
    title: "Thai Green Curry with Chicken",
    readyInMinutes: 30,
    servings: 4,
    image: "",
    summary:
      "Fragrant green curry paste simmered with coconut milk, chicken, and vegetables. Serve over jasmine rice.",
    vegetarian: false,
    vegan: false,
    glutenFree: false,
    dairyFree: false,
    ketogenic: false,
    lowFodmap: false,
    sustainable: false,
    cuisines: ["thai"],
    dishTypes: ["main course"],
    sourceUrl: "",
    extendedIngredients: [
      { id: 1, name: "chicken breast", amount: 1, unit: "lb", original: "1 lb chicken breast, sliced" },
      { id: 2, name: "coconut milk", amount: 14, unit: "oz", original: "14 oz full-fat coconut milk" },
      { id: 3, name: "green curry paste", amount: 3, unit: "tbsp", original: "3 tbsp Thai green curry paste" },
      { id: 4, name: "zucchini", amount: 1, unit: "whole", original: "1 zucchini, sliced" },
      { id: 5, name: "bell pepper", amount: 1, unit: "whole", original: "1 green bell pepper, sliced" },
      { id: 6, name: "fish sauce", amount: 2, unit: "tbsp", original: "2 tbsp fish sauce" },
      { id: 7, name: "basil", amount: 0.25, unit: "cup", original: "1/4 cup Thai basil leaves" },
    ],
    nutrition: {
      nutrients: [{ name: "Calories", amount: 480, unit: "kcal" }],
    },
  },

  // ── 6. Grilled Chicken Caesar Salad ─────────────────────────────────────
  {
    id: 10006,
    title: "Grilled Chicken Caesar Salad",
    readyInMinutes: 20,
    servings: 2,
    image: "",
    summary:
      "Grilled chicken breast over crisp romaine with a classic Caesar dressing and Parmesan shavings. Skip the croutons for a keto-friendly meal.",
    vegetarian: false,
    vegan: false,
    glutenFree: true,
    dairyFree: false,
    ketogenic: true,
    lowFodmap: false,
    sustainable: false,
    cuisines: ["american"],
    dishTypes: ["main course", "salad"],
    sourceUrl: "",
    extendedIngredients: [
      { id: 1, name: "chicken breast", amount: 1, unit: "lb", original: "1 lb chicken breast" },
      { id: 2, name: "romaine lettuce", amount: 1, unit: "head", original: "1 head romaine lettuce, chopped" },
      { id: 3, name: "Parmesan cheese", amount: 0.5, unit: "cup", original: "1/2 cup shaved Parmesan" },
      { id: 4, name: "Caesar dressing", amount: 4, unit: "tbsp", original: "4 tbsp Caesar dressing" },
      { id: 5, name: "lemon", amount: 0.5, unit: "whole", original: "1/2 lemon, juiced" },
    ],
    nutrition: {
      nutrients: [{ name: "Calories", amount: 420, unit: "kcal" }],
    },
  },

  // ── 7. Shakshuka ────────────────────────────────────────────────────────
  {
    id: 10007,
    title: "Shakshuka",
    readyInMinutes: 25,
    servings: 2,
    image: "",
    summary:
      "Eggs poached in a spiced tomato and pepper sauce. A beloved Middle Eastern and Mediterranean one-pan breakfast or dinner.",
    vegetarian: true,
    vegan: false,
    glutenFree: true,
    dairyFree: true,
    ketogenic: false,
    lowFodmap: false,
    sustainable: false,
    cuisines: ["mediterranean"],
    dishTypes: ["main course", "breakfast"],
    sourceUrl: "",
    extendedIngredients: [
      { id: 1, name: "eggs", amount: 4, unit: "whole", original: "4 large eggs" },
      { id: 2, name: "crushed tomatoes", amount: 14, unit: "oz", original: "14 oz crushed tomatoes" },
      { id: 3, name: "bell pepper", amount: 1, unit: "whole", original: "1 red bell pepper, diced" },
      { id: 4, name: "onion", amount: 0.5, unit: "whole", original: "1/2 onion, diced" },
      { id: 5, name: "cumin", amount: 1, unit: "tsp", original: "1 tsp cumin" },
      { id: 6, name: "paprika", amount: 1, unit: "tsp", original: "1 tsp smoked paprika" },
    ],
    nutrition: {
      nutrients: [{ name: "Calories", amount: 290, unit: "kcal" }],
    },
  },

  // ── 8. Beef Bulgogi Bowl ─────────────────────────────────────────────────
  {
    id: 10008,
    title: "Beef Bulgogi Bowl",
    readyInMinutes: 35,
    servings: 4,
    image: "",
    summary:
      "Thinly sliced beef marinated in soy, sesame, and pear, grilled and served over steamed rice with kimchi and pickled vegetables.",
    vegetarian: false,
    vegan: false,
    glutenFree: false,
    dairyFree: true,
    ketogenic: false,
    lowFodmap: false,
    sustainable: false,
    cuisines: ["korean"],
    dishTypes: ["main course"],
    sourceUrl: "",
    extendedIngredients: [
      { id: 1, name: "beef sirloin", amount: 1, unit: "lb", original: "1 lb beef sirloin, thinly sliced" },
      { id: 2, name: "soy sauce", amount: 4, unit: "tbsp", original: "4 tbsp soy sauce" },
      { id: 3, name: "sesame oil", amount: 2, unit: "tbsp", original: "2 tbsp sesame oil" },
      { id: 4, name: "pear", amount: 0.5, unit: "whole", original: "1/2 Asian pear, grated" },
      { id: 5, name: "garlic", amount: 3, unit: "cloves", original: "3 garlic cloves, minced" },
      { id: 6, name: "rice", amount: 2, unit: "cups", original: "2 cups cooked white rice" },
      { id: 7, name: "scallions", amount: 3, unit: "whole", original: "3 scallions, sliced" },
    ],
    nutrition: {
      nutrients: [{ name: "Calories", amount: 450, unit: "kcal" }],
    },
  },

  // ── 9. Mushroom Risotto ──────────────────────────────────────────────────
  {
    id: 10009,
    title: "Mushroom Risotto",
    readyInMinutes: 40,
    servings: 4,
    image: "",
    summary:
      "Creamy Arborio rice slow-cooked with sautéed mushrooms, white wine, and Parmesan. The ultimate vegetarian comfort food.",
    vegetarian: true,
    vegan: false,
    glutenFree: true,
    dairyFree: false,
    ketogenic: false,
    lowFodmap: false,
    sustainable: false,
    cuisines: ["italian"],
    dishTypes: ["main course"],
    sourceUrl: "",
    extendedIngredients: [
      { id: 1, name: "Arborio rice", amount: 1.5, unit: "cups", original: "1.5 cups Arborio rice" },
      { id: 2, name: "mixed mushrooms", amount: 12, unit: "oz", original: "12 oz mixed mushrooms, sliced" },
      { id: 3, name: "white wine", amount: 0.5, unit: "cup", original: "1/2 cup dry white wine" },
      { id: 4, name: "vegetable broth", amount: 4, unit: "cups", original: "4 cups warm vegetable broth" },
      { id: 5, name: "Parmesan cheese", amount: 0.5, unit: "cup", original: "1/2 cup grated Parmesan" },
      { id: 6, name: "butter", amount: 2, unit: "tbsp", original: "2 tbsp unsalted butter" },
      { id: 7, name: "onion", amount: 0.5, unit: "whole", original: "1/2 onion, finely diced" },
    ],
    nutrition: {
      nutrients: [{ name: "Calories", amount: 510, unit: "kcal" }],
    },
  },

  // ── 10. Lemon Herb Roast Chicken ─────────────────────────────────────────
  {
    id: 10010,
    title: "Lemon Herb Roast Chicken",
    readyInMinutes: 75,
    servings: 4,
    image: "",
    summary:
      "Whole chicken roasted with lemon, garlic, and fresh herbs until golden and juicy. A timeless Sunday dinner centerpiece.",
    vegetarian: false,
    vegan: false,
    glutenFree: true,
    dairyFree: true,
    ketogenic: false,
    lowFodmap: false,
    sustainable: false,
    cuisines: ["american"],
    dishTypes: ["main course"],
    sourceUrl: "",
    extendedIngredients: [
      { id: 1, name: "whole chicken", amount: 4, unit: "lb", original: "1 whole chicken (4 lb)" },
      { id: 2, name: "lemon", amount: 2, unit: "whole", original: "2 lemons, halved" },
      { id: 3, name: "garlic", amount: 6, unit: "cloves", original: "6 garlic cloves" },
      { id: 4, name: "rosemary", amount: 3, unit: "sprigs", original: "3 fresh rosemary sprigs" },
      { id: 5, name: "thyme", amount: 4, unit: "sprigs", original: "4 fresh thyme sprigs" },
      { id: 6, name: "olive oil", amount: 3, unit: "tbsp", original: "3 tbsp olive oil" },
    ],
    nutrition: {
      nutrients: [{ name: "Calories", amount: 580, unit: "kcal" }],
    },
  },

  // ── 11. Shrimp Pad Thai ──────────────────────────────────────────────────
  {
    id: 10011,
    title: "Shrimp Pad Thai",
    readyInMinutes: 30,
    servings: 4,
    image: "",
    summary:
      "Classic Thai stir-fried rice noodles with shrimp, eggs, bean sprouts, and a sweet-tangy tamarind sauce.",
    vegetarian: false,
    vegan: false,
    glutenFree: false,
    dairyFree: false,
    ketogenic: false,
    lowFodmap: false,
    sustainable: false,
    cuisines: ["thai"],
    dishTypes: ["main course"],
    sourceUrl: "",
    extendedIngredients: [
      { id: 1, name: "shrimp", amount: 1, unit: "lb", original: "1 lb large shrimp, peeled and deveined" },
      { id: 2, name: "rice noodles", amount: 8, unit: "oz", original: "8 oz flat rice noodles" },
      { id: 3, name: "eggs", amount: 2, unit: "whole", original: "2 large eggs" },
      { id: 4, name: "tamarind paste", amount: 3, unit: "tbsp", original: "3 tbsp tamarind paste" },
      { id: 5, name: "fish sauce", amount: 3, unit: "tbsp", original: "3 tbsp fish sauce" },
      { id: 6, name: "bean sprouts", amount: 1, unit: "cup", original: "1 cup bean sprouts" },
      { id: 7, name: "peanuts", amount: 0.25, unit: "cup", original: "1/4 cup roasted peanuts, chopped" },
    ],
    nutrition: {
      nutrients: [{ name: "Calories", amount: 470, unit: "kcal" }],
    },
  },

  // ── 12. Falafel Greek Salad Bowl ─────────────────────────────────────────
  {
    id: 10012,
    title: "Falafel Greek Salad Bowl",
    readyInMinutes: 25,
    servings: 2,
    image: "",
    summary:
      "Crispy baked falafel over a vibrant Greek salad with cucumber, olives, and lemon-herb dressing. Vegan and gluten-free.",
    vegetarian: true,
    vegan: true,
    glutenFree: true,
    dairyFree: true,
    ketogenic: false,
    lowFodmap: false,
    sustainable: false,
    cuisines: ["mediterranean"],
    dishTypes: ["main course", "salad"],
    sourceUrl: "",
    extendedIngredients: [
      { id: 1, name: "chickpeas", amount: 15, unit: "oz", original: "15 oz canned chickpeas, drained" },
      { id: 2, name: "cucumber", amount: 1, unit: "whole", original: "1 cucumber, diced" },
      { id: 3, name: "cherry tomatoes", amount: 1, unit: "cup", original: "1 cup cherry tomatoes, halved" },
      { id: 4, name: "kalamata olives", amount: 0.25, unit: "cup", original: "1/4 cup kalamata olives" },
      { id: 5, name: "red onion", amount: 0.25, unit: "whole", original: "1/4 red onion, thinly sliced" },
      { id: 6, name: "lemon", amount: 1, unit: "whole", original: "1 lemon, juiced" },
      { id: 7, name: "olive oil", amount: 2, unit: "tbsp", original: "2 tbsp extra-virgin olive oil" },
    ],
    nutrition: {
      nutrients: [{ name: "Calories", amount: 380, unit: "kcal" }],
    },
  },

  // ── 13. Slow-Cooked Pork Carnitas ────────────────────────────────────────
  {
    id: 10013,
    title: "Slow-Cooked Pork Carnitas",
    readyInMinutes: 90,
    servings: 6,
    image: "",
    summary:
      "Tender shredded pork slow-braised with orange, cumin, and oregano until meltingly soft. Crisp under the broiler for perfect carnitas.",
    vegetarian: false,
    vegan: false,
    glutenFree: true,
    dairyFree: true,
    ketogenic: false,
    lowFodmap: false,
    sustainable: false,
    cuisines: ["mexican"],
    dishTypes: ["main course"],
    sourceUrl: "",
    extendedIngredients: [
      { id: 1, name: "pork shoulder", amount: 3, unit: "lb", original: "3 lb pork shoulder, cut into chunks" },
      { id: 2, name: "orange juice", amount: 0.5, unit: "cup", original: "1/2 cup fresh orange juice" },
      { id: 3, name: "cumin", amount: 2, unit: "tsp", original: "2 tsp ground cumin" },
      { id: 4, name: "oregano", amount: 1, unit: "tsp", original: "1 tsp dried oregano" },
      { id: 5, name: "garlic", amount: 5, unit: "cloves", original: "5 garlic cloves" },
      { id: 6, name: "lime", amount: 1, unit: "whole", original: "1 lime, juiced" },
    ],
    nutrition: {
      nutrients: [{ name: "Calories", amount: 650, unit: "kcal" }],
    },
  },

  // ── 14. Miso Glazed Cod ──────────────────────────────────────────────────
  {
    id: 10014,
    title: "Miso Glazed Cod",
    readyInMinutes: 25,
    servings: 2,
    image: "",
    summary:
      "Silky cod fillets broiled under a savory-sweet white miso glaze. A restaurant-quality dish that comes together in minutes.",
    vegetarian: false,
    vegan: false,
    glutenFree: true,
    dairyFree: true,
    ketogenic: false,
    lowFodmap: false,
    sustainable: false,
    cuisines: ["japanese"],
    dishTypes: ["main course"],
    sourceUrl: "",
    extendedIngredients: [
      { id: 1, name: "cod fillets", amount: 2, unit: "pieces", original: "2 cod fillets (6 oz each)" },
      { id: 2, name: "white miso paste", amount: 3, unit: "tbsp", original: "3 tbsp white miso paste" },
      { id: 3, name: "mirin", amount: 2, unit: "tbsp", original: "2 tbsp mirin" },
      { id: 4, name: "sake", amount: 1, unit: "tbsp", original: "1 tbsp sake or dry sherry" },
      { id: 5, name: "sesame seeds", amount: 1, unit: "tsp", original: "1 tsp sesame seeds" },
      { id: 6, name: "scallions", amount: 2, unit: "whole", original: "2 scallions, thinly sliced" },
    ],
    nutrition: {
      nutrients: [{ name: "Calories", amount: 320, unit: "kcal" }],
    },
  },

  // ── 15. Butter Chicken ───────────────────────────────────────────────────
  {
    id: 10015,
    title: "Butter Chicken",
    readyInMinutes: 45,
    servings: 4,
    image: "",
    summary:
      "Tender chicken in a velvety tomato, butter, and cream sauce spiced with garam masala. A mild, deeply satisfying Indian classic.",
    vegetarian: false,
    vegan: false,
    glutenFree: true,
    dairyFree: false,
    ketogenic: false,
    lowFodmap: false,
    sustainable: false,
    cuisines: ["indian"],
    dishTypes: ["main course"],
    sourceUrl: "",
    extendedIngredients: [
      { id: 1, name: "chicken thighs", amount: 1.5, unit: "lb", original: "1.5 lb chicken thighs, cubed" },
      { id: 2, name: "butter", amount: 3, unit: "tbsp", original: "3 tbsp unsalted butter" },
      { id: 3, name: "heavy cream", amount: 0.5, unit: "cup", original: "1/2 cup heavy cream" },
      { id: 4, name: "crushed tomatoes", amount: 14, unit: "oz", original: "14 oz crushed tomatoes" },
      { id: 5, name: "garam masala", amount: 2, unit: "tsp", original: "2 tsp garam masala" },
      { id: 6, name: "garlic", amount: 4, unit: "cloves", original: "4 garlic cloves, minced" },
      { id: 7, name: "ginger", amount: 1, unit: "tbsp", original: "1 tbsp fresh ginger, grated" },
    ],
    nutrition: {
      nutrients: [{ name: "Calories", amount: 490, unit: "kcal" }],
    },
  },

  // ── 16. Teriyaki Tofu Stir Fry ───────────────────────────────────────────
  {
    id: 10016,
    title: "Teriyaki Tofu Stir Fry",
    readyInMinutes: 20,
    servings: 2,
    image: "",
    summary:
      "Crispy pan-fried tofu and colorful vegetables tossed in a homemade teriyaki glaze. Quick, vegan, and full of umami.",
    vegetarian: true,
    vegan: true,
    glutenFree: false,
    dairyFree: true,
    ketogenic: false,
    lowFodmap: false,
    sustainable: false,
    cuisines: ["japanese"],
    dishTypes: ["main course"],
    sourceUrl: "",
    extendedIngredients: [
      { id: 1, name: "firm tofu", amount: 14, unit: "oz", original: "14 oz firm tofu, pressed and cubed" },
      { id: 2, name: "soy sauce", amount: 4, unit: "tbsp", original: "4 tbsp soy sauce" },
      { id: 3, name: "mirin", amount: 2, unit: "tbsp", original: "2 tbsp mirin" },
      { id: 4, name: "broccoli", amount: 2, unit: "cups", original: "2 cups broccoli florets" },
      { id: 5, name: "bell pepper", amount: 1, unit: "whole", original: "1 red bell pepper, sliced" },
      { id: 6, name: "sesame oil", amount: 1, unit: "tbsp", original: "1 tbsp sesame oil" },
    ],
    nutrition: {
      nutrients: [{ name: "Calories", amount: 310, unit: "kcal" }],
    },
  },

  // ── 17. Pulled Pork BBQ Sandwich ─────────────────────────────────────────
  {
    id: 10017,
    title: "Pulled Pork BBQ Sandwich",
    readyInMinutes: 120,
    servings: 8,
    image: "",
    summary:
      "Slow-smoked pork shoulder shredded and piled onto toasted brioche buns with tangy coleslaw and smoky BBQ sauce.",
    vegetarian: false,
    vegan: false,
    glutenFree: false,
    dairyFree: false,
    ketogenic: false,
    lowFodmap: false,
    sustainable: false,
    cuisines: ["american"],
    dishTypes: ["main course"],
    sourceUrl: "",
    extendedIngredients: [
      { id: 1, name: "pork shoulder", amount: 4, unit: "lb", original: "4 lb pork shoulder" },
      { id: 2, name: "BBQ sauce", amount: 1, unit: "cup", original: "1 cup smoky BBQ sauce" },
      { id: 3, name: "brioche buns", amount: 8, unit: "whole", original: "8 brioche buns" },
      { id: 4, name: "coleslaw mix", amount: 2, unit: "cups", original: "2 cups coleslaw mix" },
      { id: 5, name: "apple cider vinegar", amount: 2, unit: "tbsp", original: "2 tbsp apple cider vinegar" },
      { id: 6, name: "brown sugar", amount: 2, unit: "tbsp", original: "2 tbsp brown sugar" },
    ],
    nutrition: {
      nutrients: [{ name: "Calories", amount: 750, unit: "kcal" }],
    },
  },

  // ── 18. Avocado Toast with Soft Eggs ─────────────────────────────────────
  {
    id: 10018,
    title: "Avocado Toast with Soft Eggs",
    readyInMinutes: 15,
    servings: 2,
    image: "",
    summary:
      "Creamy smashed avocado on toasted sourdough topped with jammy soft-boiled eggs, everything bagel seasoning, and chili flakes.",
    vegetarian: true,
    vegan: false,
    glutenFree: false,
    dairyFree: true,
    ketogenic: false,
    lowFodmap: false,
    sustainable: false,
    cuisines: ["american"],
    dishTypes: ["main course", "breakfast"],
    sourceUrl: "",
    extendedIngredients: [
      { id: 1, name: "sourdough bread", amount: 2, unit: "slices", original: "2 thick slices sourdough bread" },
      { id: 2, name: "avocado", amount: 1, unit: "whole", original: "1 ripe avocado" },
      { id: 3, name: "eggs", amount: 2, unit: "whole", original: "2 large eggs" },
      { id: 4, name: "lemon juice", amount: 1, unit: "tsp", original: "1 tsp lemon juice" },
      { id: 5, name: "red pepper flakes", amount: 0.25, unit: "tsp", original: "1/4 tsp red pepper flakes" },
    ],
    nutrition: {
      nutrients: [{ name: "Calories", amount: 380, unit: "kcal" }],
    },
  },

  // ── 19. Lamb Chops with Mint Gremolata ───────────────────────────────────
  {
    id: 10019,
    title: "Lamb Chops with Mint Gremolata",
    readyInMinutes: 25,
    servings: 2,
    image: "",
    summary:
      "Pan-seared lamb loin chops finished in the oven and served with a bright mint and lemon gremolata. Elegant and naturally keto.",
    vegetarian: false,
    vegan: false,
    glutenFree: true,
    dairyFree: true,
    ketogenic: true,
    lowFodmap: false,
    sustainable: false,
    cuisines: ["mediterranean"],
    dishTypes: ["main course"],
    sourceUrl: "",
    extendedIngredients: [
      { id: 1, name: "lamb loin chops", amount: 4, unit: "pieces", original: "4 lamb loin chops (about 1.5 lb)" },
      { id: 2, name: "fresh mint", amount: 0.25, unit: "cup", original: "1/4 cup fresh mint leaves, chopped" },
      { id: 3, name: "lemon zest", amount: 1, unit: "tsp", original: "1 tsp lemon zest" },
      { id: 4, name: "garlic", amount: 2, unit: "cloves", original: "2 garlic cloves, minced" },
      { id: 5, name: "olive oil", amount: 2, unit: "tbsp", original: "2 tbsp olive oil" },
      { id: 6, name: "rosemary", amount: 1, unit: "sprig", original: "1 fresh rosemary sprig" },
    ],
    nutrition: {
      nutrients: [{ name: "Calories", amount: 540, unit: "kcal" }],
    },
  },

  // ── 20. Coconut Red Lentil Soup ──────────────────────────────────────────
  {
    id: 10020,
    title: "Coconut Red Lentil Soup",
    readyInMinutes: 35,
    servings: 4,
    image: "",
    summary:
      "Red lentils simmered with coconut milk, turmeric, and ginger into a silky, warming soup. Vegan, gluten-free, and ready in 35 minutes.",
    vegetarian: true,
    vegan: true,
    glutenFree: true,
    dairyFree: true,
    ketogenic: false,
    lowFodmap: false,
    sustainable: false,
    cuisines: ["indian"],
    dishTypes: ["main course", "soup"],
    sourceUrl: "",
    extendedIngredients: [
      { id: 1, name: "red lentils", amount: 1.5, unit: "cups", original: "1.5 cups red lentils, rinsed" },
      { id: 2, name: "coconut milk", amount: 14, unit: "oz", original: "14 oz full-fat coconut milk" },
      { id: 3, name: "vegetable broth", amount: 3, unit: "cups", original: "3 cups vegetable broth" },
      { id: 4, name: "turmeric", amount: 1, unit: "tsp", original: "1 tsp ground turmeric" },
      { id: 5, name: "ginger", amount: 1, unit: "tbsp", original: "1 tbsp fresh ginger, grated" },
      { id: 6, name: "garlic", amount: 3, unit: "cloves", original: "3 garlic cloves, minced" },
      { id: 7, name: "spinach", amount: 2, unit: "cups", original: "2 cups baby spinach" },
    ],
    nutrition: {
      nutrients: [{ name: "Calories", amount: 360, unit: "kcal" }],
    },
  },

  // ── 21. NY Strip Steak with Herb Butter ──────────────────────────────────
  {
    id: 10021,
    title: "NY Strip Steak with Herb Butter",
    readyInMinutes: 20,
    servings: 2,
    image: "",
    summary:
      "Cast-iron seared NY strip steaks basted with garlic-herb compound butter. Restaurant-quality in under 20 minutes.",
    vegetarian: false,
    vegan: false,
    glutenFree: true,
    dairyFree: false,
    ketogenic: true,
    lowFodmap: false,
    sustainable: false,
    cuisines: ["american"],
    dishTypes: ["main course"],
    sourceUrl: "",
    extendedIngredients: [
      { id: 1, name: "NY strip steaks", amount: 2, unit: "pieces", original: "2 NY strip steaks (10 oz each)" },
      { id: 2, name: "butter", amount: 3, unit: "tbsp", original: "3 tbsp unsalted butter" },
      { id: 3, name: "garlic", amount: 3, unit: "cloves", original: "3 garlic cloves, crushed" },
      { id: 4, name: "thyme", amount: 3, unit: "sprigs", original: "3 fresh thyme sprigs" },
      { id: 5, name: "rosemary", amount: 1, unit: "sprig", original: "1 fresh rosemary sprig" },
    ],
    nutrition: {
      nutrients: [{ name: "Calories", amount: 680, unit: "kcal" }],
    },
  },

  // ── 22. Shrimp Fried Rice ────────────────────────────────────────────────
  {
    id: 10022,
    title: "Shrimp Fried Rice",
    readyInMinutes: 20,
    servings: 4,
    image: "",
    summary:
      "Classic takeout-style fried rice with plump shrimp, scrambled eggs, and peas tossed with soy sauce and sesame oil.",
    vegetarian: false,
    vegan: false,
    glutenFree: false,
    dairyFree: false,
    ketogenic: false,
    lowFodmap: false,
    sustainable: false,
    cuisines: ["chinese"],
    dishTypes: ["main course"],
    sourceUrl: "",
    extendedIngredients: [
      { id: 1, name: "shrimp", amount: 0.75, unit: "lb", original: "3/4 lb medium shrimp, peeled" },
      { id: 2, name: "cooked white rice", amount: 3, unit: "cups", original: "3 cups day-old cooked white rice" },
      { id: 3, name: "eggs", amount: 2, unit: "whole", original: "2 large eggs, beaten" },
      { id: 4, name: "frozen peas", amount: 0.5, unit: "cup", original: "1/2 cup frozen peas" },
      { id: 5, name: "soy sauce", amount: 3, unit: "tbsp", original: "3 tbsp soy sauce" },
      { id: 6, name: "sesame oil", amount: 1, unit: "tbsp", original: "1 tbsp sesame oil" },
      { id: 7, name: "scallions", amount: 3, unit: "whole", original: "3 scallions, sliced" },
    ],
    nutrition: {
      nutrients: [{ name: "Calories", amount: 430, unit: "kcal" }],
    },
  },

  // ── 23. Caprese Stuffed Chicken Breast ───────────────────────────────────
  {
    id: 10023,
    title: "Caprese Stuffed Chicken Breast",
    readyInMinutes: 35,
    servings: 2,
    image: "",
    summary:
      "Juicy chicken breasts stuffed with fresh mozzarella, basil, and sun-dried tomatoes, baked until golden and oozing.",
    vegetarian: false,
    vegan: false,
    glutenFree: true,
    dairyFree: false,
    ketogenic: false,
    lowFodmap: false,
    sustainable: false,
    cuisines: ["italian"],
    dishTypes: ["main course"],
    sourceUrl: "",
    extendedIngredients: [
      { id: 1, name: "chicken breasts", amount: 2, unit: "whole", original: "2 large chicken breasts" },
      { id: 2, name: "fresh mozzarella", amount: 4, unit: "oz", original: "4 oz fresh mozzarella, sliced" },
      { id: 3, name: "fresh basil", amount: 8, unit: "leaves", original: "8 fresh basil leaves" },
      { id: 4, name: "sun-dried tomatoes", amount: 0.25, unit: "cup", original: "1/4 cup sun-dried tomatoes, chopped" },
      { id: 5, name: "olive oil", amount: 2, unit: "tbsp", original: "2 tbsp olive oil" },
      { id: 6, name: "balsamic glaze", amount: 2, unit: "tbsp", original: "2 tbsp balsamic glaze" },
    ],
    nutrition: {
      nutrients: [{ name: "Calories", amount: 460, unit: "kcal" }],
    },
  },

  // ── 24. Roasted Vegetable Buddha Bowl ────────────────────────────────────
  {
    id: 10024,
    title: "Roasted Vegetable Buddha Bowl",
    readyInMinutes: 40,
    servings: 2,
    image: "",
    summary:
      "Colorful roasted sweet potato, chickpeas, and broccolini over quinoa with tahini-lemon dressing. Hearty, vegan, and gluten-free.",
    vegetarian: true,
    vegan: false,
    glutenFree: true,
    dairyFree: true,
    ketogenic: false,
    lowFodmap: false,
    sustainable: false,
    cuisines: ["mediterranean"],
    dishTypes: ["main course"],
    sourceUrl: "",
    extendedIngredients: [
      { id: 1, name: "sweet potato", amount: 1, unit: "whole", original: "1 large sweet potato, cubed" },
      { id: 2, name: "chickpeas", amount: 15, unit: "oz", original: "15 oz canned chickpeas, drained" },
      { id: 3, name: "broccolini", amount: 1, unit: "bunch", original: "1 bunch broccolini" },
      { id: 4, name: "quinoa", amount: 1, unit: "cup", original: "1 cup quinoa, cooked" },
      { id: 5, name: "tahini", amount: 2, unit: "tbsp", original: "2 tbsp tahini" },
      { id: 6, name: "lemon", amount: 1, unit: "whole", original: "1 lemon, juiced" },
      { id: 7, name: "olive oil", amount: 2, unit: "tbsp", original: "2 tbsp olive oil" },
    ],
    nutrition: {
      nutrients: [{ name: "Calories", amount: 390, unit: "kcal" }],
    },
  },

  // ── 25. Chicken Fajita Bowl ──────────────────────────────────────────────
  {
    id: 10025,
    title: "Chicken Fajita Bowl",
    readyInMinutes: 25,
    servings: 4,
    image: "",
    summary:
      "Sizzling spiced chicken strips with roasted peppers and onions over cilantro-lime rice. All the fajita flavor, none of the tortillas.",
    vegetarian: false,
    vegan: false,
    glutenFree: true,
    dairyFree: true,
    ketogenic: false,
    lowFodmap: false,
    sustainable: false,
    cuisines: ["mexican"],
    dishTypes: ["main course"],
    sourceUrl: "",
    extendedIngredients: [
      { id: 1, name: "chicken breast", amount: 1.5, unit: "lb", original: "1.5 lb chicken breast, sliced" },
      { id: 2, name: "bell peppers", amount: 3, unit: "whole", original: "3 mixed bell peppers, sliced" },
      { id: 3, name: "onion", amount: 1, unit: "whole", original: "1 large onion, sliced" },
      { id: 4, name: "fajita seasoning", amount: 2, unit: "tbsp", original: "2 tbsp fajita seasoning" },
      { id: 5, name: "cooked rice", amount: 2, unit: "cups", original: "2 cups cooked white rice" },
      { id: 6, name: "lime", amount: 1, unit: "whole", original: "1 lime, juiced" },
      { id: 7, name: "cilantro", amount: 0.25, unit: "cup", original: "1/4 cup fresh cilantro" },
    ],
    nutrition: {
      nutrients: [{ name: "Calories", amount: 440, unit: "kcal" }],
    },
  },
];
