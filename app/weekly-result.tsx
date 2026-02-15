import React, { useCallback } from "react";
import { View, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import Animated, { SlideInDown, FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { HeaderBar } from "@/components/HeaderBar";
import { WeeklyDayRow } from "@/components/WeeklyDayRow";
import { SmartGroceryCard } from "@/components/SmartGroceryCard";
import { PrimaryButton } from "@/components/PrimaryButton";
import { SecondaryButton } from "@/components/SecondaryButton";
import { useSpinWeeklyPlan } from "@/hooks/useSpinRecipe";
import type { WeeklyPlan } from "@/types";

/**
 * Weekly result screen — shows the 7-day meal plan after a weekly spin.
 *
 * Server state: useSpinWeeklyPlan (data from last mutation)
 */
export default function WeeklyResultScreen() {
  const router = useRouter();
  const spinWeeklyPlan = useSpinWeeklyPlan();

  // Use data from the last weekly spin mutation, or fallback
  const plan: WeeklyPlan = spinWeeklyPlan.data ?? {
    id: "wp-1",
    days: [
      { day: "Monday", recipe: { id: "1", name: "Honey Garlic Salmon", time: "25 min", calories: "420 cal", servings: "4", description: "", tags: [], emoji: "\u{1F363}" } },
      { day: "Tuesday", recipe: { id: "5", name: "Garlic Butter Shrimp Pasta", time: "20 min", calories: "460 cal", servings: "4", description: "", tags: [], emoji: "\u{1F364}" } },
      { day: "Wednesday", recipe: { id: "6", name: "Chicken Stir Fry", time: "25 min", calories: "390 cal", servings: "4", description: "", tags: [], emoji: "\u{1F357}" } },
      { day: "Thursday", recipe: { id: "7", name: "Garlic Chicken Tacos", time: "20 min", calories: "410 cal", servings: "4", description: "", tags: [], emoji: "\u{1F32E}" } },
      { day: "Friday", recipe: { id: "8", name: "Salmon Rice Bowls", time: "15 min", calories: "380 cal", servings: "4", description: "", tags: [], emoji: "\u{1F371}" } },
      { day: "Saturday", recipe: { id: "9", name: "Honey Soy Chicken", time: "35 min", calories: "450 cal", servings: "4", description: "", tags: [], emoji: "\u{1F357}" } },
      { day: "Sunday", recipe: { id: "10", name: "Shrimp Fried Rice", time: "20 min", calories: "410 cal", servings: "4", description: "", tags: [], emoji: "\u{1F35A}" } },
    ],
    sharedIngredients: [
      { name: "Garlic", count: 7 },
      { name: "Soy Sauce", count: 5 },
      { name: "Honey", count: 3 },
      { name: "Jasmine Rice", count: 4 },
      { name: "Chicken", count: 3 },
    ],
    totalItems: 42,
    reducedItems: 28,
  };

  const handleSpinAgain = useCallback(() => {
    router.back();
  }, [router]);

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top"]}>
      <Animated.View
        entering={SlideInDown.duration(500).springify()}
        className="flex-1"
      >
        {/* Header */}
        <HeaderBar
          title="this week's plan"
          titleStyle="subtitle"
          showBack
        />

        <ScrollView
          className="flex-1 px-xl"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {plan.days.map((day, i) => (
            <WeeklyDayRow
              key={day.day}
              day={day}
              index={i}
              isLast={i === plan.days.length - 1}
            />
          ))}

          {/* Smart grocery callout */}
          <SmartGroceryCard
            sharedIngredients={plan.sharedIngredients}
            totalItems={plan.totalItems}
            reducedItems={plan.reducedItems}
          />
        </ScrollView>

        {/* Bottom actions */}
        <Animated.View
          entering={FadeInDown.delay(600).duration(400).springify()}
          className="px-xl pb-5 pt-2 gap-2"
        >
          <PrimaryButton
            label={`Order ${plan.reducedItems} Items via Instacart`}
            variant="green"
            onPress={() => {
              // MIGRATION NOTE: Navigate to Instacart order
            }}
          />
          <SecondaryButton
            label="Spin Again"
            variant="warmPale"
            onPress={handleSpinAgain}
          />
        </Animated.View>
      </Animated.View>
    </SafeAreaView>
  );
}
