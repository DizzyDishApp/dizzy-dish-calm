import React from "react";
import { Pressable, Text } from "react-native";
import { haptic } from "@/lib/haptics";
import { LoadingDots } from "@/components/LoadingDots";

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  variant?: "warm" | "green" | "instacart";
  /** Whether to show the offset border style (social/CTA buttons) */
  bordered?: boolean;
  /** Show animated loading dots instead of label */
  loading?: boolean;
  accessibilityLabel?: string;
}

/**
 * Primary action button.
 *
 * Design spec:
 *  - warm: bg #C65D3D, text white, optional 2px border + 3px offset shadow
 *  - green: bg #5B8C6A, text white, shadow 0 4px 16px rgba(91,140,106,0.3)
 *  - instacart: bg #108910, text white, shadow 0 4px 12px rgba(16,137,16,0.25)
 *  - Border radius: 50px
 *  - Font: 14px Bold 700, uppercase for bordered variant
 */
export function PrimaryButton({
  label,
  onPress,
  variant = "warm",
  bordered = false,
  loading = false,
  accessibilityLabel,
}: PrimaryButtonProps) {
  const handlePress = () => {
    haptic.medium();
    onPress();
  };

  const bgColor = {
    warm: "bg-warm",
    green: "bg-green",
    instacart: "bg-instacart",
  }[variant];

  const shadowStyle = {
    warm: {
      shadowColor: "#C65D3D",
      shadowOffset: { width: bordered ? 3 : 0, height: bordered ? 3 : 4 },
      shadowOpacity: bordered ? 0.1 : 0.3,
      shadowRadius: bordered ? 0 : 8,
      elevation: 6,
    },
    green: {
      shadowColor: "#5B8C6A",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
    instacart: {
      shadowColor: "#108910",
      shadowOffset: { width: bordered ? 3 : 0, height: bordered ? 3 : 4 },
      shadowOpacity: 0.25,
      shadowRadius: bordered ? 0 : 6,
      elevation: 6,
    },
  }[variant];

  return (
    <Pressable
      onPress={loading ? undefined : handlePress}
      className={`py-3.5 rounded-btn items-center justify-center ${bgColor} ${
        bordered ? "border-2 border-txt" : ""
      }`}
      style={[shadowStyle, loading ? { opacity: 0.85 } : undefined]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ busy: loading }}
    >
      {loading ? (
        <LoadingDots />
      ) : (
        <Text
          className={`font-body-bold text-sm text-white ${
            bordered ? "uppercase tracking-wider" : ""
          }`}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}
