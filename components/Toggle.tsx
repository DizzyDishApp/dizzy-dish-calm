import React from "react";
import { Pressable } from "react-native";
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

const TRACK_WIDTH = 44;
const TRACK_HEIGHT = 24;
const TRACK_PADDING = 3;
const THUMB_SIZE = TRACK_HEIGHT - TRACK_PADDING * 2; // 18px
const TRAVEL = TRACK_WIDTH - TRACK_PADDING * 2 - THUMB_SIZE; // 20px

/**
 * Toggle switch matching the design system.
 *
 * Specs:
 *  - 44x24px track, 18x18px thumb, 3px padding
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
  const translateX = useSharedValue(value ? TRAVEL : 0);

  React.useEffect(() => {
    translateX.value = withTiming(value ? TRAVEL : 0, { duration: 250 });
  }, [value, translateX]);

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const handlePress = () => {
    haptic.select();
    onToggle(!value);
  };

  const onColor = variant === "green" ? "#5B8C6A" : "#C65D3D";
  const offColor = "#E8E3DD";

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      accessibilityLabel={accessibilityLabel}
      style={{
        width: TRACK_WIDTH,
        height: TRACK_HEIGHT,
        borderRadius: TRACK_HEIGHT / 2,
        padding: TRACK_PADDING,
        backgroundColor: value ? onColor : offColor,
        justifyContent: "center",
      }}
    >
      <Animated.View
        style={[
          thumbStyle,
          {
            width: THUMB_SIZE,
            height: THUMB_SIZE,
            borderRadius: THUMB_SIZE / 2,
            backgroundColor: "#FFFFFF",
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
