import React, { useEffect } from "react";
import { Pressable, Text } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from "react-native-reanimated";
import { haptic } from "@/lib/haptics";

interface SpinButtonProps {
  onPress: () => void;
  weeklyMode: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * The hero spin button — the main CTA of the app.
 *
 * Design spec:
 *  - 180x180px circle
 *  - Gradient: #C65D3D -> #B04E32 (simulated with warm bg)
 *  - calmPulse animation: scale 1->1.03, 3s infinite
 *  - Shadow: 0 8px 30px rgba(198,93,61,0.3)
 *  - Haptic: heavy on press
 */
export function SpinButton({ onPress, weeklyMode }: SpinButtonProps) {
  const scale = useSharedValue(1);

  // calmPulse animation
  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.03, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1, // infinite
      true
    );
  }, [scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    haptic.heavy();
    onPress();
  };

  return (
    <Animated.View className="items-center" style={animatedStyle}>
      <AnimatedPressable
        onPress={handlePress}
        className="w-[180px] h-[180px] rounded-full bg-warm items-center justify-center"
        style={{
          shadowColor: "#C65D3D",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.3,
          shadowRadius: 15,
          elevation: 12,
        }}
        accessibilityRole="button"
        accessibilityLabel={weeklyMode ? "Spin for weekly plan" : "Spin for a recipe"}
      >
        <Text className="font-display text-lg text-white opacity-95 tracking-wide">
          decide for me
        </Text>
      </AnimatedPressable>
      <Text className="font-body text-[11px] text-txt-light mt-4">
        {weeklyMode ? "tap for 7 meals" : "tap to spin"}
      </Text>
    </Animated.View>
  );
}
