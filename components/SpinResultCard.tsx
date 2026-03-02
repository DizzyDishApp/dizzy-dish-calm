import React from "react";
import { View, Text } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { HeartButton } from "@/components/HeartButton";
import { MetaPill } from "@/components/MetaPill";
import { PrimaryButton } from "@/components/PrimaryButton";
import { SecondaryButton } from "@/components/SecondaryButton";
import { Colors } from "@/constants/colors";
import type { Recipe, WeeklyPlan } from "@/types";

type SpinResultData =
  | { type: "recipe"; data: Recipe }
  | { type: "plan"; data: WeeklyPlan };

interface SpinResultCardProps {
  result: SpinResultData;
  saved?: boolean;
  onToggleSave?: () => void;
  onViewFullRecipe: () => void;
  onSpinAgain: () => void;
}

/**
 * Compact summary card shown inline on the home screen after a spin.
 *
 * Two variants:
 *  - recipe: emoji, title + heart, divider, meta pills, view/spin buttons
 *  - plan: calendar icon + heading, 3 day previews, view/spin buttons
 *
 * Entrance: FadeInDown.duration(400).springify()
 */
export function SpinResultCard({
  result,
  saved = false,
  onToggleSave,
  onViewFullRecipe,
  onSpinAgain,
}: SpinResultCardProps) {
  if (result.type === "recipe") {
    return <RecipeVariant recipe={result.data} saved={saved} onToggleSave={onToggleSave} onViewFullRecipe={onViewFullRecipe} onSpinAgain={onSpinAgain} />;
  }
  return <PlanVariant plan={result.data} onViewFullRecipe={onViewFullRecipe} onSpinAgain={onSpinAgain} />;
}

function RecipeVariant({
  recipe,
  saved,
  onToggleSave,
  onViewFullRecipe,
  onSpinAgain,
}: {
  recipe: Recipe;
  saved: boolean;
  onToggleSave?: () => void;
  onViewFullRecipe: () => void;
  onSpinAgain: () => void;
}) {
  const pills: string[] = [];
  if (recipe.time) pills.push(recipe.time);
  if (recipe.calories && recipe.calories !== "—") pills.push(recipe.calories);
  if (recipe.servings) pills.push(recipe.servings);

  return (
    <Animated.View
      entering={FadeInDown.duration(400).springify()}
      className="bg-card rounded-card p-lg"
      style={{
        width: "100%",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
      }}
    >
      {/* Emoji + title + heart */}
      <View className="flex-row items-center gap-md">
        <Text style={{ fontSize: 32 }}>{recipe.emoji}</Text>
        <View className="flex-1">
          <Text className="font-display text-[18px] text-txt" numberOfLines={2}>
            {recipe.name}
          </Text>
        </View>
        {onToggleSave && (
          <HeartButton filled={saved} onPress={onToggleSave} />
        )}
      </View>

      {/* Divider */}
      <View className="h-px bg-border my-md" />

      {/* Meta pills */}
      {pills.length > 0 && (
        <View className="flex-row flex-wrap gap-sm mb-lg">
          {pills.map((pill) => (
            <MetaPill key={pill} label={pill} />
          ))}
        </View>
      )}

      {/* Buttons */}
      <View className="gap-sm">
        <PrimaryButton
          label="View full recipe"
          onPress={onViewFullRecipe}
          accessibilityLabel="View full recipe details"
        />
        <SecondaryButton
          label="Spin again"
          onPress={onSpinAgain}
          variant="ghost"
          accessibilityLabel="Spin for another recipe"
        />
      </View>
    </Animated.View>
  );
}

function PlanVariant({
  plan,
  onViewFullRecipe,
  onSpinAgain,
}: {
  plan: WeeklyPlan;
  onViewFullRecipe: () => void;
  onSpinAgain: () => void;
}) {
  const previewDays = plan.days.slice(0, 3);
  const remaining = plan.days.length - 3;

  return (
    <Animated.View
      entering={FadeInDown.duration(400).springify()}
      className="bg-card rounded-card p-lg"
      style={{
        width: "100%",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
      }}
    >
      {/* Header */}
      <View className="flex-row items-center gap-md mb-md">
        <Ionicons name="calendar-outline" size={24} color={Colors.warm} />
        <Text className="font-display text-[18px] text-txt">
          Your 7-day plan is ready
        </Text>
      </View>

      {/* Day previews */}
      <View className="gap-sm mb-lg">
        {previewDays.map((dayEntry) => (
          <View key={dayEntry.day} className="flex-row items-center gap-sm">
            <Text className="font-body-semibold text-[11px] text-txt-soft w-[32px]">
              {dayEntry.day.slice(0, 3)}
            </Text>
            <Text style={{ fontSize: 16 }}>{dayEntry.recipe.emoji}</Text>
            <Text className="font-body text-[13px] text-txt flex-1" numberOfLines={1}>
              {dayEntry.recipe.name}
            </Text>
          </View>
        ))}
        {remaining > 0 && (
          <Text className="font-body text-[11px] text-txt-soft ml-[32px]">
            +{remaining} more
          </Text>
        )}
      </View>

      {/* Buttons */}
      <View className="gap-sm">
        <PrimaryButton
          label="View full plan"
          onPress={onViewFullRecipe}
          accessibilityLabel="View full weekly plan"
        />
        <SecondaryButton
          label="Spin again"
          onPress={onSpinAgain}
          variant="ghost"
          accessibilityLabel="Spin for another plan"
        />
      </View>
    </Animated.View>
  );
}
