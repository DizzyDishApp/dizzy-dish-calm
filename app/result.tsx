import React, { useState, useCallback, useEffect, useRef } from "react";
import { View, Text, ScrollView, Pressable, Linking } from "react-native";
import { Image } from "expo-image";
import { useRouter, useLocalSearchParams } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQueryClient } from "@tanstack/react-query";
import { useKeepAwake } from "expo-keep-awake";
import { Ionicons } from "@expo/vector-icons";
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
import { haptic } from "@/lib/haptics";
import { queryKeys } from "@/lib/queryKeys";
import { Colors } from "@/constants/colors";
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
 * Result screen — shown after a single recipe spin or tapping a saved recipe.
 *
 * Displays full recipe details: ingredients (with tap-to-check), instructions
 * with per-step timers, and an Instacart order section.
 *
 * Keeps the screen awake via expo-keep-awake so the user can cook hands-free.
 */
export default function ResultScreen() {
  useKeepAwake();

  const router = useRouter();
  const { recipeId } = useLocalSearchParams<{ recipeId: string }>();
  const queryClient = useQueryClient();
  const { state: auth } = useAuth();
  const { data: userProfile } = useUserProfile();
  const { setSnapshot } = useAuthRedirect();
  const saveMutation = useSaveRecipe();
  const unsaveMutation = useUnsaveRecipe();
  const [saved, setSaved] = useState(false);

  // Read the recipe from the RQ cache — pre-populated by useSpinRecipe or saved.tsx
  const cachedRecipe = recipeId
    ? queryClient.getQueryData<Recipe>(queryKeys.recipes.detail(recipeId))
    : undefined;
  const recipe: Recipe = cachedRecipe ?? FALLBACK_RECIPE;

  if (__DEV__) {
    console.log("[result.tsx] recipeId:", recipeId);
    console.log("[result.tsx] recipe:", cachedRecipe?.name ?? "NOT IN CACHE");
  }

  // ── Ingredient checklist ──
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(
    new Set()
  );
  const toggleIngredient = useCallback((id: number) => {
    haptic.select();
    setCheckedIngredients((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // ── Per-step timers ──
  const [activeStepTimer, setActiveStepTimer] = useState<number | null>(null);
  const [stepTimeLeft, setStepTimeLeft] = useState(0);
  const [stepTimerRunning, setStepTimerRunning] = useState(false);
  const stepIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (stepTimerRunning) {
      stepIntervalRef.current = setInterval(() => {
        setStepTimeLeft((prev) => {
          if (prev <= 1) {
            setStepTimerRunning(false);
            haptic.success();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (stepIntervalRef.current) clearInterval(stepIntervalRef.current);
    }
    return () => {
      if (stepIntervalRef.current) clearInterval(stepIntervalRef.current);
    };
  }, [stepTimerRunning]);

  const openStepTimer = useCallback((index: number, seconds: number) => {
    haptic.light();
    setStepTimerRunning(false);
    setActiveStepTimer(index);
    setStepTimeLeft(seconds);
  }, []);

  const toggleStepTimer = useCallback(() => {
    haptic.light();
    setStepTimerRunning((prev) => !prev);
  }, []);

  const stepTimerMins = Math.floor(stepTimeLeft / 60);
  const stepTimerSecs = stepTimeLeft % 60;
  const stepTimerDisplay = `${String(stepTimerMins).padStart(2, "0")}:${String(stepTimerSecs).padStart(2, "0")}`;

  // ── Save/unsave ──
  const handleToggleSave = useCallback(() => {
    haptic.medium();

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

  const showCalorieUpsell = recipe.calories === "—" && !(userProfile?.isPro ?? false);

  // Dynamic Instacart count — only unchecked ingredients
  const orderableIngredients = recipe.ingredients?.filter(
    (ing) => !checkedIngredients.has(ing.id)
  ) ?? [];

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top"]}>
      <HeaderBar
        title="tonight's pick"
        titleStyle="subtitle"
        showBack
        right={<HeartButton filled={saved} onPress={handleToggleSave} />}
      />

      <ScrollView
        className="flex-1 px-xl"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {/* Hero image or emoji fallback */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(400).springify()}
          className="w-full rounded-[20px] mt-3 overflow-hidden bg-warm-pale items-center justify-center"
          style={{ height: recipe.imageUrl ? 220 : 180 }}
        >
          {recipe.imageUrl ? (
            <Image
              source={{ uri: recipe.imageUrl }}
              style={{ width: "100%", height: 220 }}
              contentFit="cover"
              transition={300}
              accessibilityLabel={`Photo of ${recipe.name}`}
            />
          ) : (
            <Text className="text-[56px]">{recipe.emoji}</Text>
          )}
        </Animated.View>

        {/* Recipe name */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(400).springify()}
        >
          <Text className="font-display text-2xl text-txt mt-5 leading-tight">
            {recipe.name}
          </Text>
        </Animated.View>

        {/* Rating */}
        {recipe.rating != null && (
          <Animated.View
            entering={FadeInDown.delay(250).duration(400).springify()}
            className="flex-row items-center gap-1.5 mt-2"
          >
            <Ionicons name="star" size={13} color={Colors.warm} />
            <Text className="font-body-medium text-[12px] text-warm">
              {recipe.rating}
            </Text>
            <Text className="font-body text-[12px] text-txt-light">/ 100</Text>
          </Animated.View>
        )}

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

        {/* Ingredients + Instacart */}
        {recipe.ingredients?.length ? (
          <Animated.View
            entering={FadeInDown.delay(550).duration(400).springify()}
            className="mt-7"
          >
            <Text className="font-body-bold text-[11px] text-txt-light tracking-widest uppercase mb-3">
              Ingredients
            </Text>
            {recipe.ingredients.map((ingredient) => {
              const isChecked = checkedIngredients.has(ingredient.id);
              return (
                <Pressable
                  key={ingredient.id}
                  onPress={() => toggleIngredient(ingredient.id)}
                  className="flex-row items-center gap-3 py-2.5 border-b border-border"
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: isChecked }}
                  accessibilityLabel={ingredient.original}
                >
                  <View
                    className={`w-5 h-5 rounded-full border-[1.5px] items-center justify-center ${
                      isChecked ? "bg-green border-green" : "border-txt-light"
                    }`}
                  >
                    {isChecked && (
                      <Ionicons name="checkmark" size={12} color="white" />
                    )}
                  </View>
                  <Text
                    className={`font-body text-[13px] flex-1 ${
                      isChecked ? "text-txt-light" : "text-txt"
                    }`}
                    style={
                      isChecked ? { textDecorationLine: "line-through" } : undefined
                    }
                  >
                    {ingredient.original}
                  </Text>
                </Pressable>
              );
            })}

            {/* Instacart CTA */}
            <View className="mt-4 p-4 rounded-card bg-green-light border-[1.5px] border-green/20">
              <View className="flex-row items-center gap-2 mb-2.5">
                <Ionicons name="cart-outline" size={16} color={Colors.green} />
                <Text className="font-body-semibold text-[12px] text-green">
                  Order via Instacart
                </Text>
              </View>
              <PrimaryButton
                label={
                  orderableIngredients.length > 0
                    ? `Order ${orderableIngredients.length} Ingredient${orderableIngredients.length !== 1 ? "s" : ""}`
                    : "All ingredients added \u2713"
                }
                variant="green"
                onPress={() => {
                  if (!auth.isAuthenticated) {
                    router.push("/(modal)/account");
                    return;
                  }
                  router.push("/(modal)/instacart");
                }}
              />
            </View>
          </Animated.View>
        ) : null}

        {/* Instructions */}
        <Animated.View
          entering={FadeInDown.delay(600).duration(400).springify()}
          className="mt-7"
        >
          <Text className="font-body-bold text-[11px] text-txt-light tracking-widest uppercase mb-4">
            Instructions
          </Text>
          {recipe.instructions?.length ? (
            recipe.instructions.map((step, i) => (
              <View key={i} className="mb-4">
                <View className="flex-row gap-3 items-start">
                  <View className="w-6 h-6 rounded-full bg-warm items-center justify-center mt-0.5 shrink-0">
                    <Text className="font-body-bold text-[11px] text-white">
                      {i + 1}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="font-body text-[13px] text-txt leading-relaxed">
                      {step.text}
                    </Text>
                  </View>
                  {step.durationSeconds != null && (
                    <Pressable
                      onPress={() => openStepTimer(i, step.durationSeconds!)}
                      className="mt-0.5 bg-warm-pale rounded-pill px-2.5 py-1 flex-row items-center gap-1"
                      accessibilityRole="button"
                      accessibilityLabel={`Start ${Math.round(step.durationSeconds / 60)} minute timer`}
                    >
                      <Ionicons name="timer-outline" size={12} color={Colors.warm} />
                      <Text className="font-body-medium text-[11px] text-warm">
                        {Math.round(step.durationSeconds / 60)} min
                      </Text>
                    </Pressable>
                  )}
                </View>

                {/* Inline timer for this step */}
                {activeStepTimer === i && (
                  <View className="mt-2 ml-9 bg-cream rounded-card p-3 flex-row items-center justify-between">
                    <Text
                      className={`font-display text-[32px] leading-none ${
                        stepTimeLeft === 0
                          ? "text-green"
                          : stepTimerRunning
                            ? "text-warm"
                            : "text-txt"
                      }`}
                    >
                      {stepTimeLeft === 0 ? "\u{1F389}" : stepTimerDisplay}
                    </Text>
                    <View className="flex-row items-center gap-3">
                      <Pressable
                        onPress={toggleStepTimer}
                        accessibilityRole="button"
                        accessibilityLabel={stepTimerRunning ? "Pause" : "Start"}
                      >
                        <Ionicons
                          name={stepTimerRunning ? "pause" : "play"}
                          size={20}
                          color={Colors.warm}
                        />
                      </Pressable>
                      <Pressable
                        onPress={() => {
                          setActiveStepTimer(null);
                          setStepTimerRunning(false);
                        }}
                        accessibilityRole="button"
                        accessibilityLabel="Close timer"
                      >
                        <Ionicons name="close" size={20} color={Colors.textSoft} />
                      </Pressable>
                    </View>
                  </View>
                )}
              </View>
            ))
          ) : (
            <View className="p-4 rounded-card bg-cream items-center">
              <Text className="font-body text-[12px] text-txt-soft text-center leading-relaxed">
                Detailed instructions unavailable for this recipe.
              </Text>
              {recipe.sourceUrl ? (
                <Pressable
                  onPress={() => recipe.sourceUrl && Linking.openURL(recipe.sourceUrl)}
                  className="mt-2"
                  accessibilityRole="link"
                  accessibilityLabel="View full recipe online"
                >
                  <Text className="font-body-medium text-[12px] text-warm">
                    View full recipe →
                  </Text>
                </Pressable>
              ) : null}
            </View>
          )}
        </Animated.View>

        <ConfettiEmoji />
      </ScrollView>

      {/* Bottom action */}
      <Animated.View
        entering={FadeInDown.delay(700).duration(400).springify()}
        className="px-xl pb-5 pt-3"
      >
        <SecondaryButton
          label="Spin Again"
          variant="warmPale"
          onPress={handleSpinAgain}
        />
      </Animated.View>
    </SafeAreaView>
  );
}
