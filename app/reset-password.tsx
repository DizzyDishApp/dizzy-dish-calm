import React, { useState, useEffect, useRef } from "react";
import { View, Text, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Linking from "expo-linking";
import { HeaderBar } from "@/components/HeaderBar";
import { InputField } from "@/components/InputField";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

/**
 * Reset Password screen.
 *
 * Handles the deep link: dizzydish://reset-password#access_token=...&type=recovery
 *
 * Flow:
 *  1. Parse the recovery token from the deep link URL fragment
 *  2. Call supabase.auth.setSession() to establish a temporary session
 *  3. User enters + confirms new password
 *  4. Call updatePassword() → supabase.auth.updateUser({ password })
 *  5. Navigate home on success
 */
export default function ResetPasswordScreen() {
  const router = useRouter();
  const { updatePassword } = useAuth();

  const [ready, setReady] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  // Parse recovery token from the deep link and establish a session
  useEffect(() => {
    Linking.getInitialURL().then(async (url) => {
      if (!url) {
        setSessionError("Invalid reset link. Please request a new one.");
        setReady(true);
        return;
      }

      const fragment = url.includes("#") ? url.split("#")[1] : url.split("?")[1];
      const params = new URLSearchParams(fragment ?? "");
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");
      const type = params.get("type");

      if (!accessToken || !refreshToken || type !== "recovery") {
        setSessionError("Invalid or expired reset link. Please request a new one.");
        setReady(true);
        return;
      }

      const { error: sessionErr } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (sessionErr) {
        setSessionError("This reset link has expired. Please request a new one.");
      }

      setReady(true);
    });
  }, []);

  const handleSubmit = async () => {
    if (!password) {
      setError("Please enter a new password.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setError(null);
    setLoading(true);
    const { error: updateError } = await updatePassword(password);
    setLoading(false);

    if (updateError) {
      setError(updateError);
    } else {
      setSuccess(true);
      setTimeout(() => router.replace("/"), 2000);
    }
  };

  if (!ready) return null;

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top"]}>
      <HeaderBar title="Reset Password" showBack />

      <View className="flex-1 px-xl justify-center">
        {sessionError ? (
          <Animated.View entering={FadeInDown.duration(300)} className="items-center">
            <Text className="font-display text-lg text-txt text-center mb-2">
              Link expired
            </Text>
            <Text className="font-body text-xs text-txt-soft text-center leading-relaxed">
              {sessionError}
            </Text>
          </Animated.View>
        ) : success ? (
          <Animated.View entering={FadeInDown.duration(300)} className="items-center">
            <Text className="font-display text-lg text-txt text-center mb-2">
              Password updated!
            </Text>
            <Text className="font-body text-xs text-txt-soft text-center">
              Taking you home…
            </Text>
          </Animated.View>
        ) : (
          <Animated.View entering={FadeInDown.duration(300)}>
            <Text className="font-display text-lg text-txt text-center mb-1">
              New password
            </Text>
            <Text className="font-body text-xs text-txt-soft text-center mb-6">
              Choose something you'll actually remember.
            </Text>

            <Text className="font-body-semibold text-xs text-txt mb-1.5">
              New Password
            </Text>
            <InputField
              ref={passwordRef}
              placeholder="At least 6 characters"
              secureTextEntry
              value={password}
              onChangeText={(t) => { setPassword(t); setError(null); }}
              onSubmitEditing={() => confirmRef.current?.focus()}
              returnKeyType="next"
              className="mb-4"
            />

            <Text className="font-body-semibold text-xs text-txt mb-1.5">
              Confirm Password
            </Text>
            <InputField
              ref={confirmRef}
              placeholder="Re-enter your password"
              secureTextEntry
              value={confirmPassword}
              onChangeText={(t) => { setConfirmPassword(t); setError(null); }}
              onSubmitEditing={handleSubmit}
              returnKeyType="go"
              className="mb-1"
            />

            {error && (
              <Text className="font-body text-xs text-red-500 mt-2 mb-1">
                {error}
              </Text>
            )}

            <View className="mt-4">
              <PrimaryButton
                label="UPDATE PASSWORD"
                variant="warm"
                bordered
                loading={loading}
                onPress={handleSubmit}
              />
            </View>
          </Animated.View>
        )}
      </View>
    </SafeAreaView>
  );
}
