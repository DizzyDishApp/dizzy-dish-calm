import * as Haptics from "expo-haptics";

/**
 * Haptic feedback helpers matching the design system spec.
 * Uses expo-haptics which maps to iOS Taptic Engine and Android vibration.
 */
export const haptic = {
  /** Light — Navigation (back, gear, avatar) — 8ms equivalent */
  light: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),

  /** Medium — Heart/save toggle — 15ms equivalent */
  medium: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),

  /** Heavy — Spin button press — 25ms equivalent */
  heavy: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),

  /** Select — Toggle, filter pills — 5ms equivalent */
  select: () => Haptics.selectionAsync(),

  /** Success — Spin complete / result appears */
  success: () =>
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),

  /** Error — Error feedback */
  error: () =>
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
} as const;
