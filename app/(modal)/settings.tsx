import React from "react";
import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { HeaderBar } from "@/components/HeaderBar";
import { Toggle } from "@/components/Toggle";
import { FilterPill } from "@/components/FilterPill";
import { usePreferences } from "@/context/PreferencesContext";
import type { DietaryFilter, TimeFilter, CalorieFilter } from "@/types";

/**
 * Settings / Preferences screen (modal).
 *
 * Client state only — all state from PreferencesContext.
 * Persisted via AsyncStorage inside the PreferencesProvider.
 *
 * Design spec:
 *  - Pro/Free toggle at top
 *  - Filter sections: Dietary, Time, Calories
 *  - Filter pills with on/off states
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
  const { state, toggleDietary, setTime, setCalories, setPro } = usePreferences();

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

      {/* Persistence banner */}
      <View className="px-xl mt-3">
        <Animated.View
          entering={FadeInDown.delay(100).duration(300).springify()}
          className={`p-3.5 rounded-input border ${
            state.isPro
              ? "bg-green-light border-green/20"
              : "bg-warm-pale border-warm/20"
          }`}
        >
          <View className="flex-row justify-between items-center">
            <View className="flex-1 mr-3">
              <Text
                className={`font-body-bold text-[11px] ${
                  state.isPro ? "text-green" : "text-warm"
                }`}
              >
                {state.isPro ? "Pro \u00B7 Saved Profile" : "Free \u00B7 Per-Spin"}
              </Text>
              <Text className="font-body text-[10px] text-txt-soft mt-0.5 leading-snug">
                {state.isPro
                  ? "Preferences stay until you change them"
                  : "Preferences reset after each spin"}
              </Text>
            </View>
            <Toggle
              value={state.isPro}
              onToggle={setPro}
              variant="green"
              accessibilityLabel="Toggle pro mode"
            />
          </View>
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
