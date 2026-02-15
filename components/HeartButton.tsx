import React from "react";
import { Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { haptic } from "@/lib/haptics";

interface HeartButtonProps {
  filled: boolean;
  onPress: () => void;
}

/**
 * Heart/save toggle button.
 *
 * Haptic: medium on press.
 */
export function HeartButton({ filled, onPress }: HeartButtonProps) {
  const handlePress = () => {
    haptic.medium();
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={filled ? "Unsave recipe" : "Save recipe"}
      accessibilityState={{ selected: filled }}
    >
      <Ionicons
        name={filled ? "heart" : "heart-outline"}
        size={18}
        color={Colors.warm}
      />
    </Pressable>
  );
}
