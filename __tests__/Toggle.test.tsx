import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { Toggle } from "@/components/Toggle";
import { haptic } from "@/lib/haptics";

describe("Toggle", () => {
  const defaultProps = {
    value: false,
    onToggle: jest.fn(),
    accessibilityLabel: "Test toggle",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders without crashing", () => {
    const { toJSON } = render(<Toggle {...defaultProps} />);
    expect(toJSON()).toBeTruthy();
  });

  it("calls onToggle with inverted value on press", () => {
    const onToggle = jest.fn();
    const { getByRole } = render(
      <Toggle {...defaultProps} value={false} onToggle={onToggle} />
    );
    fireEvent.press(getByRole("switch"));
    expect(onToggle).toHaveBeenCalledWith(true);
  });

  it("calls onToggle(false) when currently on", () => {
    const onToggle = jest.fn();
    const { getByRole } = render(
      <Toggle {...defaultProps} value={true} onToggle={onToggle} />
    );
    fireEvent.press(getByRole("switch"));
    expect(onToggle).toHaveBeenCalledWith(false);
  });

  it("fires haptic.select on press", () => {
    const { getByRole } = render(<Toggle {...defaultProps} />);
    fireEvent.press(getByRole("switch"));
    expect(haptic.select).toHaveBeenCalledTimes(1);
  });

  it("sets accessibilityRole to switch", () => {
    const { getByRole } = render(<Toggle {...defaultProps} />);
    expect(getByRole("switch")).toBeTruthy();
  });

  it("sets accessibilityState.checked matching value", () => {
    const { getByRole, rerender } = render(
      <Toggle {...defaultProps} value={false} />
    );
    expect(getByRole("switch").props.accessibilityState).toEqual({
      checked: false,
    });

    rerender(<Toggle {...defaultProps} value={true} />);
    expect(getByRole("switch").props.accessibilityState).toEqual({
      checked: true,
    });
  });

  it("passes accessibilityLabel through", () => {
    const { getByLabelText } = render(
      <Toggle {...defaultProps} accessibilityLabel="Weekly plan toggle" />
    );
    expect(getByLabelText("Weekly plan toggle")).toBeTruthy();
  });

  it("defaults variant to warm", () => {
    const { getByRole } = render(<Toggle {...defaultProps} value={true} />);
    // Warm on-color is #C65D3D
    const toggle = getByRole("switch");
    expect(toggle.props.style.backgroundColor).toBe("#C65D3D");
  });

  it("uses green color when variant is green", () => {
    const { getByRole } = render(
      <Toggle {...defaultProps} value={true} variant="green" />
    );
    const toggle = getByRole("switch");
    expect(toggle.props.style.backgroundColor).toBe("#5B8C6A");
  });

  it("uses off color when value is false", () => {
    const { getByRole } = render(<Toggle {...defaultProps} value={false} />);
    const toggle = getByRole("switch");
    expect(toggle.props.style.backgroundColor).toBe("#E8E3DD");
  });
});
