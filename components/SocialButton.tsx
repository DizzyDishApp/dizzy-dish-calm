import React from "react";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { haptic } from "@/lib/haptics";
import { Colors } from "@/constants/colors";

type SocialProvider = "google" | "facebook" | "apple";

interface SocialButtonProps {
  provider: SocialProvider;
  onPress: () => void;
}

const providerConfig: Record<
  SocialProvider,
  { label: string; iconName: keyof typeof Ionicons.glyphMap; iconColor: string }
> = {
  google: { label: "GOOGLE", iconName: "logo-google", iconColor: Colors.google },
  facebook: {
    label: "FACEBOOK",
    iconName: "logo-facebook",
    iconColor: Colors.facebook,
  },
  apple: { label: "APPLE", iconName: "logo-apple", iconColor: Colors.apple },
};

/**
 * Social authentication button.
 *
 * Design spec:
 *  - White card bg, 2px #2D2A26 border, 3px 3px shadow
 *  - Border radius: 28px (social)
 *  - Brand icon left, label centered, uppercase bold
 */
export function SocialButton({ provider, onPress }: SocialButtonProps) {
  const config = providerConfig[provider];

  const handlePress = () => {
    haptic.medium();
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      className="flex-row items-center px-4 py-3 mb-2 rounded-social bg-card border-2 border-txt"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 3, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 0,
        elevation: 3,
      }}
      accessibilityRole="button"
      accessibilityLabel={`Sign in with ${config.label}`}
    >
      <Ionicons
        name={config.iconName}
        size={18}
        color={config.iconColor}
      />
      <Text className="flex-1 text-center font-body-bold text-[13px] text-txt uppercase tracking-wider">
        {config.label}
      </Text>
    </Pressable>
  );
}
