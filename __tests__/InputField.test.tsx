import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { InputField } from "@/components/InputField";

describe("InputField", () => {
  it("renders with placeholder", () => {
    const { getByPlaceholderText } = render(
      <InputField placeholder="you@email.com" />
    );
    expect(getByPlaceholderText("you@email.com")).toBeTruthy();
  });

  it("fires onChangeText when typing", () => {
    const onChangeText = jest.fn();
    const { getByPlaceholderText } = render(
      <InputField placeholder="Enter text" onChangeText={onChangeText} />
    );
    fireEvent.changeText(getByPlaceholderText("Enter text"), "hello");
    expect(onChangeText).toHaveBeenCalledWith("hello");
  });

  it("respects secureTextEntry prop", () => {
    const { getByPlaceholderText } = render(
      <InputField placeholder="Password" secureTextEntry />
    );
    expect(getByPlaceholderText("Password").props.secureTextEntry).toBe(true);
  });

  it("respects editable prop", () => {
    const { getByPlaceholderText } = render(
      <InputField placeholder="Disabled" editable={false} />
    );
    expect(getByPlaceholderText("Disabled").props.editable).toBe(false);
  });

  it("sets autoCapitalize to none by default", () => {
    const { getByPlaceholderText } = render(
      <InputField placeholder="Test" />
    );
    expect(getByPlaceholderText("Test").props.autoCapitalize).toBe("none");
  });
});
