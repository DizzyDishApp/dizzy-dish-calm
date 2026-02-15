import React, { useCallback } from "react";
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { SpinButton } from "@/components/SpinButton";
import { Toggle } from "@/components/Toggle";
import { Avatar } from "@/components/Avatar";
import { GearButton } from "@/components/GearButton";
import { usePreferences } from "@/context/PreferencesContext";
import { useUI } from "@/context/UIContext";
import { useSpinRecipe, useSpinWeeklyPlan } from "@/hooks/useSpinRecipe";
import { SpinningOverlay } from "@/components/SpinningOverlay";

// MIGRATION NOTE: Replace with actual logo asset
// import logo from "@/assets/images/logo.webp";

/**
 * Home screen — the main entry point.
 *
 * "Designed for the parent at 6:30pm. One button. One answer. No noise."
 *
 * Server state: useSpinRecipe mutation, useSpinWeeklyPlan mutation
 * Client state: PreferencesContext (weeklyMode), UIContext (isSpinning)
 */
export default function HomeScreen() {
  const router = useRouter();
  const { state: prefs, setWeeklyMode } = usePreferences();
  const { state: ui, setSpinning } = useUI();
  const spinRecipe = useSpinRecipe();
  const spinWeeklyPlan = useSpinWeeklyPlan();

  const handleSpin = useCallback(() => {
    setSpinning(true);

    const request = {
      preferences: {
        dietary: Array.from(prefs.dietary),
        time: prefs.time,
        calories: prefs.calories,
      },
      weekly: prefs.weeklyMode,
    };

    if (prefs.weeklyMode) {
      spinWeeklyPlan.mutate(request, {
        onSuccess: () => {
          // onComplete in SpinningOverlay handles navigation
        },
        onError: () => {
          setSpinning(false);
        },
      });
    } else {
      spinRecipe.mutate(request, {
        onSuccess: () => {
          // onComplete in SpinningOverlay handles navigation
        },
        onError: () => {
          setSpinning(false);
        },
      });
    }
  }, [prefs, spinRecipe, spinWeeklyPlan, setSpinning]);

  const handleSpinComplete = useCallback(() => {
    setSpinning(false);
    if (prefs.weeklyMode) {
      router.push("/weekly-result");
    } else {
      router.push("/result");
    }
  }, [prefs.weeklyMode, router, setSpinning]);

  // Show spinning overlay
  if (ui.isSpinning) {
    return <SpinningOverlay onComplete={handleSpinComplete} />;
  }

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top"]}>
      <View className="flex-1 px-xl">
        {/* Top bar */}
        <View className="flex-row justify-between items-center py-1">
          {/* MIGRATION NOTE: Logo — replace Image source with actual asset */}
          <Text className="font-display text-xl text-txt">Dizzy Dish</Text>
          <GearButton onPress={() => router.push("/(modal)/settings")} />
        </View>

        {/* Heading */}
        <Animated.View
          entering={FadeInDown.duration(600).springify()}
          className="mt-hero"
        >
          <Text className="font-display text-[26px] text-txt leading-tight">
            What's Cooking?
          </Text>
        </Animated.View>

        {/* Weekly toggle */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(600).springify()}
          className="flex-row items-center gap-2.5 mt-lg"
        >
          <Toggle
            value={prefs.weeklyMode}
            onToggle={setWeeklyMode}
            variant="warm"
            accessibilityLabel="Toggle weekly plan mode"
          />
          <Text
            className={`font-body-medium text-xs ${
              prefs.weeklyMode ? "text-warm" : "text-txt-soft"
            }`}
          >
            {prefs.weeklyMode ? "Weekly plan \u00B7 7 recipes" : "Single recipe"}
          </Text>
        </Animated.View>

        {/* Spin button — THE main event */}
        <View className="flex-1 items-center justify-center">
          <Animated.View
            entering={FadeInDown.delay(200).duration(600).springify()}
          >
            <SpinButton onPress={handleSpin} weeklyMode={prefs.weeklyMode} />
          </Animated.View>
        </View>

        {/* Bottom bar: avatar left, saved center */}
        <Animated.View
          entering={FadeInDown.delay(400).duration(600).springify()}
          className="flex-row items-center pb-5"
        >
          <Avatar size="small" onPress={() => router.push("/(modal)/account")} />
          <View className="flex-1 items-center">
            <Pressable
              onPress={() => router.push("/saved")}
              className="px-5 py-2.5 rounded-btn bg-cream"
              accessibilityRole="button"
              accessibilityLabel="View saved recipes"
            >
              <Text className="font-body-medium text-xs text-txt-soft">
                saved recipes
              </Text>
            </Pressable>
          </View>
          {/* Spacer to balance avatar */}
          <View className="w-[38px]" />
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}
