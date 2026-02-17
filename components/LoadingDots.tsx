import React, { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";

interface LoadingDotsProps {
  color?: string;
  size?: number;
}

function Dot({ color, size, delay }: { color: string; size: number; delay: number }) {
  const translateY = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-8, { duration: 250, easing: Easing.out(Easing.ease) }),
          withTiming(0, { duration: 250, easing: Easing.in(Easing.ease) })
        ),
        -1,
        false
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
        animatedStyle,
      ]}
    />
  );
}

/**
 * Three dots that bounce up in a staggered wave pattern.
 * Used inside buttons during loading states.
 */
export function LoadingDots({ color = "#FFFFFF", size = 6 }: LoadingDotsProps) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 5, height: 20, justifyContent: "center" }}>
      <Dot color={color} size={size} delay={0} />
      <Dot color={color} size={size} delay={100} />
      <Dot color={color} size={size} delay={200} />
    </View>
  );
}
