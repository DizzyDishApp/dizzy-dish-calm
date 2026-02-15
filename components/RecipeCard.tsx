import React from "react";
import { View, Text, Pressable } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { HeartButton } from "./HeartButton";
import type { Recipe } from "@/types";

interface RecipeCardProps {
  recipe: Recipe;
  index: number;
  saved?: boolean;
  onPress?: () => void;
  onToggleSave?: () => void;
}

/**
 * Recipe list item used in saved recipes screen.
 *
 * Features staggered gentleUp entrance animation using Reanimated FadeInDown.
 */
export function RecipeCard({
  recipe,
  index,
  saved = false,
  onPress,
  onToggleSave,
}: RecipeCardProps) {
  return (
    <Animated.View
      entering={FadeInDown.delay(index * 100)
        .duration(300)
        .springify()}
    >
      <Pressable
        onPress={onPress}
        className="flex-row items-center gap-3.5 py-3.5"
        style={{
          borderBottomWidth: 1,
          borderBottomColor: "#E8E3DD",
        }}
        accessibilityRole="button"
        accessibilityLabel={recipe.name}
      >
        {/* Emoji thumbnail */}
        <View className="w-12 h-12 rounded-card bg-cream items-center justify-center">
          <Text className="text-[22px]">{recipe.emoji}</Text>
        </View>
        {/* Info */}
        <View className="flex-1">
          <Text
            className="font-body-semibold text-sm text-txt"
            numberOfLines={1}
          >
            {recipe.name}
          </Text>
          <Text className="font-body text-[11px] text-txt-light mt-0.5">
            {recipe.time}
          </Text>
        </View>
        {/* Heart */}
        {onToggleSave && (
          <HeartButton filled={saved} onPress={onToggleSave} />
        )}
      </Pressable>
    </Animated.View>
  );
}
