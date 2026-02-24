import React, { useState, useRef, useEffect, useCallback } from "react";
import { View, Text, ScrollView, Platform, Pressable, TextInput, Keyboard, Dimensions, Linking } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { HeaderBar } from "@/components/HeaderBar";
import { Avatar } from "@/components/Avatar";
import { SocialButton } from "@/components/SocialButton";
import { PrimaryButton } from "@/components/PrimaryButton";
import { SecondaryButton } from "@/components/SecondaryButton";
import { InputField } from "@/components/InputField";
import { useAuth } from "@/context/AuthContext";
import { useAuthRedirect } from "@/context/AuthRedirectContext";
import { useUI } from "@/context/UIContext";
import { useUserProfile, useRevenueCatInfo } from "@/hooks/useUserProfile";
import { useSaveRecipe } from "@/hooks/useSavedRecipes";
import { checkEmailExists } from "@/lib/api";
import { Colors } from "@/constants/colors";

/**
 * Account screen (modal).
 *
 * Identifier-first auth flow:
 *   1. User enters email → taps GET STARTED
 *   2. We check Supabase for existing account
 *   3. Existing user → single password field + "Welcome Back"
 *   4. New user → password + confirm password + "Create Account"
 *
 * Server state: useSubscription query
 * Client state: AuthContext
 */

type AuthPhase = "email" | "password" | "reset-sent";

/** Map Supabase error messages to user-friendly text. */
function friendlyError(msg: string): string {
  const lower = msg.toLowerCase();
  if (lower.includes("invalid login credentials")) {
    return "Incorrect password. Please try again.";
  }
  if (lower.includes("user already registered")) {
    return "An account with this email already exists. Try signing in.";
  }
  if (lower.includes("email rate limit")) {
    return "Too many attempts. Please wait a moment and try again.";
  }
  if (lower.includes("network") || lower.includes("fetch")) {
    return "Network error. Please check your connection and try again.";
  }
  if (lower.includes("weak password") || lower.includes("at least")) {
    return "Password is too weak. Use at least 6 characters.";
  }
  return msg;
}

export default function AccountScreen() {
  const router = useRouter();
  const { state: auth, signUp, signIn, signInWithGoogle, signInWithApple, resetPassword, signOut } = useAuth();
  const { consumeSnapshot } = useAuthRedirect();
  const { showToast } = useUI();
  const { data: userProfile } = useUserProfile();
  const { customerInfo } = useRevenueCatInfo();
  const saveMutation = useSaveRecipe();

  // ── Subscription display ──
  const isPro = userProfile?.isPro ?? false;
  const proEntitlement = customerInfo?.entitlements?.active?.["pro_access"];
  const productId = proEntitlement?.productIdentifier ?? "";
  const planName = productId.includes("annual") ? "Pro Annual" : isPro ? "Pro Monthly" : "Pro Plan";
  const expirationDate = proEntitlement?.expirationDate ?? null;
  const willRenew = proEntitlement?.willRenew ?? true;
  const managementURL = customerInfo?.managementURL ?? null;
  const renewalText = expirationDate
    ? (() => {
        const date = new Date(expirationDate);
        const formatted = date.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        });
        return willRenew ? `Renews ${formatted}` : `Expires ${formatted}`;
      })()
    : null;

  // Track the auth state at mount time so we only redirect on fresh sign-ins
  const wasAuthenticatedOnMount = useRef(auth.isAuthenticated);

  // ── Post-auth redirect ──
  useEffect(() => {
    if (!auth.isAuthenticated || wasAuthenticatedOnMount.current) return;

    (async () => {
      const snapshot = await consumeSnapshot();
      if (!snapshot) return;

      // Execute pending action
      if (snapshot.pendingAction?.type === "save_recipe") {
        const { recipeId, recipe } = snapshot.pendingAction.payload;
        saveMutation.mutate({ recipeId, recipe });
        showToast("Recipe saved!");
      }

      // Navigate back to previous route
      if (snapshot.previousRoute) {
        setTimeout(() => router.back(), 100);
      }
    })();
  }, [auth.isAuthenticated]);

  // ── Identifier-first state ──
  const [phase, setPhase] = useState<AuthPhase>("email");
  const [emailExists, setEmailExists] = useState<boolean | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);

  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);
  const scrollRef = useRef<ScrollView>(null);
  const keyboardHeight = useRef(0);
  const [keyboardPadding, setKeyboardPadding] = useState(0);

  const isBusy = loading || checkingEmail;

  // Track keyboard height for padding and scroll calculations
  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, (e) => {
      keyboardHeight.current = e.endCoordinates.height;
      setKeyboardPadding(e.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      keyboardHeight.current = 0;
      setKeyboardPadding(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Scroll to a focused input only if it's behind the keyboard
  const scrollOffsetRef = useRef(0);

  const scrollToVisible = useCallback((inputRef: React.RefObject<TextInput | null>) => {
    setTimeout(() => {
      const node = inputRef.current;
      if (!node || !scrollRef.current) return;

      node.measureInWindow((_x, y, _w, h) => {
        const screenH = Dimensions.get("window").height;
        const kbTop = screenH - keyboardHeight.current;
        const inputBottom = y + h + 20; // 20px breathing room

        if (inputBottom > kbTop) {
          const scrollBy = inputBottom - kbTop;
          scrollRef.current?.scrollTo({
            y: scrollOffsetRef.current + scrollBy,
            animated: true,
          });
        }
      });
    }, 350);
  }, []);

  // ── Phase 1: Check email ──
  const handleGetStarted = async () => {
    if (isBusy) return;

    const trimmed = email.trim();
    if (!trimmed) {
      setError("Please enter your email address.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("Please enter a valid email address.");
      return;
    }

    setError(null);
    setCheckingEmail(true);

    try {
      const exists = await checkEmailExists(trimmed);
      setEmailExists(exists);
      setPhase("password");
      setTimeout(() => passwordRef.current?.focus(), 300);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setCheckingEmail(false);
    }
  };

  // ── Phase 2: Submit auth ──
  const handleSubmitAuth = async () => {
    if (isBusy) return;

    if (!password) {
      setError("Please enter a password.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (!emailExists && password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setError(null);
    setLoading(true);

    const result = emailExists
      ? await signIn(email.trim(), password)
      : await signUp(email.trim(), password);

    setLoading(false);

    if (result.error) {
      setError(friendlyError(result.error));
    }
  };

  // ── Go back to email phase ──
  const handleChangeEmail = () => {
    setPhase("email");
    setEmailExists(null);
    setPassword("");
    setConfirmPassword("");
    setError(null);
    setEmail("");
  };

  const handleSignOut = async () => {
    await signOut();
  };

  // ── Authenticated view ──
  if (auth.isAuthenticated) {
    return (
      <SafeAreaView className="flex-1 bg-bg" edges={["top"]}>
        <HeaderBar title="Account" showBack />
        <ScrollView
          className="flex-1 px-xl"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {/* Avatar area */}
          <Animated.View
            entering={FadeInDown.delay(100).duration(300).springify()}
            className="items-center py-5 pb-7"
          >
            <Avatar size="large" />
            <Text className="font-body-medium text-sm text-txt mt-2">
              {auth.user?.displayName}
            </Text>
            <Text className="font-body text-xs text-txt-soft mt-0.5">
              {auth.user?.email}
            </Text>
          </Animated.View>

          {/* Instacart */}
          <Animated.View
            entering={FadeInDown.delay(200).duration(300).springify()}
            className="border-t border-border pt-5 mt-2"
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
            entering={FadeInDown.delay(300).duration(300).springify()}
            className="border-t border-border pt-5 mt-6"
          >
            <Text className="font-body-bold text-[11px] text-txt-light tracking-widest uppercase mb-3">
              Subscription
            </Text>
            {isPro ? (
              <View className="p-4 rounded-card bg-card border-[1.5px] border-border">
                <View className="flex-row items-center justify-between mb-1">
                  <Text className="font-body-semibold text-[13px] text-txt">
                    {planName}
                  </Text>
                  <View className="bg-warm px-2.5 py-0.5 rounded-full">
                    <Text className="font-body-bold text-[10px] text-white uppercase tracking-wider">
                      Pro
                    </Text>
                  </View>
                </View>
                {renewalText ? (
                  <Text className="font-body text-[11px] text-txt-light mt-0.5 mb-3">
                    {renewalText}
                  </Text>
                ) : (
                  <View className="mb-3" />
                )}
                <View className="flex-row gap-2">
                  <View className="flex-1">
                    <SecondaryButton
                      label="Change Plan"
                      variant="warmPale"
                      onPress={() => router.push("/(modal)/paywall" as any)}
                    />
                  </View>
                  <View className="flex-1">
                    <SecondaryButton
                      label="Manage"
                      variant="ghost"
                      onPress={() => {
                        if (managementURL) Linking.openURL(managementURL);
                      }}
                      accessibilityLabel="Manage subscription in App Store or Play Store"
                    />
                  </View>
                </View>
              </View>
            ) : (
              <View className="p-4 rounded-card bg-card border-[1.5px] border-border">
                <Text className="font-body-semibold text-[13px] text-txt mb-0.5">
                  Free Plan
                </Text>
                <Text className="font-body text-[11px] text-txt-soft leading-relaxed mt-0.5 mb-3">
                  Upgrade to unlock nutrition data and more.
                </Text>
                <PrimaryButton
                  label="UPGRADE TO PRO"
                  variant="warm"
                  bordered
                  onPress={() => router.push("/(modal)/paywall" as any)}
                />
              </View>
            )}
          </Animated.View>

          {/* Sign Out */}
          <Animated.View
            entering={FadeInDown.delay(400).duration(300).springify()}
            className="border-t border-border pt-5 mt-6"
          >
            <SecondaryButton
              label="Sign Out"
              variant="ghost"
              onPress={handleSignOut}
            />
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Unauthenticated view ──
  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top"]}>
      <HeaderBar title="Account" showBack />
        <ScrollView
          ref={scrollRef}
          className="flex-1 px-xl"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 + keyboardPadding }}
          keyboardShouldPersistTaps="handled"
          onScroll={(e) => { scrollOffsetRef.current = e.nativeEvent.contentOffset.y; }}
          scrollEventThrottle={16}
        >
          {/* Avatar area */}
          <Animated.View
            entering={FadeInDown.delay(100).duration(300).springify()}
            className="items-center py-5 pb-7"
          >
            <Avatar size="large" />
          </Animated.View>

          {/* Social auth */}
          <Animated.View
            entering={FadeInDown.delay(200).duration(300).springify()}
          >
            <Text className="font-display text-lg text-txt text-center mb-3.5">
              Connect With
            </Text>

            <SocialButton
              provider="google"
              onPress={async () => {
                const { error: googleError } = await signInWithGoogle();
                if (googleError) setError(googleError);
              }}
            />
            {Platform.OS === "ios" && (
              <SocialButton
                provider="apple"
                onPress={async () => {
                  const { error: appleError } = await signInWithApple();
                  if (appleError) setError(appleError);
                }}
              />
            )}

            {/* Divider */}
            <View className="flex-row items-center gap-2.5 my-4">
              <View className="flex-1 h-px bg-border" />
              <Text className="font-body-bold text-[11px] text-txt-light tracking-widest uppercase">
                or continue with
              </Text>
              <View className="flex-1 h-px bg-border" />
            </View>
          </Animated.View>

          {/* Identifier-first email flow */}
          <Animated.View
            entering={FadeInDown.delay(300).duration(300).springify()}
          >
            {/* Phase header */}
            {phase === "password" && (
              <Animated.View entering={FadeIn.duration(250)}>
                <Text className="font-display text-lg text-txt text-center mb-1">
                  {emailExists ? "Welcome Back" : "Create Account"}
                </Text>
                <Text
                  className="font-body text-xs text-warm text-center mb-3"
                  onPress={handleChangeEmail}
                  accessibilityRole="button"
                  accessibilityLabel="Change email address"
                >
                  {email} — change
                </Text>
              </Animated.View>
            )}

            {/* Reset link sent confirmation */}
            {phase === "reset-sent" && (
              <Animated.View entering={FadeIn.duration(250)} className="items-center py-4">
                <Text className="font-display text-lg text-txt text-center mb-2">
                  Check your email
                </Text>
                <Text className="font-body text-xs text-txt-soft text-center leading-relaxed mb-4">
                  We sent a reset link to{"\n"}
                  <Text className="text-warm">{email}</Text>
                </Text>
                <Text
                  className="font-body text-xs text-warm text-center"
                  onPress={handleChangeEmail}
                  accessibilityRole="button"
                >
                  Back to sign in
                </Text>
              </Animated.View>
            )}

            {/* Email field (phase 1) */}
            {phase !== "reset-sent" && phase === "email" && (
              <>
                <Text className="font-body-semibold text-xs text-txt mb-1.5">
                  Email Address
                </Text>
                <InputField
                  ref={emailRef}
                  placeholder="you@email.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setError(null);
                  }}
                  onFocus={() => scrollToVisible(emailRef)}
                  onSubmitEditing={handleGetStarted}
                  returnKeyType="go"
                  editable={!isBusy}
                  className="mb-1"
                />
              </>
            )}

            {/* Password fields (phase 2) */}
            {phase !== "reset-sent" && phase === "password" && (
              <Animated.View entering={FadeIn.duration(250)}>
                <Text className="font-body-semibold text-xs text-txt mb-1.5">
                  Password
                </Text>
                <InputField
                  ref={passwordRef}
                  placeholder={emailExists ? "Enter your password" : "At least 6 characters"}
                  secureTextEntry
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    setError(null);
                  }}
                  onFocus={() => scrollToVisible(passwordRef)}
                  onSubmitEditing={emailExists ? handleSubmitAuth : undefined}
                  returnKeyType={emailExists ? "go" : "next"}
                  editable={!isBusy}
                  className="mb-1"
                />

                {/* Forgot password (existing users only) */}
                {emailExists && (
                  <Text
                    className="font-body text-xs text-warm text-right mb-2"
                    onPress={async () => {
                      setError(null);
                      setLoading(true);
                      const { error: resetError } = await resetPassword(email.trim());
                      setLoading(false);
                      if (resetError) {
                        setError(resetError);
                      } else {
                        setPhase("reset-sent");
                      }
                    }}
                    accessibilityRole="link"
                  >
                    Forgot password?
                  </Text>
                )}

                {/* Confirm password (new users only) */}
                {!emailExists && (
                  <>
                    <View className="h-2" />
                    <Text className="font-body-semibold text-xs text-txt mb-1.5">
                      Confirm Password
                    </Text>
                    <InputField
                      ref={confirmRef}
                      placeholder="Re-enter your password"
                      secureTextEntry
                      value={confirmPassword}
                      onChangeText={(text) => {
                        setConfirmPassword(text);
                        setError(null);
                      }}
                      onFocus={() => scrollToVisible(confirmRef)}
                      onSubmitEditing={handleSubmitAuth}
                      returnKeyType="go"
                      editable={!isBusy}
                      className="mb-1"
                    />
                  </>
                )}
              </Animated.View>
            )}

            {/* Error message */}
            {error && phase !== "reset-sent" && (
              <Text className="font-body text-xs text-red-500 mt-2 mb-1">
                {error}
              </Text>
            )}

            {/* CTA button */}
            {phase !== "reset-sent" && (
              <View className="mt-3">
                {phase === "email" ? (
                  <PrimaryButton
                    label="GET STARTED"
                    variant="warm"
                    bordered
                    loading={checkingEmail}
                    onPress={handleGetStarted}
                  />
                ) : (
                  <PrimaryButton
                    label={emailExists ? "SIGN IN" : "SIGN UP"}
                    variant="warm"
                    bordered
                    loading={loading}
                    onPress={handleSubmitAuth}
                  />
                )}
              </View>
            )}

            {/* Terms */}
            <Text className="font-body text-[9px] text-txt-light leading-relaxed mt-3.5 text-center">
              By continuing, you agree to the{" "}
              <Text className="underline">Terms of Service</Text> and acknowledge
              our <Text className="underline">Privacy Policy</Text>.
            </Text>
          </Animated.View>

          {/* Instacart — locked */}
          <Animated.View
            entering={FadeInDown.delay(400).duration(300).springify()}
            className="border-t border-border pt-5 mt-6"
          >
            <Pressable
              onPress={() => showToast("Create an account to connect Instacart")}
              style={{ opacity: 0.45 }}
              accessibilityRole="button"
              accessibilityLabel="Connect Instacart — sign in required"
            >
              <Text className="font-body-bold text-[11px] text-txt-light tracking-widest uppercase mb-2">
                Grocery Delivery
              </Text>
              <Text className="font-body text-xs text-txt-soft leading-relaxed mb-3">
                Connect Instacart to order ingredients directly from your results.
              </Text>
              <View className="py-3.5 rounded-btn items-center justify-center bg-instacart border-2 border-txt flex-row gap-2">
                <Ionicons name="lock-closed" size={14} color="white" />
                <Text className="font-body-bold text-sm text-white uppercase tracking-wider">
                  Connect Instacart
                </Text>
              </View>
              <Text className="font-body text-[10px] text-txt-light text-center mt-2">
                Sign in to connect
              </Text>
            </Pressable>
          </Animated.View>

          {/* Subscription — locked */}
          <Animated.View
            entering={FadeInDown.delay(500).duration(300).springify()}
            className="border-t border-border pt-5 mt-6"
          >
            <Text className="font-body-bold text-[11px] text-txt-light tracking-widest uppercase mb-3">
              Subscription
            </Text>
            <Pressable
              onPress={() => router.push("/(modal)/paywall" as any)}
              className="p-4 rounded-card bg-card border-[1.5px] border-border"
              accessibilityRole="button"
              accessibilityLabel="View Pro subscription plans"
            >
              <Text className="font-body-semibold text-[13px] text-txt mb-0.5">
                Dizzy Dish Pro
              </Text>
              <Text className="font-body text-[11px] text-txt-soft leading-relaxed mt-0.5 mb-3">
                Nutrition data, persistent preferences, and a curated Pro recipe pool.
              </Text>
              <View className="flex-row items-center justify-center py-2.5 rounded-btn bg-warm gap-2">
                <Ionicons name="star" size={13} color="white" />
                <Text className="font-body-bold text-[13px] text-white uppercase tracking-wider">
                  View Plans
                </Text>
              </View>
            </Pressable>
          </Animated.View>
        </ScrollView>
    </SafeAreaView>
  );
}
