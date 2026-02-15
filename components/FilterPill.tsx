import React from "react";
import { Pressable, Text } from "react-native";
import { haptic } from "@/lib/haptics";

interface FilterPillProps {
  label: string;
  active: boolean;
  onPress: () => void;
}

/**
 * Filter pill component.
 *
 * Design spec:
 *  - Off: transparent bg + 1.5px border (#E8E3DD), text #8C857D
 *  - On: warm fill (#C65D3D) + warm border, white text
 *  - Border radius: 20px (pill)
 *  - Font: 12px Medium 500
 *  - Haptic: select
 */
export function FilterPill({ label, active, onPress }: FilterPillProps) {
  const handlePress = () => {
    haptic.select();
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      className={`px-3.5 py-2 rounded-pill border-[1.5px] ${
        active
          ? "bg-warm border-warm"
          : "bg-transparent border-border"
      }`}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={`${label} filter`}
    >
      <Text
        className={`font-body-medium text-xs ${
          active ? "text-white" : "text-txt-soft"
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}
