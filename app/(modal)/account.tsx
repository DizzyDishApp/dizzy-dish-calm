import React from "react";
import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { HeaderBar } from "@/components/HeaderBar";
import { Avatar } from "@/components/Avatar";
import { SocialButton } from "@/components/SocialButton";
import { PrimaryButton } from "@/components/PrimaryButton";
import { SecondaryButton } from "@/components/SecondaryButton";
import { InputField } from "@/components/InputField";
import { useAuth } from "@/context/AuthContext";
import { useSubscription } from "@/hooks/useUserProfile";
import { loginWithSocial } from "@/lib/api";
import { Colors } from "@/constants/colors";

/**
 * Account screen (modal).
 *
 * Handles:
 *  - Social auth buttons (Google, Facebook, Apple)
 *  - Email auth
 *  - Instacart connection
 *  - Subscription management
 *  - Logout
 *
 * Server state: useSubscription query
 * Client state: AuthContext
 */
export default function AccountScreen() {
  const router = useRouter();
  const { state: auth, login, logout } = useAuth();
  const { data: subscription } = useSubscription();

  const handleSocialLogin = async (provider: "google" | "facebook" | "apple") => {
    // MIGRATION NOTE: Integrate real social auth via expo-auth-session
    const result = await loginWithSocial(provider);
    await login(result.user, result.accessToken);
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top"]}>
      <HeaderBar title="Account" showBack />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          className="flex-1 px-xl"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Avatar area */}
          <Animated.View
            entering={FadeInDown.delay(100).duration(300).springify()}
            className="items-center py-5 pb-7"
          >
            <Avatar size="large" />
            <Text className="font-body-medium text-[11px] text-warm mt-2">
              edit photo
            </Text>
          </Animated.View>

          {/* Login section */}
          <Animated.View
            entering={FadeInDown.delay(200).duration(300).springify()}
          >
            <Text className="font-display text-lg text-txt text-center mb-3.5">
              Connect With
            </Text>

            <SocialButton provider="google" onPress={() => handleSocialLogin("google")} />
            <SocialButton provider="facebook" onPress={() => handleSocialLogin("facebook")} />
            <SocialButton provider="apple" onPress={() => handleSocialLogin("apple")} />

            {/* Divider */}
            <View className="flex-row items-center gap-2.5 my-4">
              <View className="flex-1 h-px bg-border" />
              <Text className="font-body-bold text-[11px] text-txt-light tracking-widest uppercase">
                or continue with
              </Text>
              <View className="flex-1 h-px bg-border" />
            </View>

            {/* Email */}
            <Text className="font-body-semibold text-xs text-txt mb-1.5">
              Email Address
            </Text>
            <InputField
              placeholder="you@email.com"
              keyboardType="email-address"
              className="mb-3"
            />
            <PrimaryButton
              label="GET STARTED"
              variant="warm"
              bordered
              onPress={() => {
                // MIGRATION NOTE: Wire up email auth
              }}
            />

            {/* Terms */}
            <Text className="font-body text-[9px] text-txt-light leading-relaxed mt-3.5 text-center">
              By continuing, you agree to the{" "}
              <Text className="underline">Terms of Service</Text> and acknowledge
              our <Text className="underline">Privacy Policy</Text>.
            </Text>
          </Animated.View>

          {/* Instacart */}
          <Animated.View
            entering={FadeInDown.delay(300).duration(300).springify()}
            className="border-t border-border pt-5 mt-6"
          >
            <Text className="font-body-bold text-[11px] text-txt-light tracking-widest uppercase mb-2">
              Grocery Delivery
            </Text>
            <Text className="font-body text-xs text-txt-soft leading-relaxed mb-3">
              Connect Instacart to order ingredients directly from your results.
            </Text>
            <PrimaryButton
              label="Connect Instacart"
              variant="instacart"
              onPress={() => router.push("/(modal)/instacart")}
            />
          </Animated.View>

          {/* Subscription */}
          <Animated.View
            entering={FadeInDown.delay(400).duration(300).springify()}
            className="border-t border-border pt-5 mt-6"
          >
            <Text className="font-body-bold text-[11px] text-txt-light tracking-widest uppercase mb-3">
              Subscription
            </Text>
            <View className="flex-row justify-between items-center p-4 rounded-card bg-card border-[1.5px] border-border">
              <View>
                <Text className="font-body-semibold text-[13px] text-txt">
                  {subscription?.name ?? "Pro Plan"}
                </Text>
                <Text className="font-body text-[11px] text-txt-light mt-0.5">
                  {subscription?.price ?? "$3/month"}
                </Text>
              </View>
              <SecondaryButton
                label="Manage"
                variant="warmPale"
                onPress={() => {
                  // MIGRATION NOTE: Navigate to subscription management
                }}
              />
            </View>
          </Animated.View>

          {/* Log Out */}
          <Animated.View
            entering={FadeInDown.delay(500).duration(300).springify()}
            className="border-t border-border pt-5 mt-6"
          >
            <SecondaryButton
              label="Log Out"
              variant="ghost"
              onPress={handleLogout}
            />
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
