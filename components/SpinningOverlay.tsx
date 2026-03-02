import React, { useEffect } from "react";
import { View, Text } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
  FadeIn,
} from "react-native-reanimated";
import { haptic } from "@/lib/haptics";

interface InlineSpinWheelProps {
  onComplete: () => void;
}

// Quadrant colors — single-use, not design tokens
const COLORS = {
  terracotta: "#C65D3D",
  golden: "#E8A838",
  sage: "#7BA688",
  blush: "#E8A8A0",
};

const WHEEL_SIZE = 200;
const HALF = WHEEL_SIZE / 2;
const HUB_SIZE = 56;
// Match SpinButton's PRESS_DEPTH so the wheel sits at the same vertical center
const PRESS_DEPTH = 5;

/**
 * Inline spinning wheel — replaces SpinButton in-place while spinning.
 *
 * Same 200px diameter as SpinButton, with matching outer container height
 * (WHEEL_SIZE + PRESS_DEPTH) so it occupies the exact same space.
 *
 * Rotation uses a single long withTiming (3600deg over 10s, linear) for
 * perfectly smooth continuous spin with no frame drops or reset jumps.
 *
 * Timeline:
 *  0ms      — Wheel fades in, smooth continuous rotation starts
 *  2000ms   — haptic.success(), bounce up 20px then slide down 40px + fade
 *  2400ms   — onComplete() fires (parent swaps to result card)
 */
export function InlineSpinWheel({ onComplete }: InlineSpinWheelProps) {
  const rotation = useSharedValue(0);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    // Single smooth rotation — 2160deg (6 full turns) over 4s
    // The animation will be interrupted by the exit at ~2s, but there's no
    // snap/reset because it's one continuous timing curve.
    rotation.value = withTiming(2160, {
      duration: 4000,
      easing: Easing.linear,
    });

    // At 2000ms: haptic + bounce up then slide down + fade
    const hapticTimer = setTimeout(() => {
      haptic.success();
      translateY.value = withSequence(
        withTiming(-20, { duration: 150, easing: Easing.out(Easing.ease) }),
        withTiming(40, { duration: 250, easing: Easing.in(Easing.ease) })
      );
      opacity.value = withSequence(
        withTiming(1, { duration: 150 }),
        withTiming(0, { duration: 250 })
      );
    }, 2000);

    // At 2400ms: fire onComplete (after bounce animation finishes)
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 2400);

    return () => {
      clearTimeout(hapticTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete, rotation, translateY, opacity]);

  const wheelStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { rotate: `${rotation.value}deg` },
    ],
    opacity: opacity.value,
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      style={{ alignItems: "center" }}
      accessibilityLabel="Spinning for a recipe"
    >
      {/* Match SpinButton's outer container: WHEEL_SIZE + PRESS_DEPTH tall */}
      <View style={{ width: WHEEL_SIZE, height: WHEEL_SIZE + PRESS_DEPTH, justifyContent: "center" }}>
        <Animated.View style={[wheelStyle, { alignSelf: "center" }]}>
          <View
            style={{
              width: WHEEL_SIZE,
              height: WHEEL_SIZE,
              borderRadius: HALF,
              overflow: "hidden",
            }}
          >
            {/* Top-left: Terracotta */}
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: HALF,
                height: HALF,
                backgroundColor: COLORS.terracotta,
              }}
            />
            {/* Top-right: Golden */}
            <View
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                width: HALF,
                height: HALF,
                backgroundColor: COLORS.golden,
              }}
            />
            {/* Bottom-right: Sage */}
            <View
              style={{
                position: "absolute",
                bottom: 0,
                right: 0,
                width: HALF,
                height: HALF,
                backgroundColor: COLORS.sage,
              }}
            />
            {/* Bottom-left: Blush */}
            <View
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                width: HALF,
                height: HALF,
                backgroundColor: COLORS.blush,
              }}
            />

            {/* Center hub — matches app bg so it looks hollow */}
            <View
              style={{
                position: "absolute",
                top: (WHEEL_SIZE - HUB_SIZE) / 2,
                left: (WHEEL_SIZE - HUB_SIZE) / 2,
                width: HUB_SIZE,
                height: HUB_SIZE,
                borderRadius: HUB_SIZE / 2,
                backgroundColor: "#FAF6F1",
                zIndex: 10,
              }}
            />
          </View>
        </Animated.View>
      </View>

      {/* Status text — mt-8 (32px) matches SpinButton's "tap to spin" text */}
      <Animated.View style={[{ marginTop: 32 }, textStyle]}>
        <Text
          style={{
            fontFamily: "Fraunces_700Bold_Italic",
            fontSize: 14,
            color: COLORS.blush,
            letterSpacing: 0.5,
          }}
        >
          finding your meal...
        </Text>
      </Animated.View>
    </Animated.View>
  );
}
