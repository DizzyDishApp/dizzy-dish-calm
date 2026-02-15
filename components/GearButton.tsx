import React from "react";
import { Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { haptic } from "@/lib/haptics";

interface GearButtonProps {
  onPress: () => void;
}

/**
 * Settings gear icon button.
 * Haptic: light.
 */
export function GearButton({ onPress }: GearButtonProps) {
  const handlePress = () => {
    haptic.light();
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      className="w-7 h-7 items-center justify-center opacity-40"
      accessibilityRole="button"
      accessibilityLabel="Settings"
    >
      <Ionicons name="settings-outline" size={18} color={Colors.text} />
    </Pressable>
  );
}
