import React from "react";
import { Pressable, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { haptic } from "@/lib/haptics";

interface ToggleProps {
  value: boolean;
  onToggle: (newValue: boolean) => void;
  /** Color when on: "warm" | "green". Defaults to "warm". */
  variant?: "warm" | "green";
  accessibilityLabel?: string;
}

/**
 * Toggle switch matching the design system.
 *
 * Specs:
 *  - 40x22px track, 18x18px thumb
 *  - Off: border color (#E8E3DD)
 *  - On warm: #C65D3D
 *  - On green: #5B8C6A
 *  - Haptic: select
 */
export function Toggle({
  value,
  onToggle,
  variant = "warm",
  accessibilityLabel,
}: ToggleProps) {
  const translateX = useSharedValue(value ? 18 : 0);

  React.useEffect(() => {
    translateX.value = withTiming(value ? 18 : 0, { duration: 250 });
  }, [value, translateX]);

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const handlePress = () => {
    haptic.select();
    onToggle(!value);
  };

  const onColor = variant === "green" ? "bg-green" : "bg-warm";
  const trackColor = value ? onColor : "bg-border";

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      accessibilityLabel={accessibilityLabel}
      className={`w-10 h-[22px] rounded-full p-[2px] ${trackColor}`}
    >
      <Animated.View
        className="w-[18px] h-[18px] rounded-full bg-white"
        style={[
          thumbStyle,
          {
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.15,
            shadowRadius: 1.5,
            elevation: 2,
          },
        ]}
      />
    </Pressable>
  );
}
