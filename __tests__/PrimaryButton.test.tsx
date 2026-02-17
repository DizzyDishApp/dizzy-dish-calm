import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { PrimaryButton } from "@/components/PrimaryButton";

describe("PrimaryButton", () => {
  it("renders label text", () => {
    const { getByText } = render(
      <PrimaryButton label="GET STARTED" onPress={() => {}} />
    );
    expect(getByText("GET STARTED")).toBeTruthy();
  });

  it("shows LoadingDots when loading=true and hides label", () => {
    const { queryByText, getByRole } = render(
      <PrimaryButton label="SUBMIT" onPress={() => {}} loading />
    );
    // Label should not be rendered when loading
    expect(queryByText("SUBMIT")).toBeNull();
    // Button should indicate busy state
    expect(getByRole("button").props.accessibilityState).toEqual({ busy: true });
  });

  it("does not fire onPress when loading", () => {
    const onPress = jest.fn();
    const { getByRole } = render(
      <PrimaryButton label="GO" onPress={onPress} loading />
    );
    fireEvent.press(getByRole("button"));
    expect(onPress).not.toHaveBeenCalled();
  });

  it("fires onPress when not loading", () => {
    const onPress = jest.fn();
    const { getByRole } = render(
      <PrimaryButton label="GO" onPress={onPress} />
    );
    fireEvent.press(getByRole("button"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("has correct accessibility props", () => {
    const { getByRole } = render(
      <PrimaryButton
        label="GO"
        onPress={() => {}}
        accessibilityLabel="Go button"
      />
    );
    const button = getByRole("button");
    expect(button.props.accessibilityLabel).toBe("Go button");
    expect(button.props.accessibilityState).toEqual({ busy: false });
  });

  it("uses label as accessibilityLabel when none provided", () => {
    const { getByRole } = render(
      <PrimaryButton label="START" onPress={() => {}} />
    );
    expect(getByRole("button").props.accessibilityLabel).toBe("START");
  });
});
