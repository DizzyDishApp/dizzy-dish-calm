import React, { useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  withSequence,
  interpolate,
  Easing,
} from "react-native-reanimated";
import { haptic } from "@/lib/haptics";

interface SpinButtonProps {
  onPress: () => void;
  weeklyMode: boolean;
  disabled?: boolean;
}

const BUTTON_SIZE = 200;
const PRESS_DEPTH = 5; // px the button surface travels downward on press
const PULSE_COLOR = "#C65D3D";
const DEPTH_COLOR = "#B04E32"; // warm-dark — the button's physical base

/**
 * A single expanding pulse ring that emanates from behind the button.
 * Smooth cycle: fade in while starting to expand → fade out as it reaches full size.
 * No abrupt snap — uses withSequence with a gentle fade-in ramp.
 */
function PulseRing({ delay }: { delay: number }) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 0 }),
          withTiming(1.35, { duration: 2400, easing: Easing.out(Easing.ease) })
        ),
        -1,
        false
      )
    );
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0, { duration: 0 }),
          withTiming(0.3, { duration: 600, easing: Easing.out(Easing.ease) }),
          withTiming(0, { duration: 1800, easing: Easing.in(Easing.ease) })
        ),
        -1,
        false
      )
    );
  }, [scale, opacity, delay]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        style,
        {
          position: "absolute",
          top: 0,
          left: 0,
          width: BUTTON_SIZE,
          height: BUTTON_SIZE,
          borderRadius: BUTTON_SIZE / 2,
          backgroundColor: PULSE_COLOR,
        },
      ]}
    />
  );
}

/**
 * The hero spin button — the main CTA of the app.
 *
 * Design spec:
 *  - 180x180px circle, warm terracotta surface
 *  - Raised 3D look: darker depth base sits PRESS_DEPTH px below surface
 *  - Press: surface travels down PRESS_DEPTH px, shadow collapses (feels physical)
 *  - 2 staggered pulse rings emanate from behind
 *  - Haptic: heavy on press
 */
export function SpinButton({ onPress, weeklyMode, disabled = false }: SpinButtonProps) {
  const pressProgress = useSharedValue(0);

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: pressProgress.value * PRESS_DEPTH }],
    shadowOpacity: interpolate(pressProgress.value, [0, 1], [0.32, 0.06]),
    shadowRadius: interpolate(pressProgress.value, [0, 1], [16, 4]),
    elevation: interpolate(pressProgress.value, [0, 1], [12, 3]),
  }));

  const handlePressIn = () => {
    if (disabled) return;
    pressProgress.value = withTiming(1, { duration: 80, easing: Easing.out(Easing.ease) });
  };

  const handlePressOut = () => {
    pressProgress.value = withTiming(0, { duration: 200, easing: Easing.out(Easing.ease) });
  };

  const handlePress = () => {
    if (disabled) return;
    haptic.heavy();
    onPress();
  };

  return (
    <View style={{ alignItems: "center" }}>
      {/* Extra PRESS_DEPTH height so the depth base sits fully within bounds */}
      <View style={{ width: BUTTON_SIZE, height: BUTTON_SIZE + PRESS_DEPTH }}>

        {/* Pulse rings — rendered first so they appear behind everything */}
        <PulseRing delay={0} />
        <PulseRing delay={1100} />

        {/* 3D depth base — stays fixed, creates the raised/physical look */}
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: BUTTON_SIZE,
            height: BUTTON_SIZE,
            borderRadius: BUTTON_SIZE / 2,
            backgroundColor: DEPTH_COLOR,
          }}
        />

        {/* Button surface — animates down on pressIn, springs back on pressOut */}
        <Animated.View
          style={[
            buttonStyle,
            {
              position: "absolute",
              top: 0,
              left: 0,
              width: BUTTON_SIZE,
              height: BUTTON_SIZE,
              borderRadius: BUTTON_SIZE / 2,
              shadowColor: "#C65D3D",
              shadowOffset: { width: 0, height: 6 },
            },
          ]}
        >
          <Pressable
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={handlePress}
            disabled={disabled}
            style={{
              width: BUTTON_SIZE,
              height: BUTTON_SIZE,
              borderRadius: BUTTON_SIZE / 2,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: disabled ? "rgba(198,93,61,0.5)" : "#C65D3D",
            }}
            accessibilityRole="button"
            accessibilityLabel={weeklyMode ? "Spin for weekly plan" : "Spin for a recipe"}
            accessibilityState={{ disabled }}
          >
            <Text className="font-display text-lg text-white opacity-95 tracking-wide">
              decide for me
            </Text>
          </Pressable>
        </Animated.View>

      </View>

      <Text className="font-body text-[11px] text-txt-light mt-8">
        {weeklyMode ? "tap for 7 meals" : "tap to spin"}
      </Text>
    </View>
  );
}
