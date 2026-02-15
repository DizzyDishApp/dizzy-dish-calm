import React from "react";
import { View, Pressable, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/colors";
import { haptic } from "@/lib/haptics";

interface HeaderBarProps {
  title?: string;
  titleStyle?: "display" | "subtitle";
  showBack?: boolean;
  right?: React.ReactNode;
}

/**
 * Shared header bar used across screens.
 */
export function HeaderBar({
  title,
  titleStyle = "display",
  showBack = false,
  right,
}: HeaderBarProps) {
  const router = useRouter();

  const handleBack = () => {
    haptic.light();
    router.back();
  };

  const titleClass =
    titleStyle === "subtitle"
      ? "font-display-bold-italic text-sm text-warm italic"
      : "font-display text-lg text-txt";

  return (
    <View className="flex-row items-center justify-between px-xl py-1">
      {showBack ? (
        <Pressable
          onPress={handleBack}
          className="w-7 h-7 items-center justify-center opacity-40"
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={16} color={Colors.text} />
        </Pressable>
      ) : (
        <View className="w-7" />
      )}
      {title ? (
        <Text className={titleClass}>{title}</Text>
      ) : (
        <View />
      )}
      {right ?? <View className="w-7" />}
    </View>
  );
}
