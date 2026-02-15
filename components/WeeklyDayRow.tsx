import React from "react";
import { View, Text, Pressable } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import type { WeeklyPlanDay } from "@/types";

interface WeeklyDayRowProps {
  day: WeeklyPlanDay;
  index: number;
  isLast: boolean;
  onPress?: () => void;
}

/**
 * A single day row in the weekly plan result.
 * Features staggered entrance animation.
 */
export function WeeklyDayRow({
  day,
  index,
  isLast,
  onPress,
}: WeeklyDayRowProps) {
  return (
    <Animated.View
      entering={FadeInDown.delay(200 + index * 70)
        .duration(300)
        .springify()}
    >
      <Pressable
        onPress={onPress}
        className="flex-row items-center gap-3 py-[11px]"
        style={
          !isLast
            ? { borderBottomWidth: 1, borderBottomColor: "#E8E3DD" }
            : undefined
        }
        accessibilityRole="button"
        accessibilityLabel={`${day.day}: ${day.recipe.name}`}
      >
        {/* Emoji */}
        <View className="w-[42px] h-[42px] rounded-input bg-cream items-center justify-center">
          <Text className="text-xl">{day.recipe.emoji}</Text>
        </View>
        {/* Info */}
        <View className="flex-1 min-w-0">
          <Text className="font-body-bold text-[10px] text-warm tracking-widest uppercase">
            {day.day}
          </Text>
          <Text
            className="font-body-semibold text-[13px] text-txt mt-[1px]"
            numberOfLines={1}
          >
            {day.recipe.name}
          </Text>
        </View>
        {/* Time */}
        <Text className="font-body text-[10px] text-txt-light">
          {day.recipe.time}
        </Text>
      </Pressable>
    </Animated.View>
  );
}
