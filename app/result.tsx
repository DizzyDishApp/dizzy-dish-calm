import React, { useState, useCallback } from "react";
import { View, Text, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import Animated, { FadeInDown, SlideInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { HeaderBar } from "@/components/HeaderBar";
import { HeartButton } from "@/components/HeartButton";
import { MetaPill } from "@/components/MetaPill";
import { TagChip } from "@/components/TagChip";
import { ConfettiEmoji } from "@/components/ConfettiEmoji";
import { PrimaryButton } from "@/components/PrimaryButton";
import { SecondaryButton } from "@/components/SecondaryButton";
import { useSpinRecipe } from "@/hooks/useSpinRecipe";
import { useSaveRecipe, useUnsaveRecipe } from "@/hooks/useSavedRecipes";
import { useUI } from "@/context/UIContext";
import { haptic } from "@/lib/haptics";
import type { Recipe } from "@/types";

/**
 * Result screen — shown after a single recipe spin.
 *
 * Design spec:
 *  - slideUp entrance: 0.5s cubic-bezier(0.2,0.8,0.2,1)
 *  - Staggered gentleUp for content sections
 *  - Confetti emojis float up on result
 *
 * Server state: useSpinRecipe (data from last mutation), useSaveRecipe
 * Client state: local saved toggle
 */
export default function ResultScreen() {
  const router = useRouter();
  const { setSpinning } = useUI();
  const spinRecipe = useSpinRecipe();
  const saveMutation = useSaveRecipe();
  const unsaveMutation = useUnsaveRecipe();
  const [saved, setSaved] = useState(false);

  // Use data from the last spin mutation, or fallback
  const recipe: Recipe = spinRecipe.data ?? {
    id: "1",
    name: "Honey Garlic Salmon",
    time: "25 min",
    calories: "420 cal",
    servings: "4 servings",
    description:
      "Pan-seared salmon glazed with honey, garlic, and soy sauce. Served over jasmine rice with steamed broccoli.",
    tags: ["Gluten Free", "Under 30 Min", "High Protein"],
    emoji: "\u{1F363}",
  };

  const handleToggleSave = useCallback(() => {
    haptic.medium();
    if (saved) {
      unsaveMutation.mutate(recipe.id);
    } else {
      saveMutation.mutate({ recipeId: recipe.id, recipe });
    }
    setSaved(!saved);
  }, [saved, recipe, saveMutation, unsaveMutation]);

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
          title="tonight's pick"
          titleStyle="subtitle"
          showBack
          right={<HeartButton filled={saved} onPress={handleToggleSave} />}
        />

        <ScrollView
          className="flex-1 px-xl"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {/* Recipe image placeholder */}
          <Animated.View
            entering={FadeInDown.delay(100).duration(400).springify()}
            className="w-full h-[180px] rounded-[20px] mt-3 bg-warm-pale items-center justify-center"
          >
            <Text className="text-[56px]">{recipe.emoji}</Text>
          </Animated.View>

          {/* Recipe name */}
          <Animated.View
            entering={FadeInDown.delay(200).duration(400).springify()}
          >
            <Text className="font-display text-2xl text-txt mt-5 leading-tight">
              {recipe.name}
            </Text>
          </Animated.View>

          {/* Meta pills */}
          <Animated.View
            entering={FadeInDown.delay(300).duration(400).springify()}
            className="flex-row flex-wrap gap-2 mt-3"
          >
            <MetaPill label={recipe.time} />
            <MetaPill label={recipe.calories} />
            <MetaPill label={recipe.servings} />
          </Animated.View>

          {/* Description */}
          <Animated.View
            entering={FadeInDown.delay(400).duration(400).springify()}
          >
            <Text className="font-body text-[13px] text-txt-soft leading-relaxed mt-4">
              {recipe.description}
            </Text>
          </Animated.View>

          {/* Tags */}
          <Animated.View
            entering={FadeInDown.delay(500).duration(400).springify()}
            className="flex-row flex-wrap gap-1.5 mt-4"
          >
            {recipe.tags.map((tag) => (
              <TagChip key={tag} label={tag} />
            ))}
          </Animated.View>

          {/* Confetti */}
          <ConfettiEmoji />
        </ScrollView>

        {/* Bottom actions */}
        <Animated.View
          entering={FadeInDown.delay(600).duration(400).springify()}
          className="px-xl pb-5 pt-3 gap-2"
        >
          <PrimaryButton
            label="Order Ingredients"
            variant="green"
            onPress={() => {
              // MIGRATION NOTE: Navigate to Instacart order flow
            }}
          />
          <View className="flex-row gap-2">
            <View className="flex-1">
              <SecondaryButton
                label="View Recipe"
                variant="cream"
                onPress={() => {
                  // MIGRATION NOTE: Navigate to full recipe detail
                }}
              />
            </View>
            <View className="flex-1">
              <SecondaryButton
                label="Spin Again"
                variant="warmPale"
                onPress={handleSpinAgain}
              />
            </View>
          </View>
        </Animated.View>
      </Animated.View>
    </SafeAreaView>
  );
}
