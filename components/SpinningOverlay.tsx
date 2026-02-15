import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
  FadeIn,
  FadeOut,
} from "react-native-reanimated";
import { Colors } from "@/constants/colors";
import { haptic } from "@/lib/haptics";

interface SpinningOverlayProps {
  onComplete: () => void;
}

/**
 * Full-screen spinning overlay shown during recipe spin.
 *
 * Phases:
 *  1. "spin" — conic gradient wheel spins 1080deg (0.7s)
 *  2. "black" — dark screen with "choosing..." text
 *  3. Calls onComplete -> success haptic
 *
 * Design spec (spinWheel):
 *  - 0.7s cubic-bezier(0.4, 0, 0.2, 1)
 *  - 0 -> 1080deg rotation
 */
export function SpinningOverlay({ onComplete }: SpinningOverlayProps) {
  const [phase, setPhase] = useState<"spin" | "black">("spin");
  const rotation = useSharedValue(0);

  useEffect(() => {
    // Spin phase
    rotation.value = withTiming(1080, {
      duration: 700,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
    });

    const t1 = setTimeout(() => setPhase("black"), 700);
    const t2 = setTimeout(() => {
      haptic.success();
      onComplete();
    }, 1100);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [onComplete, rotation]);

  const spinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  if (phase === "black") {
    return (
      <Animated.View
        entering={FadeIn.duration(200)}
        className="flex-1 items-center justify-center bg-[#1a1714]"
      >
        <Text className="font-display-italic text-base text-warm-light opacity-60 italic">
          choosing...
        </Text>
      </Animated.View>
    );
  }

  return (
    <View className="flex-1 items-center justify-center bg-bg">
      <Animated.View
        style={[
          spinStyle,
          {
            width: 160,
            height: 160,
            borderRadius: 80,
            backgroundColor: Colors.warm,
          },
        ]}
        className="items-center justify-center"
      >
        <View className="w-[50px] h-[50px] rounded-full bg-bg" />
      </Animated.View>
    </View>
  );
}
