import React, { useCallback, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import Animated, { FadeInDown, FadeOut } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { SpinButton } from "@/components/SpinButton";
import { SpinResultCard } from "@/components/SpinResultCard";
import { InlineSpinWheel } from "@/components/SpinningOverlay";
import { Toggle } from "@/components/Toggle";
import { useAuth } from "@/context/AuthContext";
import { usePreferences } from "@/context/PreferencesContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useUI } from "@/context/UIContext";
import { useAuthRedirect } from "@/context/AuthRedirectContext";
import { useSpinRecipe, useSpinWeeklyPlan } from "@/hooks/useSpinRecipe";
import { useRecipePool } from "@/hooks/useRecipePool";
import { useGuestSpinLimit } from "@/hooks/useGuestSpinLimit";
import { useSavedRecipes, useSaveRecipe, useUnsaveRecipe } from "@/hooks/useSavedRecipes";
import { Colors } from "@/constants/colors";
import { haptic } from "@/lib/haptics";
import type { Recipe, WeeklyPlan } from "@/types";

const logo = require("@/assets/images/logo.png");

type SpinResult =
  | { type: "recipe"; data: Recipe }
  | { type: "plan"; data: WeeklyPlan }
  | null;

/**
 * Home screen — the main entry point.
 *
 * Center area has three states:
 *  1. SpinButton (idle)
 *  2. InlineSpinWheel (spinning — replaces button in-place)
 *  3. SpinResultCard (result — animates up after spin completes)
 */
export default function HomeScreen() {
  const router = useRouter();
  const { state: prefs, setWeeklyMode } = usePreferences();
  const { state: auth } = useAuth();
  const { data: userProfile } = useUserProfile();
  const { state: ui, setSpinning, showToast } = useUI();
  const { setSnapshot } = useAuthRedirect();
  const spinRecipe = useSpinRecipe();
  const spinWeeklyPlan = useSpinWeeklyPlan();
  const pool = useRecipePool();
  const { isLimitReached, spinsRemaining, incrementSpinCount } =
    useGuestSpinLimit();

  // Saved recipes for heart toggle on result card
  const { data: savedRecipes } = useSavedRecipes();
  const saveRecipe = useSaveRecipe();
  const unsaveRecipe = useUnsaveRecipe();

  // Center area state: null = show button, "spinning" = show wheel, SpinResult = show card
  const [spinResult, setSpinResult] = useState<SpinResult>(null);
  const [isSpinAnimating, setIsSpinAnimating] = useState(false);

  if (__DEV__) {
    console.log('------------>', { isLimitReached, spinsRemaining, incrementSpinCount })
    if (pool.isError) console.log('[index.tsx] pool ERROR:', pool.error?.message);
    if (pool.isSuccess) console.log('[index.tsx] pool loaded —', pool.data?.length, 'recipes');
  }

  const request = {
    dietary: Array.from(prefs.dietary),
    time: prefs.time,
    calories: prefs.calories,
    isPro: userProfile?.isPro ?? false,
  };

  const handleSpin = useCallback(() => {
    if (__DEV__) {
      console.log('[index.tsx] handleSpin fired');
      console.log('[index.tsx] pool state — isLoading:', pool.isLoading, '| isError:', pool.isError, '| recipes:', pool.data?.length ?? 0);
      console.log('[index.tsx] request:', JSON.stringify(request));
    }

    // Clear previous result and start the wheel animation
    setSpinResult(null);
    setIsSpinAnimating(true);
    setSpinning(true);

    if (prefs.weeklyMode) {
      spinWeeklyPlan.mutate(request, {
        onSuccess: (plan) => {
          if (__DEV__) console.log('[index.tsx] weekly plan drawn, id:', plan.id, '| days:', plan.days.length);
          setSpinResult({ type: "plan", data: plan });
        },
        onError: (err) => {
          if (__DEV__) console.log('[index.tsx] weekly spin ERROR:', err.message);
          setSpinning(false);
          setIsSpinAnimating(false);
          showToast(err.message, "error");
        },
      });
    } else {
      spinRecipe.mutate(request, {
        onSuccess: (recipe) => {
          if (__DEV__) console.log('[index.tsx] recipe drawn:', recipe.name, '| id:', recipe.id);
          setSpinResult({ type: "recipe", data: recipe });
          if (!auth.isAuthenticated) {
            incrementSpinCount();
          }
        },
        onError: (err) => {
          if (__DEV__) console.log('[index.tsx] spin ERROR:', err.message);
          setSpinning(false);
          setIsSpinAnimating(false);
          showToast(err.message, "error");
        },
      });
    }
  }, [prefs, request, pool.isLoading, pool.isError, pool.data, spinRecipe, spinWeeklyPlan, setSpinning, auth.isAuthenticated, incrementSpinCount]);

  // Wheel animation finished — stop spinning, show the result card
  const handleSpinComplete = useCallback(() => {
    setSpinning(false);
    setIsSpinAnimating(false);
  }, [setSpinning]);

  // Navigate to full result screen
  const handleViewFullRecipe = useCallback(() => {
    if (!spinResult) return;
    if (spinResult.type === "recipe") {
      router.push({
        pathname: "/result",
        params: { recipeId: spinResult.data.id },
      });
    } else {
      router.push({
        pathname: "/weekly-result",
        params: { planId: spinResult.data.id },
      });
    }
  }, [spinResult, router]);

  // Reset to spin button
  const handleSpinAgain = useCallback(() => {
    setSpinResult(null);
  }, []);

  // Heart toggle for recipe result
  const isRecipeSaved =
    spinResult?.type === "recipe" &&
    (savedRecipes ?? []).some((r) => r.id === spinResult.data.id);

  const handleToggleSave = useCallback(() => {
    if (spinResult?.type !== "recipe") return;
    if (!auth.isAuthenticated) {
      setSnapshot("/");
      router.push("/(modal)/account");
      return;
    }
    if (isRecipeSaved) {
      unsaveRecipe.mutate(spinResult.data.id);
    } else {
      saveRecipe.mutate({ recipeId: spinResult.data.id, recipe: spinResult.data });
    }
  }, [spinResult, isRecipeSaved, auth.isAuthenticated, savedRecipes, saveRecipe, unsaveRecipe, setSnapshot, router]);

  // Active filters drive the hamburger indicator + context line
  const hasActiveFilters =
    prefs.time !== "Any" || prefs.calories !== "Any" || prefs.dietary.size > 0;

  const contextParts: string[] = [];
  if (prefs.time !== "Any")
    contextParts.push(prefs.time === "Under 30 Min" ? "< 30 min" : "< 60 min");
  if (prefs.calories !== "Any") contextParts.push(prefs.calories);
  prefs.dietary.forEach((f) => contextParts.push(f));

  const spinDisabled = pool.isLoading || isLimitReached;

  // Determine which center content to show
  const showResult = spinResult && !isSpinAnimating;
  const showWheel = isSpinAnimating;

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top"]}>
      <View className="flex-1 px-xl">

        {/* ── Top bar ──────────────────────────────────────────────────── */}
        <View className="flex-row justify-between items-center py-1">
          <Image
            source={logo}
            style={{ width: 120, height: 40 }}
            contentFit="contain"
            contentPosition="left"
            accessibilityLabel="Dizzy Dish logo"
          />

          <Pressable
            onPress={() => { haptic.light(); router.push("/(modal)/settings"); }}
            accessibilityRole="button"
            accessibilityLabel={hasActiveFilters ? "Menu — filters active" : "Menu"}
          >
            <View
              style={{
                width: 36,
                height: 36,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 18,
                borderWidth: hasActiveFilters ? 1.5 : 0,
                borderColor: hasActiveFilters ? Colors.warm : "transparent",
              }}
            >
              <Ionicons name="menu-outline" size={20} color={Colors.text} />
              {hasActiveFilters && (
                <View
                  style={{
                    position: "absolute",
                    top: -2,
                    right: -2,
                    width: 8,
                    height: 8,
                    backgroundColor: Colors.warm,
                    borderRadius: 4,
                    borderWidth: 1.5,
                    borderColor: Colors.bg,
                  }}
                />
              )}
            </View>
          </Pressable>
        </View>

        {/* ── Heading ──────────────────────────────────────────────────── */}
        <Animated.View
          entering={FadeInDown.duration(600).springify()}
          className="mt-hero"
        >
          <Text className="font-display text-[26px] text-txt leading-tight">
            What's Cooking?
          </Text>
        </Animated.View>

        {/* ── Weekly / single toggle ────────────────────────────────────── */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(600).springify()}
          className="flex-row items-center gap-2.5 mt-lg"
          style={{ alignSelf: "flex-start" }}
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

        {/* ── Center area: Button → Wheel → Result Card ──────────────── */}
        <View className="flex-1 items-center justify-center">
          {/* Context line — stays visible during idle and spinning */}
          {!showResult && contextParts.length > 0 && (
            <Animated.View
              entering={FadeInDown.duration(300).springify()}
              exiting={FadeOut.duration(200)}
              style={{ width: "100%", marginBottom: 40 }}
            >
              <Text className="font-body text-[11px] text-txt-soft text-center">
                {contextParts.join(" · ")}
              </Text>
            </Animated.View>
          )}

          {showResult ? (
            /* Result card — pops up after spin */
            <SpinResultCard
              result={spinResult}
              saved={isRecipeSaved}
              onToggleSave={handleToggleSave}
              onViewFullRecipe={handleViewFullRecipe}
              onSpinAgain={handleSpinAgain}
            />
          ) : showWheel ? (
            /* Inline spinning wheel — same position/size as the button */
            <InlineSpinWheel onComplete={handleSpinComplete} />
          ) : (
            /* Idle — spin button */
            <>
              <Animated.View
                entering={FadeInDown.delay(200).duration(600).springify()}
              >
                <SpinButton
                  onPress={handleSpin}
                  weeklyMode={prefs.weeklyMode}
                  disabled={spinDisabled}
                />
              </Animated.View>

              {/* Guest limit upsell banner */}
              {isLimitReached && !auth.isAuthenticated && (
                <Animated.View
                  entering={FadeInDown.delay(100).duration(400).springify()}
                  className="mt-6 items-center"
                >
                  <Text className="font-body text-sm text-txt-soft text-center mb-3">
                    You've used your 3 free spins for today.
                  </Text>
                  <Pressable
                    onPress={() => {
                      setSnapshot("/");
                      router.push("/(modal)/account");
                    }}
                    className="px-6 py-2.5 rounded-btn bg-warm"
                    accessibilityRole="button"
                    accessibilityLabel="Sign up for unlimited spins"
                  >
                    <Text className="font-body-medium text-sm text-white">
                      Sign up for unlimited spins
                    </Text>
                  </Pressable>
                </Animated.View>
              )}

              {/* Remaining spins for guests */}
              {!auth.isAuthenticated && !isLimitReached && spinsRemaining < 3 && (
                <Animated.View
                  entering={FadeInDown.delay(100).duration(400).springify()}
                  className="mt-4"
                >
                  <Text className="font-body text-xs text-txt-soft text-center">
                    {spinsRemaining} free spin
                    {spinsRemaining !== 1 ? "s" : ""} remaining today
                  </Text>
                </Animated.View>
              )}

              {/* Pool loading indicator */}
              {pool.isLoading && (
                <Animated.View
                  entering={FadeInDown.delay(100).duration(400).springify()}
                  className="mt-4"
                >
                  <Text className="font-body text-xs text-txt-soft text-center">
                    Loading recipes…
                  </Text>
                </Animated.View>
              )}
            </>
          )}
        </View>

        {/* ── Bottom 3-tab pill nav ─────────────────────────────────────── */}
        <Animated.View
          entering={FadeInDown.delay(400).duration(600).springify()}
          className="pb-5 items-center"
        >
          <View
            className="flex-row rounded-btn"
            style={{
              backgroundColor: "rgba(245, 237, 229, 0.92)",
              borderWidth: 1,
              borderColor: Colors.border,
              paddingVertical: 6,
              paddingHorizontal: 6,
              gap: 2,
            }}
          >
            <Pressable
              onPress={() => {
                haptic.light();
                if (!auth.isAuthenticated) setSnapshot("/");
                router.push("/(modal)/account");
              }}
              style={{ alignItems: "center", paddingHorizontal: 20, paddingVertical: 6, gap: 3 }}
              accessibilityRole="button"
              accessibilityLabel="My account"
            >
              <Ionicons name="person-outline" size={18} color={Colors.textSoft} />
              <Text className="font-body-medium text-[11px] text-txt-soft">me</Text>
            </Pressable>

            <View style={{ alignItems: "center", paddingHorizontal: 20, paddingVertical: 6, gap: 3 }}>
              <Ionicons name="shuffle-outline" size={18} color={Colors.warm} />
              <Text className="font-body-medium text-[11px] text-warm">spin</Text>
            </View>

            <Pressable
              onPress={() => { haptic.light(); router.push("/saved"); }}
              style={{ alignItems: "center", paddingHorizontal: 20, paddingVertical: 6, gap: 3 }}
              accessibilityRole="button"
              accessibilityLabel="View saved recipes"
            >
              <Ionicons name="heart-outline" size={18} color={Colors.textSoft} />
              <Text className="font-body-medium text-[11px] text-txt-soft">saved</Text>
            </Pressable>
          </View>
        </Animated.View>

      </View>
    </SafeAreaView>
  );
}
