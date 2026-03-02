import React from "react";
import { render } from "@testing-library/react-native";
import { haptic } from "@/lib/haptics";
import { InlineSpinWheel } from "@/components/SpinningOverlay";

// @/lib/haptics is globally mocked in jest.setup.js

describe("InlineSpinWheel", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    (haptic.success as jest.Mock).mockClear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("renders wheel and status text", () => {
    const { getByText, getByLabelText } = render(
      <InlineSpinWheel onComplete={jest.fn()} />
    );
    expect(getByLabelText("Spinning for a recipe")).toBeTruthy();
    expect(getByText("finding your meal...")).toBeTruthy();
  });

  it("calls haptic.success at 2000ms", () => {
    render(<InlineSpinWheel onComplete={jest.fn()} />);

    jest.advanceTimersByTime(1999);
    expect(haptic.success).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1);
    expect(haptic.success).toHaveBeenCalledTimes(1);
  });

  it("calls onComplete at 2400ms (after bounce exit)", () => {
    const onComplete = jest.fn();
    render(<InlineSpinWheel onComplete={onComplete} />);

    jest.advanceTimersByTime(2399);
    expect(onComplete).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});
