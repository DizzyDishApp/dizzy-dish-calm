import React from "react";
import { Pressable, Text } from "react-native";
import { haptic } from "@/lib/haptics";

interface SecondaryButtonProps {
  label: string;
  onPress: () => void;
  variant?: "cream" | "warmPale" | "ghost";
  accessibilityLabel?: string;
}

/**
 * Secondary button variants.
 *
 * Design spec:
 *  - cream: bg #F5EDE5, text #8C857D (shortcut pills)
 *  - warmPale: bg #FDF0EB, text #C65D3D (secondary action)
 *  - ghost: transparent + 1.5px border #E8E3DD, text #8C857D
 *  - Border radius: 50px
 *  - Font: 12px Medium 500
 */
export function SecondaryButton({
  label,
  onPress,
  variant = "cream",
  accessibilityLabel,
}: SecondaryButtonProps) {
  const handlePress = () => {
    haptic.light();
    onPress();
  };

  const classes = {
    cream: "bg-cream",
    warmPale: "bg-warm-pale",
    ghost: "bg-transparent border-[1.5px] border-border",
  }[variant];

  const textClasses = {
    cream: "text-txt-soft",
    warmPale: "text-warm",
    ghost: "text-txt-soft",
  }[variant];

  return (
    <Pressable
      onPress={handlePress}
      className={`py-3 rounded-btn items-center justify-center ${classes}`}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
    >
      <Text className={`font-body-medium text-xs ${textClasses}`}>
        {label}
      </Text>
    </Pressable>
  );
}
