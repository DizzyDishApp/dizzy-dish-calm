import React, { useEffect } from "react";
import { View } from "react-native";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import {
  Fraunces_400Regular,
  Fraunces_400Regular_Italic,
  Fraunces_600SemiBold,
  Fraunces_700Bold,
  Fraunces_700Bold_Italic,
} from "@expo-google-fonts/fraunces";
import {
  PlusJakartaSans_300Light,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from "@expo-google-fonts/plus-jakarta-sans";
import { AppProviders } from "@/providers";
import { Toast } from "@/components/Toast";
import { initRevenueCat } from "@/lib/revenueCat";

import "../global.css";

// Prevent splash screen from auto-hiding until fonts are loaded
SplashScreen.preventAutoHideAsync();

/**
 * Root layout.
 *
 * Responsibilities:
 *  - Load custom fonts (Fraunces + Plus Jakarta Sans)
 *  - Wrap in GestureHandlerRootView (required by Reanimated/RNGH)
 *  - Wrap in AppProviders (QueryClient, Auth, Theme, Preferences, UI)
 *  - Configure Expo Router Stack
 *  - Render Toast overlay
 */
export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Fraunces_400Regular,
    Fraunces_400Regular_Italic,
    Fraunces_600SemiBold,
    Fraunces_700Bold,
    Fraunces_700Bold_Italic,
    PlusJakartaSans_300Light,
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      initRevenueCat();
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppProviders>
        <View className="flex-1 bg-bg">
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: "#FAF6F1" },
              animation: "fade",
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="result"
              options={{ animation: "slide_from_bottom" }}
            />
            <Stack.Screen
              name="weekly-result"
              options={{ animation: "slide_from_bottom" }}
            />
            <Stack.Screen
              name="reset-password"
              options={{ animation: "slide_from_bottom" }}
            />
            <Stack.Screen
              name="auth"
              options={{ animation: "none" }}
            />
            <Stack.Screen
              name="auth/callback"
              options={{ animation: "none" }}
            />
            <Stack.Screen
              name="(modal)"
              options={{
                presentation: "modal",
                animation: "slide_from_bottom",
              }}
            />
          </Stack>
          <Toast />
        </View>
        <StatusBar style="dark" />
      </AppProviders>
    </GestureHandlerRootView>
  );
}
