import React from "react";
import { View, Text } from "react-native";

interface TagChipProps {
  label: string;
}

/**
 * Recipe tag chip (dietary labels like "Gluten Free", "High Protein").
 *
 * Design spec:
 *  - Transparent bg with 1px border (#E8E3DD)
 *  - Border radius: 14px
 *  - Font: 10px Medium 500, color #8C857D
 */
export function TagChip({ label }: TagChipProps) {
  return (
    <View className="px-2.5 py-1 rounded-[14px] border border-border">
      <Text className="font-body-medium text-[10px] text-txt-soft">
        {label}
      </Text>
    </View>
  );
}
