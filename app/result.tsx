import React, { useState, useCallback } from "react";
import { View, Text, ScrollView, Pressable, Linking } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQueryClient } from "@tanstack/react-query";
import { HeaderBar } from "@/components/HeaderBar";
import { HeartButton } from "@/components/HeartButton";
import { MetaPill } from "@/components/MetaPill";
import { TagChip } from "@/components/TagChip";
import { ConfettiEmoji } from "@/components/ConfettiEmoji";
import { PrimaryButton } from "@/components/PrimaryButton";
import { SecondaryButton } from "@/components/SecondaryButton";
import { useSaveRecipe, useUnsaveRecipe } from "@/hooks/useSavedRecipes";
import { useAuth } from "@/context/AuthContext";
import { useAuthRedirect } from "@/context/AuthRedirectContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useUI } from "@/context/UIContext";
import { haptic } from "@/lib/haptics";
import { queryKeys } from "@/lib/queryKeys";
import type { Recipe } from "@/types";

const FALLBACK_RECIPE: Recipe = {
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

/**
 * Result screen — shown after a single recipe spin.
 *
 * Reads the recipe from the React Query cache using the recipeId param
 * passed from index.tsx. The cache is pre-populated by useSpinRecipe's
 * onSuccess handler before navigation occurs.
 *
 * Design spec:
 *  - slideUp entrance: 0.5s cubic-bezier(0.2,0.8,0.2,1)
 *  - Staggered gentleUp for content sections
 *  - Confetti emojis float up on result
 *
 * Server state: RQ cache (recipe detail), useSaveRecipe
 * Client state: local saved toggle, PreferencesContext (isPro for calorie upsell)
 */
export default function ResultScreen() {
  const router = useRouter();
  const { recipeId } = useLocalSearchParams<{ recipeId: string }>();
  const queryClient = useQueryClient();
  const { state: auth } = useAuth();
  const { data: userProfile } = useUserProfile();
  const { setSnapshot } = useAuthRedirect();
  const { setSpinning } = useUI();
  const saveMutation = useSaveRecipe();
  const unsaveMutation = useUnsaveRecipe();
  const [saved, setSaved] = useState(false);

  // Read the recipe from the RQ cache — pre-populated by useSpinRecipe's onSuccess
  const cachedRecipe = recipeId
    ? queryClient.getQueryData<Recipe>(queryKeys.recipes.detail(recipeId))
    : undefined;
  const recipe: Recipe = cachedRecipe ?? FALLBACK_RECIPE;

  if (__DEV__) {
    console.log('[result.tsx] recipeId from params:', recipeId);
    console.log('[result.tsx] cachedRecipe:', cachedRecipe?.name ?? 'NOT IN CACHE (showing fallback)');
    console.log('[result.tsx] recipe.name:', recipe.name);
  }

  const handleToggleSave = useCallback(() => {
    haptic.medium();

    // If not authenticated, redirect to auth with a pending save action
    if (!auth.isAuthenticated && !saved) {
      setSnapshot("/result", {
        type: "save_recipe",
        payload: { recipeId: recipe.id, recipe },
      });
      router.push("/(modal)/account");
      return;
    }

    if (saved) {
      unsaveMutation.mutate(recipe.id);
    } else {
      saveMutation.mutate({ recipeId: recipe.id, recipe });
    }
    setSaved(!saved);
  }, [saved, recipe, saveMutation, unsaveMutation, auth.isAuthenticated, setSnapshot, router]);

  const handleSpinAgain = useCallback(() => {
    router.back();
  }, [router]);

  const handleViewRecipe = useCallback(() => {
    if (recipe.sourceUrl) {
      Linking.openURL(recipe.sourceUrl);
    }
  }, [recipe.sourceUrl]);

  const showCalorieUpsell = recipe.calories === "—" && !(userProfile?.isPro ?? false);

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top"]}>
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
          contentContainerStyle={{ paddingBottom: 60 }}
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
            {showCalorieUpsell ? (
              <Pressable
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onPress={() => router.push("/(modal)/paywall" as any)}
                accessibilityRole="button"
                accessibilityLabel="Upgrade to Pro to see calorie information"
              >
                <MetaPill label="🔒 Pro" />
              </Pressable>
            ) : (
              <MetaPill label={recipe.calories} />
            )}
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
            label={
              recipe.ingredients?.length
                ? `Order ${recipe.ingredients.length} Ingredients`
                : "Order Ingredients"
            }
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
                onPress={handleViewRecipe}
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
    </SafeAreaView>
  );
}
