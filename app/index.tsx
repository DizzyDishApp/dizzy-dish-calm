import React, { useCallback, useRef } from "react";
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import Animated, { FadeInDown, FadeOut } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { SpinButton } from "@/components/SpinButton";
import { Toggle } from "@/components/Toggle";
import { useAuth } from "@/context/AuthContext";
import { usePreferences } from "@/context/PreferencesContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useUI } from "@/context/UIContext";
import { useAuthRedirect } from "@/context/AuthRedirectContext";
import { useSpinRecipe, useSpinWeeklyPlan } from "@/hooks/useSpinRecipe";
import { useRecipePool } from "@/hooks/useRecipePool";
import { useGuestSpinLimit } from "@/hooks/useGuestSpinLimit";
import { SpinningOverlay } from "@/components/SpinningOverlay";
import { Colors } from "@/constants/colors";
import { haptic } from "@/lib/haptics";

const logo = require("@/assets/images/logo.png");

/**
 * Home screen — the main entry point.
 *
 * "Designed for the parent at 6:30pm. One button. One answer. No noise."
 *
 * Server state: useRecipePool (Spoonacular), useSpinRecipe/useSpinWeeklyPlan mutations
 * Client state: PreferencesContext (weeklyMode, dietary, time, calories),
 *               UIContext (isSpinning), useGuestSpinLimit
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

  if (__DEV__) {
    console.log('------------>', { isLimitReached, spinsRemaining, incrementSpinCount })
    if (pool.isError) console.log('[index.tsx] pool ERROR:', pool.error?.message);
    if (pool.isSuccess) console.log('[index.tsx] pool loaded —', pool.data?.length, 'recipes');
  }

  // Store the last spun ID so handleSpinComplete can pass it as a nav param
  const lastRecipeIdRef = useRef<string | null>(null);
  const lastPlanIdRef = useRef<string | null>(null);

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

    setSpinning(true);

    if (prefs.weeklyMode) {
      spinWeeklyPlan.mutate(request, {
        onSuccess: (plan) => {
          if (__DEV__) console.log('[index.tsx] weekly plan drawn, id:', plan.id, '| days:', plan.days.length);
          lastPlanIdRef.current = plan.id;
        },
        onError: (err) => {
          if (__DEV__) console.log('[index.tsx] weekly spin ERROR:', err.message);
          setSpinning(false);
          showToast(err.message, "error");
        },
      });
    } else {
      spinRecipe.mutate(request, {
        onSuccess: (recipe) => {
          if (__DEV__) console.log('[index.tsx] recipe drawn:', recipe.name, '| id:', recipe.id);
          lastRecipeIdRef.current = recipe.id;
          if (!auth.isAuthenticated) {
            incrementSpinCount();
          }
        },
        onError: (err) => {
          if (__DEV__) console.log('[index.tsx] spin ERROR:', err.message);
          setSpinning(false);
          showToast(err.message, "error");
        },
      });
    }
  }, [prefs, request, pool.isLoading, pool.isError, pool.data, spinRecipe, spinWeeklyPlan, setSpinning, auth.isAuthenticated, incrementSpinCount]);

  // Called when the spinning animation completes — navigate to the result screen
  const handleSpinComplete = useCallback(() => {
    setSpinning(false);
    if (prefs.weeklyMode) {
      if (__DEV__) console.log('[index.tsx] handleSpinComplete — navigating to /weekly-result with planId:', lastPlanIdRef.current);
      router.push({
        pathname: "/weekly-result",
        params: { planId: lastPlanIdRef.current ?? "" },
      });
    } else {
      if (__DEV__) console.log('[index.tsx] handleSpinComplete — navigating to /result with recipeId:', lastRecipeIdRef.current);
      router.push({
        pathname: "/result",
        params: { recipeId: lastRecipeIdRef.current ?? "" },
      });
    }
  }, [prefs.weeklyMode, router, setSpinning]);

  // Active filters drive the hamburger indicator + context line
  const hasActiveFilters =
    prefs.time !== "Any" || prefs.calories !== "Any" || prefs.dietary.size > 0;

  const contextParts: string[] = [];
  if (prefs.time !== "Any")
    contextParts.push(prefs.time === "Under 30 Min" ? "< 30 min" : "< 60 min");
  if (prefs.calories !== "Any") contextParts.push(prefs.calories);
  prefs.dietary.forEach((f) => contextParts.push(f));

  // Show spinning overlay
  if (ui.isSpinning) {
    return <SpinningOverlay onComplete={handleSpinComplete} />;
  }

  const spinDisabled = pool.isLoading || isLimitReached;

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top"]}>
      <View className="flex-1 px-xl">

        {/* ── Top bar ──────────────────────────────────────────────────── */}
        <View className="flex-row justify-between items-center py-1">
          {/* Logo — contentPosition="left" anchors content to avoid inner whitespace offset */}
          <Image
            source={logo}
            style={{ width: 120, height: 40 }}
            contentFit="contain"
            contentPosition="left"
            accessibilityLabel="Dizzy Dish logo"
          />

          {/* Hamburger menu with active filter indicator */}
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

        {/* ── Spin button — THE main event ─────────────────────────────── */}
        <View className="flex-1 items-center justify-center">
          {/* Context line — pre-spin confirmation, just above the button */}
          {contextParts.length > 0 && (
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
            {/* Me tab */}
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

            {/* Spin tab — always active on this screen */}
            <View style={{ alignItems: "center", paddingHorizontal: 20, paddingVertical: 6, gap: 3 }}>
              <Ionicons name="shuffle-outline" size={18} color={Colors.warm} />
              <Text className="font-body-medium text-[11px] text-warm">spin</Text>
            </View>

            {/* Saved tab */}
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
