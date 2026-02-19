import React from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { HeaderBar } from "@/components/HeaderBar";
import { FilterPill } from "@/components/FilterPill";
import { usePreferences } from "@/context/PreferencesContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import type { DietaryFilter, TimeFilter, CalorieFilter } from "@/types";

/**
 * Settings / Preferences screen (modal).
 *
 * Client state only — all state from PreferencesContext.
 * Persisted via AsyncStorage inside the PreferencesProvider.
 * Pro status is read from useUserProfile (source of truth = Supabase + RevenueCat).
 */

const DIETARY_FILTERS: DietaryFilter[] = [
  "Vegetarian", "Vegan", "Gluten Free", "Dairy Free", "Sugar Free",
  "No Pork", "No Beef", "No Peanuts", "No Tree Nuts", "No Shrimp",
  "No Shellfish", "No Fish", "No Soy", "No Eggs", "No Sesame",
  "Keto", "Paleo", "Pescatarian", "Low FODMAP",
];
const TIME_FILTERS: TimeFilter[] = ["Under 30 Min", "Under 60 Min", "Any"];
const CALORIE_FILTERS: CalorieFilter[] = ["Light", "Moderate", "Hearty"];

export default function SettingsScreen() {
  const router = useRouter();
  const { state, toggleDietary, setTime, setCalories } = usePreferences();
  const { data: userProfile } = useUserProfile();
  const isPro = userProfile?.isPro ?? false;

  const sections = [
    {
      label: "Dietary",
      items: DIETARY_FILTERS,
      isActive: (item: string) => state.dietary.has(item as DietaryFilter),
      onToggle: (item: string) => toggleDietary(item as DietaryFilter),
    },
    {
      label: "Time",
      items: TIME_FILTERS,
      isActive: (item: string) => state.time === item,
      onToggle: (item: string) => setTime(item as TimeFilter),
    },
    {
      label: "Calories",
      items: CALORIE_FILTERS,
      isActive: (item: string) => state.calories === item,
      onToggle: (item: string) => setCalories(item as CalorieFilter),
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top"]}>
      <HeaderBar title="Preferences" showBack />

      {/* Pro status banner */}
      <View className="px-xl mt-3">
        <Animated.View
          entering={FadeInDown.delay(100).duration(300).springify()}
        >
          {isPro ? (
            <View className="p-3.5 rounded-input border bg-green-light border-green/20">
              <View className="flex-row items-center gap-2">
                <Ionicons name="checkmark-circle" size={16} color="#22c55e" />
                <View className="flex-1">
                  <Text className="font-body-bold text-[11px] text-green">
                    Pro · Saved Profile
                  </Text>
                  <Text className="font-body text-[10px] text-txt-soft mt-0.5 leading-snug">
                    Preferences stay until you change them
                  </Text>
                </View>
              </View>
            </View>
          ) : (
            <Pressable
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onPress={() => router.push("/(modal)/paywall" as any)}
              accessibilityRole="button"
              accessibilityLabel="Upgrade to Dizzy Dish Pro"
            >
              <View className="p-3.5 rounded-input border bg-warm-pale border-warm/20">
                <View className="flex-row justify-between items-center">
                  <View className="flex-1 mr-3">
                    <Text className="font-body-bold text-[11px] text-warm">
                      Free · Per-Spin
                    </Text>
                    <Text className="font-body text-[10px] text-txt-soft mt-0.5 leading-snug">
                      Preferences reset after each spin
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-1">
                    <Text className="font-body-bold text-[11px] text-warm">
                      Upgrade to Pro
                    </Text>
                    <Ionicons name="chevron-forward" size={12} color="#C65D3D" />
                  </View>
                </View>
              </View>
            </Pressable>
          )}
        </Animated.View>
      </View>

      <ScrollView
        className="flex-1 px-xl mt-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {sections.map((sec, si) => (
          <Animated.View
            key={sec.label}
            entering={FadeInDown.delay(200 + si * 100)
              .duration(300)
              .springify()}
            className="mb-5"
          >
            <Text className="font-body-bold text-[11px] text-txt-light tracking-widest uppercase mb-2">
              {sec.label}
            </Text>
            <View className="flex-row flex-wrap gap-1.5">
              {sec.items.map((item) => (
                <FilterPill
                  key={item}
                  label={item}
                  active={sec.isActive(item)}
                  onPress={() => sec.onToggle(item)}
                />
              ))}
            </View>
          </Animated.View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
