import React from "react";
import { TextInput, type TextInputProps } from "react-native";
import { Colors } from "@/constants/colors";

interface InputFieldProps extends TextInputProps {
  className?: string;
}

/**
 * Styled text input matching the design system.
 *
 * Design spec:
 *  - Cream bg (#F5EDE5)
 *  - 1.5px border (#E8E3DD)
 *  - 12px border radius
 *  - Font: 13px Regular, color #2D2A26
 *  - Placeholder: #B8B2AA
 */
export function InputField({ className = "", ...props }: InputFieldProps) {
  return (
    <TextInput
      className={`w-full px-3.5 py-3 rounded-input bg-cream border-[1.5px] border-border font-body text-[13px] text-txt ${className}`}
      placeholderTextColor={Colors.textLight}
      autoCapitalize="none"
      autoCorrect={false}
      {...props}
    />
  );
}
