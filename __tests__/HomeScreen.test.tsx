import React from "react";
import { render } from "@testing-library/react-native";

// ── Mocks ──

let mockPrefs = {
  dietary: new Set(),
  time: "Any" as const,
  calories: "Any" as const,
  weeklyMode: false,
};

jest.mock("@/context/PreferencesContext", () => ({
  usePreferences: () => ({
    state: mockPrefs,
    setWeeklyMode: jest.fn(),
  }),
}));

jest.mock("@/context/AuthContext", () => ({
  useAuth: () => ({
    state: { isAuthenticated: false, isLoading: false, user: null, session: null },
  }),
}));

jest.mock("@/hooks/useUserProfile", () => ({
  useUserProfile: () => ({ data: { isPro: false } }),
  useSubscription: jest.fn(),
  useRevenueCatInfo: jest.fn(),
}));

jest.mock("@/context/UIContext", () => ({
  useUI: () => ({
    state: { isSpinning: false, toastMessage: null, toastVariant: "default" },
    setSpinning: jest.fn(),
    showToast: jest.fn(),
  }),
}));

jest.mock("@/context/AuthRedirectContext", () => ({
  useAuthRedirect: () => ({
    setSnapshot: jest.fn(),
  }),
}));

jest.mock("@/hooks/useSpinRecipe", () => ({
  useSpinRecipe: () => ({ mutate: jest.fn() }),
  useSpinWeeklyPlan: () => ({ mutate: jest.fn() }),
}));

jest.mock("@/hooks/useRecipePool", () => ({
  useRecipePool: () => ({
    isLoading: false,
    isError: false,
    isSuccess: true,
    data: [],
    error: null,
  }),
}));

jest.mock("@/hooks/useGuestSpinLimit", () => ({
  useGuestSpinLimit: () => ({
    isLimitReached: false,
    spinsRemaining: 3,
    incrementSpinCount: jest.fn(),
  }),
}));

jest.mock("expo-image", () => {
  const React = require("react");
  const { View } = require("react-native");
  return {
    Image: (props: Record<string, unknown>) =>
      React.createElement(View, { ...props, testID: "expo-image" }),
  };
});

import HomeScreen from "@/app/index";

describe("HomeScreen", () => {
  beforeEach(() => {
    mockPrefs = {
      dietary: new Set(),
      time: "Any",
      calories: "Any",
      weeklyMode: false,
    };
  });

  it("renders without crashing", () => {
    const { toJSON } = render(<HomeScreen />);
    expect(toJSON()).toBeTruthy();
  });

  it("shows 'What's Cooking?' heading", () => {
    const { getByText } = render(<HomeScreen />);
    expect(getByText("What's Cooking?")).toBeTruthy();
  });

  it("shows bottom nav tabs: me, spin, saved", () => {
    const { getByText } = render(<HomeScreen />);
    expect(getByText("me")).toBeTruthy();
    expect(getByText("spin")).toBeTruthy();
    expect(getByText("saved")).toBeTruthy();
  });

  it("shows 'Single recipe' label when weeklyMode is off", () => {
    const { getByText } = render(<HomeScreen />);
    expect(getByText("Single recipe")).toBeTruthy();
  });

  it("shows weekly plan label when weeklyMode is on", () => {
    mockPrefs.weeklyMode = true;
    const { getByText } = render(<HomeScreen />);
    expect(getByText(/Weekly plan/)).toBeTruthy();
  });

  // ── Context line tests ──

  it("does not show context line when all defaults (Any/Any/no dietary)", () => {
    const { queryByText } = render(<HomeScreen />);
    // No filter text should appear
    expect(queryByText("< 30 min")).toBeNull();
    expect(queryByText("< 60 min")).toBeNull();
    expect(queryByText("Light")).toBeNull();
    expect(queryByText("Hearty")).toBeNull();
  });

  it("shows time filter in context line", () => {
    mockPrefs.time = "Under 30 Min";
    const { getByText } = render(<HomeScreen />);
    expect(getByText(/< 30 min/)).toBeTruthy();
  });

  it("shows calorie filter in context line", () => {
    mockPrefs.calories = "Light";
    const { getByText } = render(<HomeScreen />);
    expect(getByText(/Light/)).toBeTruthy();
  });

  it("shows dietary filters in context line", () => {
    mockPrefs.dietary = new Set(["Vegan", "Gluten Free"]);
    const { getByText } = render(<HomeScreen />);
    expect(getByText(/Vegan/)).toBeTruthy();
    expect(getByText(/Gluten Free/)).toBeTruthy();
  });

  it("shows combined filters separated by dots", () => {
    mockPrefs.time = "Under 30 Min";
    mockPrefs.calories = "Light";
    mockPrefs.dietary = new Set(["Vegan"]);
    const { getByText } = render(<HomeScreen />);
    expect(getByText("< 30 min · Light · Vegan")).toBeTruthy();
  });

  // ── Active filter indicator ──

  it("shows plain Menu label when no filters active", () => {
    const { getByLabelText } = render(<HomeScreen />);
    expect(getByLabelText("Menu")).toBeTruthy();
  });

  it("shows 'Menu — filters active' label when filters are set", () => {
    mockPrefs.time = "Under 30 Min";
    const { getByLabelText } = render(<HomeScreen />);
    expect(getByLabelText("Menu — filters active")).toBeTruthy();
  });
});
