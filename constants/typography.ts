/**
 * Typography constants matching the design system.
 *
 * Display: Fraunces (serif, warm, characterful)
 * Body: Plus Jakarta Sans (sans-serif, clean, modern, warm)
 *
 * Font families are loaded via expo-font and referenced in tailwind.config.js.
 * Use NativeWind className props (font-display, font-body, etc.) for styling.
 */

export const FontSizes = {
  // Display / Fraunces
  h1: 26,
  h2: 18,
  subtitle: 14,
  buttonHero: 18,

  // Body / Plus Jakarta Sans
  recipeTitle: 14,
  body: 13,
  sectionLabel: 11,
  pillLabel: 12,
  meta: 11,
  legal: 9,
} as const;

export const FontWeights = {
  light: "300",
  regular: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
  extrabold: "800",
} as const;

export const LineHeights = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.6,
} as const;

export const LetterSpacing = {
  tight: 0.01,
  normal: 0.02,
  wide: 0.04,
  wider: 0.06,
  widest: 0.08,
} as const;
