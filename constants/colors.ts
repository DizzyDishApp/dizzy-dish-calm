/**
 * Dizzy Dish "Exhale" color palette.
 * Matches the design system SVG spec.
 */
export const Colors = {
  // Primary
  bg: "#FAF6F1",
  card: "#FFFFFF",
  cream: "#F5EDE5",
  warm: "#C65D3D",
  warmLight: "#E8BBA8",
  warmPale: "#FDF0EB",
  warmDark: "#B04E32",

  // Functional
  green: "#5B8C6A",
  greenLight: "#E4EFE7",
  instacart: "#108910",

  // Text
  text: "#2D2A26",
  textSoft: "#8C857D",
  textLight: "#B8B2AA",

  // Border
  border: "#E8E3DD",

  // Social brand colors
  google: "#EA4335",
  facebook: "#1877F2",
  apple: "#2D2A26",
} as const;

export type ColorKey = keyof typeof Colors;
