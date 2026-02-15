import React, { useState } from "react";
import { View, Text, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { HeaderBar } from "@/components/HeaderBar";
import { InputField } from "@/components/InputField";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useConnectInstacart } from "@/hooks/useInstacart";
import { useUI } from "@/context/UIContext";
import { Colors } from "@/constants/colors";

/**
 * Instacart login screen (modal).
 *
 * Server state: useConnectInstacart mutation
 */
export default function InstacartScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const connectMutation = useConnectInstacart();
  const { showToast } = useUI();

  const handleConnect = () => {
    connectMutation.mutate(
      { email, password },
      {
        onSuccess: () => {
          showToast("Instacart connected!");
        },
        onError: () => {
          showToast("Failed to connect. Please try again.");
        },
      }
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top"]}>
      <HeaderBar title="Instacart" showBack />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 px-xl justify-center"
      >
        <Animated.View
          entering={FadeInDown.duration(400).springify()}
          className="items-center mb-7"
        >
          {/* Instacart logo */}
          <View
            className="w-[60px] h-[60px] rounded-lg bg-instacart items-center justify-center"
            style={{
              shadowColor: "#108910",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.25,
              shadowRadius: 8,
              elevation: 6,
            }}
          >
            <Text className="text-[28px]">{"\u{1F6D2}"}</Text>
          </View>
          <Text className="font-display text-base text-txt mt-3">
            Connect Your Instacart
          </Text>
          <Text className="font-body text-xs text-txt-soft mt-1 text-center leading-relaxed">
            Link your account to order ingredients with one tap.
          </Text>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(200).duration(400).springify()}
        >
          {/* Email */}
          <Text className="font-body-semibold text-xs text-txt mb-1.5">
            Email
          </Text>
          <InputField
            placeholder="you@email.com"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            className="mb-2.5"
          />

          {/* Password */}
          <Text className="font-body-semibold text-xs text-txt mb-1.5">
            Password
          </Text>
          <InputField
            placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            className="mb-4"
          />

          {/* Connect button */}
          <PrimaryButton
            label="Connect Account"
            variant="instacart"
            bordered
            onPress={handleConnect}
          />

          <Text className="font-body text-[9px] text-txt-light text-center mt-3 leading-relaxed">
            Your Instacart credentials are securely stored and never shared.
          </Text>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
