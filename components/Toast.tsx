import React, { useEffect } from "react";
import { Text } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  FadeIn,
  FadeOut,
} from "react-native-reanimated";
import { useUI } from "@/context/UIContext";

/**
 * Simple toast notification that auto-dismisses.
 * Rendered at the root layout level.
 */
export function Toast() {
  const { state, hideToast } = useUI();

  useEffect(() => {
    if (state.toastVisible) {
      const timer = setTimeout(hideToast, 2500);
      return () => clearTimeout(timer);
    }
  }, [state.toastVisible, hideToast]);

  if (!state.toastVisible || !state.toastMessage) return null;

  const bgClass = state.toastVariant === "error" ? "bg-warm" : "bg-txt";

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(200)}
      className={`absolute bottom-24 left-6 right-6 ${bgClass} rounded-card px-4 py-3 items-center z-50`}
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8,
      }}
    >
      <Text className="font-body-medium text-xs text-white">
        {state.toastMessage}
      </Text>
    </Animated.View>
  );
}
