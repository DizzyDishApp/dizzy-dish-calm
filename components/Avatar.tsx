import React from "react";
import { Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { haptic } from "@/lib/haptics";

interface AvatarProps {
  size?: "small" | "large";
  onPress?: () => void;
}

/**
 * Avatar component.
 *
 * Design spec:
 *  - small (nav): 38px, gradient bg, 2px border
 *  - large (account): 80px, gradient bg, 2.5px border
 *  - Gradient: #E8BBA8 -> #F5EDE5 (simulated with warmLight bg)
 *  - Shadow: 0 2px 8px rgba(0,0,0,0.08)
 */
export function Avatar({ size = "small", onPress }: AvatarProps) {
  const isSmall = size === "small";
  const dimension = isSmall ? 38 : 80;
  const iconSize = isSmall ? 18 : 32;
  const borderWidth = isSmall ? 2 : 2.5;

  const content = (
    <View
      className="items-center justify-center rounded-full bg-warm-light"
      style={{
        width: dimension,
        height: dimension,
        borderWidth,
        borderColor: Colors.border,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      <Ionicons
        name="person-outline"
        size={iconSize}
        color={Colors.textSoft}
      />
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={() => {
          haptic.light();
          onPress();
        }}
        accessibilityRole="button"
        accessibilityLabel="Account"
      >
        {content}
      </Pressable>
    );
  }

  return content;
}
