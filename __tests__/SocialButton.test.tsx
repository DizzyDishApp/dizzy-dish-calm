import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { SocialButton } from "@/components/SocialButton";

describe("SocialButton", () => {
  it("renders GOOGLE label for google provider", () => {
    const { getByText } = render(
      <SocialButton provider="google" onPress={() => {}} />
    );
    expect(getByText("GOOGLE")).toBeTruthy();
  });

  it("renders FACEBOOK label for facebook provider", () => {
    const { getByText } = render(
      <SocialButton provider="facebook" onPress={() => {}} />
    );
    expect(getByText("FACEBOOK")).toBeTruthy();
  });

  it("renders APPLE label for apple provider", () => {
    const { getByText } = render(
      <SocialButton provider="apple" onPress={() => {}} />
    );
    expect(getByText("APPLE")).toBeTruthy();
  });

  it("fires onPress when pressed", () => {
    const onPress = jest.fn();
    const { getByRole } = render(
      <SocialButton provider="google" onPress={onPress} />
    );
    fireEvent.press(getByRole("button"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("has correct accessibilityLabel", () => {
    const { getByRole } = render(
      <SocialButton provider="google" onPress={() => {}} />
    );
    expect(getByRole("button").props.accessibilityLabel).toBe(
      "Sign in with GOOGLE"
    );
  });
});
