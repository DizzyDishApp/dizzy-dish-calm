import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { HeaderBar } from "@/components/HeaderBar";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useRevenueCatInfo } from "@/hooks/useUserProfile";
import { useUI } from "@/context/UIContext";
import { haptic } from "@/lib/haptics";
import type { PurchasesPackage } from "react-native-purchases";

const FEATURES = [
  { icon: "flame-outline" as const, label: "Calorie & nutrition info per recipe" },
  { icon: "bookmark-outline" as const, label: "Preferences saved between spins" },
  { icon: "sparkles-outline" as const, label: "Curated Pro recipe pool" },
];

/**
 * Paywall modal — shown when a free/guest user taps the calorie upsell
 * or the "Upgrade to Pro" row in settings.
 *
 * Packages are loaded from RevenueCat's "default" offering.
 * Falls back to static pricing copy when RevenueCat is unavailable (Expo Go).
 */
export default function PaywallScreen() {
  const router = useRouter();
  const { showToast } = useUI();
  const { packages, isLoading, purchase, restore } = useRevenueCatInfo();
  const [selectedIndex, setSelectedIndex] = useState(1); // default: annual (index 1)

  // Identify monthly vs annual packages by packageType or productId
  const sortedPackages = [...packages].sort((a, b) => {
    // Annual packages typically have a lower monthly cost — sort monthly first for toggle
    const aIsMonthly = isMonthlyPackage(a);
    const bIsMonthly = isMonthlyPackage(b);
    if (aIsMonthly && !bIsMonthly) return -1;
    if (!aIsMonthly && bIsMonthly) return 1;
    return 0;
  });

  const selectedPackage = sortedPackages[selectedIndex] ?? sortedPackages[0];

  const handlePurchase = async () => {
    if (!selectedPackage) {
      showToast("Packages not available. Please try again.", "error");
      return;
    }
    haptic.medium();
    try {
      await purchase.mutateAsync(selectedPackage);
      showToast("Welcome to Pro!");
      router.back();
    } catch (e: unknown) {
      // User cancelled — not an error worth surfacing
      const message = e instanceof Error ? e.message : "";
      if (!message.includes("cancel")) {
        showToast("Purchase failed. Please try again.", "error");
      }
    }
  };

  const handleRestore = async () => {
    haptic.light();
    try {
      await restore.mutateAsync();
      showToast("Purchases restored!");
      router.back();
    } catch {
      showToast("No active purchases found.", "error");
    }
  };

  const isBusy = purchase.isPending || restore.isPending;

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top"]}>
      <HeaderBar title="" showBack />

      <ScrollView
        className="flex-1 px-xl"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Hero */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(400).springify()}
          className="items-center mt-2 mb-6"
        >
          <Text className="text-[44px] mb-2">✨</Text>
          <Text className="font-display text-3xl text-txt text-center leading-tight">
            Dizzy Dish Pro
          </Text>
          <Text className="font-body text-[13px] text-txt-soft mt-2 text-center leading-relaxed">
            One deep breath. Full nutrition. Zero guesswork.
          </Text>
        </Animated.View>

        {/* Feature list */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(400).springify()}
          className="mb-6 gap-3"
        >
          {FEATURES.map((feat) => (
            <View key={feat.label} className="flex-row items-center gap-3">
              <View className="w-8 h-8 rounded-full bg-warm-pale items-center justify-center">
                <Ionicons name={feat.icon} size={16} color="#C65D3D" />
              </View>
              <Text className="font-body text-[13px] text-txt flex-1 leading-snug">
                {feat.label}
              </Text>
            </View>
          ))}
        </Animated.View>

        {/* Package toggle */}
        <Animated.View
          entering={FadeInDown.delay(300).duration(400).springify()}
          className="mb-6"
        >
          {isLoading ? (
            <View className="items-center py-4">
              <ActivityIndicator color="#C65D3D" />
            </View>
          ) : sortedPackages.length > 0 ? (
            <View className="gap-2">
              {sortedPackages.map((pkg, idx) => {
                const isSelected = selectedIndex === idx;
                const isAnnual = !isMonthlyPackage(pkg);
                return (
                  <Pressable
                    key={pkg.identifier}
                    onPress={() => {
                      haptic.select();
                      setSelectedIndex(idx);
                    }}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: isSelected }}
                    accessibilityLabel={`${pkg.product.title} — ${pkg.product.priceString}`}
                  >
                    <View
                      className={`p-4 rounded-input border ${
                        isSelected
                          ? "bg-warm-pale border-warm"
                          : "bg-bg border-warm/20"
                      }`}
                    >
                      <View className="flex-row justify-between items-start">
                        <View className="flex-1">
                          <View className="flex-row items-center gap-2">
                            <Text className="font-body-bold text-[13px] text-txt">
                              {isAnnual ? "Annual" : "Monthly"}
                            </Text>
                            {isAnnual && (
                              <View className="bg-warm rounded px-1.5 py-0.5">
                                <Text className="font-body-bold text-[10px] text-white">
                                  BEST VALUE
                                </Text>
                              </View>
                            )}
                          </View>
                          <Text className="font-body text-[11px] text-txt-soft mt-0.5">
                            {isAnnual
                              ? `${pkg.product.priceString}/year — cancel anytime`
                              : `${pkg.product.priceString}/month — cancel anytime`}
                          </Text>
                        </View>
                        <View
                          className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
                            isSelected ? "border-warm" : "border-warm/30"
                          }`}
                        >
                          {isSelected && (
                            <View className="w-2.5 h-2.5 rounded-full bg-warm" />
                          )}
                        </View>
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          ) : (
            /* Fallback static pricing when RevenueCat is unavailable (Expo Go) */
            <View className="gap-2">
              <StaticPackageRow
                label="Monthly"
                price="$2.99/month"
                isSelected={selectedIndex === 0}
                onPress={() => { haptic.select(); setSelectedIndex(0); }}
              />
              <StaticPackageRow
                label="Annual"
                price="$14.99/year"
                isSelected={selectedIndex === 1}
                bestValue
                onPress={() => { haptic.select(); setSelectedIndex(1); }}
              />
            </View>
          )}
        </Animated.View>

        {/* Fine print */}
        <Animated.View
          entering={FadeInDown.delay(400).duration(400).springify()}
          className="items-center"
        >
          <Text className="font-body text-[10px] text-txt-soft text-center leading-relaxed">
            Cancel anytime · Billed via App Store / Google Play{"\n"}
            Subscription renews automatically unless cancelled 24 hours before renewal
          </Text>
        </Animated.View>
      </ScrollView>

      {/* Bottom CTAs */}
      <Animated.View
        entering={FadeInDown.delay(500).duration(400).springify()}
        className="px-xl pb-5 pt-3 gap-2"
      >
        <PrimaryButton
          label={
            selectedPackage
              ? `Start Pro — ${selectedPackage.product.priceString}`
              : "Start Pro"
          }
          variant="warm"
          onPress={handlePurchase}
          loading={purchase.isPending}
        />

        <Pressable
          onPress={handleRestore}
          disabled={isBusy}
          accessibilityRole="button"
          accessibilityLabel="Restore purchases"
          className="items-center py-2"
        >
          <Text className="font-body text-[12px] text-txt-soft">
            Restore Purchases
          </Text>
        </Pressable>
      </Animated.View>
    </SafeAreaView>
  );
}

// ── Helpers ──

function isMonthlyPackage(pkg: PurchasesPackage): boolean {
  const id = pkg.packageType?.toLowerCase() ?? pkg.identifier.toLowerCase();
  return id.includes("monthly") || id.includes("month") || id === "$rc_monthly";
}

interface StaticPackageRowProps {
  label: string;
  price: string;
  isSelected: boolean;
  bestValue?: boolean;
  onPress: () => void;
}

function StaticPackageRow({
  label,
  price,
  isSelected,
  bestValue,
  onPress,
}: StaticPackageRowProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ checked: isSelected }}
    >
      <View
        className={`p-4 rounded-input border ${
          isSelected ? "bg-warm-pale border-warm" : "bg-bg border-warm/20"
        }`}
      >
        <View className="flex-row justify-between items-start">
          <View className="flex-1">
            <View className="flex-row items-center gap-2">
              <Text className="font-body-bold text-[13px] text-txt">{label}</Text>
              {bestValue && (
                <View className="bg-warm rounded px-1.5 py-0.5">
                  <Text className="font-body-bold text-[10px] text-white">
                    BEST VALUE
                  </Text>
                </View>
              )}
            </View>
            <Text className="font-body text-[11px] text-txt-soft mt-0.5">
              {price} — cancel anytime
            </Text>
          </View>
          <View
            className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
              isSelected ? "border-warm" : "border-warm/30"
            }`}
          >
            {isSelected && <View className="w-2.5 h-2.5 rounded-full bg-warm" />}
          </View>
        </View>
      </View>
    </Pressable>
  );
}
