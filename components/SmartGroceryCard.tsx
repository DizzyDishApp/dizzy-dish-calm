import React from "react";
import { View, Text } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import type { SharedIngredient } from "@/types";

interface SmartGroceryCardProps {
  sharedIngredients: SharedIngredient[];
  totalItems: number;
  reducedItems: number;
}

/**
 * Smart grocery list callout card shown in weekly plan results.
 * Shows shared ingredients that reduce the total grocery list.
 */
export function SmartGroceryCard({
  sharedIngredients,
  totalItems,
  reducedItems,
}: SmartGroceryCardProps) {
  return (
    <Animated.View
      entering={FadeInDown.delay(800).duration(400).springify()}
      className="mt-3.5 p-3.5 rounded-card bg-green-light border border-green/20"
    >
      <Text className="font-body-bold text-[11px] text-green mb-1">
        Smart Grocery List
      </Text>
      <Text className="font-body text-[11px] text-txt-soft leading-relaxed">
        Recipes share garlic, soy sauce, honey, rice, and chicken — reducing
        your grocery list from {totalItems} to {reducedItems} items.
      </Text>
      <View className="flex-row flex-wrap gap-1 mt-2">
        {sharedIngredients.map((item) => (
          <View
            key={item.name}
            className="px-2 py-[3px] rounded-[10px] bg-card"
          >
            <Text className="font-body-semibold text-[9px] text-green">
              {item.name} x{item.count}
            </Text>
          </View>
        ))}
      </View>
    </Animated.View>
  );
}
