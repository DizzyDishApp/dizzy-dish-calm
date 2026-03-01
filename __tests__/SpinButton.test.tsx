import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { SpinButton } from "@/components/SpinButton";
import { haptic } from "@/lib/haptics";

describe("SpinButton", () => {
  const defaultProps = {
    onPress: jest.fn(),
    weeklyMode: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders without crashing", () => {
    const { toJSON } = render(<SpinButton {...defaultProps} />);
    expect(toJSON()).toBeTruthy();
  });

  it("displays 'decide for me' label", () => {
    const { getByText } = render(<SpinButton {...defaultProps} />);
    expect(getByText("decide for me")).toBeTruthy();
  });

  it("shows 'tap to spin' hint in single mode", () => {
    const { getByText } = render(
      <SpinButton {...defaultProps} weeklyMode={false} />
    );
    expect(getByText("tap to spin")).toBeTruthy();
  });

  it("shows 'tap for 7 meals' hint in weekly mode", () => {
    const { getByText } = render(
      <SpinButton {...defaultProps} weeklyMode={true} />
    );
    expect(getByText("tap for 7 meals")).toBeTruthy();
  });

  it("calls onPress and haptic.heavy on press", () => {
    const onPress = jest.fn();
    const { getByRole } = render(
      <SpinButton {...defaultProps} onPress={onPress} />
    );
    fireEvent.press(getByRole("button"));
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(haptic.heavy).toHaveBeenCalledTimes(1);
  });

  it("does not call onPress when disabled", () => {
    const onPress = jest.fn();
    const { getByRole } = render(
      <SpinButton {...defaultProps} onPress={onPress} disabled />
    );
    fireEvent.press(getByRole("button"));
    expect(onPress).not.toHaveBeenCalled();
  });

  it("sets accessibilityLabel for single mode", () => {
    const { getByLabelText } = render(
      <SpinButton {...defaultProps} weeklyMode={false} />
    );
    expect(getByLabelText("Spin for a recipe")).toBeTruthy();
  });

  it("sets accessibilityLabel for weekly mode", () => {
    const { getByLabelText } = render(
      <SpinButton {...defaultProps} weeklyMode={true} />
    );
    expect(getByLabelText("Spin for weekly plan")).toBeTruthy();
  });

  it("sets accessibilityState.disabled when disabled", () => {
    const { getByRole } = render(
      <SpinButton {...defaultProps} disabled />
    );
    expect(getByRole("button").props.accessibilityState).toEqual({
      disabled: true,
    });
  });

  it("has correct button dimensions (200px)", () => {
    const { getByRole } = render(<SpinButton {...defaultProps} />);
    const button = getByRole("button");
    expect(button.props.style.width).toBe(200);
    expect(button.props.style.height).toBe(200);
  });
});
