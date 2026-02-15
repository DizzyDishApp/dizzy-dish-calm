import React from "react";
import { View, Text } from "react-native";

interface MetaPillProps {
  label: string;
}

/**
 * Small meta info pill (time, calories, servings).
 *
 * Design spec:
 *  - Cream background (#F5EDE5)
 *  - Border radius: 20px
 *  - Font: 11px Medium 500, color #8C857D
 */
export function MetaPill({ label }: MetaPillProps) {
  return (
    <View className="px-3 py-[5px] rounded-pill bg-cream">
      <Text className="font-body-medium text-[11px] text-txt-soft">
        {label}
      </Text>
    </View>
  );
}
