import React, { useEffect } from "react";
import { Text, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";

const EMOJIS = ["\u{1F363}", "\u{1F35B}", "\u{1F32E}", "\u{1F35D}", "\u{1F957}"];

/**
 * Confetti-style floating food emojis.
 *
 * Design spec (confFloat):
 *  - 1.5s ease
 *  - Y 0 -> -60, scale 1 -> 0.5, fade out
 *  - Staggered by 0.15s per emoji
 */
export function ConfettiEmoji() {
  return (
    <View className="flex-row justify-center gap-2 mt-5">
      {EMOJIS.map((emoji, i) => (
        <FloatingEmoji key={i} emoji={emoji} delay={i * 150} />
      ))}
    </View>
  );
}

function FloatingEmoji({ emoji, delay }: { emoji: string; delay: number }) {
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  useEffect(() => {
    const timingConfig = {
      duration: 1500,
      easing: Easing.out(Easing.ease),
    };

    translateY.value = withDelay(delay, withTiming(-60, timingConfig));
    scale.value = withDelay(delay, withTiming(0.5, timingConfig));
    opacity.value = withDelay(delay, withTiming(0, timingConfig));
  }, [delay, translateY, scale, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Text className="text-base">{emoji}</Text>
    </Animated.View>
  );
}
