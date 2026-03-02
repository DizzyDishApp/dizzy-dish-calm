import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import type { Recipe, WeeklyPlan } from "@/types";

// @/lib/haptics is globally mocked in jest.setup.js

import { SpinResultCard } from "@/components/SpinResultCard";

const mockRecipe: Recipe = {
  id: "test-1",
  name: "Spicy Lentil Soup",
  time: "35 min",
  calories: "420 cal",
  servings: "4 servings",
  description: "A hearty soup",
  tags: ["Vegan", "Gluten Free"],
  emoji: "\uD83C\uDF5C",
};

const mockPlan: WeeklyPlan = {
  id: "plan-1",
  days: [
    { day: "Monday", recipe: { ...mockRecipe, id: "r1", name: "Pasta Primavera", emoji: "\uD83C\uDF5D" } },
    { day: "Tuesday", recipe: { ...mockRecipe, id: "r2", name: "Grilled Chicken", emoji: "\uD83C\uDF57" } },
    { day: "Wednesday", recipe: { ...mockRecipe, id: "r3", name: "Fish Tacos", emoji: "\uD83C\uDF2E" } },
    { day: "Thursday", recipe: { ...mockRecipe, id: "r4", name: "Veggie Stir Fry", emoji: "\uD83E\uDD5F" } },
    { day: "Friday", recipe: { ...mockRecipe, id: "r5", name: "Pizza Night", emoji: "\uD83C\uDF55" } },
    { day: "Saturday", recipe: { ...mockRecipe, id: "r6", name: "Burger Bash", emoji: "\uD83C\uDF54" } },
    { day: "Sunday", recipe: { ...mockRecipe, id: "r7", name: "Roast Dinner", emoji: "\uD83C\uDF56" } },
  ],
  sharedIngredients: [],
  totalItems: 35,
  reducedItems: 28,
};

describe("SpinResultCard", () => {
  describe("recipe variant", () => {
    it("renders recipe name and emoji", () => {
      const { getByText } = render(
        <SpinResultCard
          result={{ type: "recipe", data: mockRecipe }}
          onViewFullRecipe={jest.fn()}
          onSpinAgain={jest.fn()}
        />
      );
      expect(getByText("Spicy Lentil Soup")).toBeTruthy();
      expect(getByText("\uD83C\uDF5C")).toBeTruthy();
    });

    it("renders meta pills for time, calories, servings", () => {
      const { getByText } = render(
        <SpinResultCard
          result={{ type: "recipe", data: mockRecipe }}
          onViewFullRecipe={jest.fn()}
          onSpinAgain={jest.fn()}
        />
      );
      expect(getByText("35 min")).toBeTruthy();
      expect(getByText("420 cal")).toBeTruthy();
      expect(getByText("4 servings")).toBeTruthy();
    });

    it("renders HeartButton when onToggleSave is provided", () => {
      const { getByLabelText } = render(
        <SpinResultCard
          result={{ type: "recipe", data: mockRecipe }}
          saved={false}
          onToggleSave={jest.fn()}
          onViewFullRecipe={jest.fn()}
          onSpinAgain={jest.fn()}
        />
      );
      expect(getByLabelText("Save recipe")).toBeTruthy();
    });

    it("does not render HeartButton when onToggleSave is not provided", () => {
      const { queryByLabelText } = render(
        <SpinResultCard
          result={{ type: "recipe", data: mockRecipe }}
          onViewFullRecipe={jest.fn()}
          onSpinAgain={jest.fn()}
        />
      );
      expect(queryByLabelText("Save recipe")).toBeNull();
      expect(queryByLabelText("Unsave recipe")).toBeNull();
    });

    it("renders View full recipe button", () => {
      const { getByLabelText } = render(
        <SpinResultCard
          result={{ type: "recipe", data: mockRecipe }}
          onViewFullRecipe={jest.fn()}
          onSpinAgain={jest.fn()}
        />
      );
      expect(getByLabelText("View full recipe details")).toBeTruthy();
    });

    it("fires onViewFullRecipe when View button is pressed", () => {
      const onView = jest.fn();
      const { getByLabelText } = render(
        <SpinResultCard
          result={{ type: "recipe", data: mockRecipe }}
          onViewFullRecipe={onView}
          onSpinAgain={jest.fn()}
        />
      );
      fireEvent.press(getByLabelText("View full recipe details"));
      expect(onView).toHaveBeenCalledTimes(1);
    });

    it("fires onSpinAgain when Spin again button is pressed", () => {
      const onSpin = jest.fn();
      const { getByLabelText } = render(
        <SpinResultCard
          result={{ type: "recipe", data: mockRecipe }}
          onViewFullRecipe={jest.fn()}
          onSpinAgain={onSpin}
        />
      );
      fireEvent.press(getByLabelText("Spin for another recipe"));
      expect(onSpin).toHaveBeenCalledTimes(1);
    });

    it("does not show calories pill when calories is dash", () => {
      const recipe = { ...mockRecipe, calories: "—" };
      const { queryByText } = render(
        <SpinResultCard
          result={{ type: "recipe", data: recipe }}
          onViewFullRecipe={jest.fn()}
          onSpinAgain={jest.fn()}
        />
      );
      expect(queryByText("—")).toBeNull();
    });
  });

  describe("weekly plan variant", () => {
    it("renders plan heading", () => {
      const { getByText } = render(
        <SpinResultCard
          result={{ type: "plan", data: mockPlan }}
          onViewFullRecipe={jest.fn()}
          onSpinAgain={jest.fn()}
        />
      );
      expect(getByText("Your 7-day plan is ready")).toBeTruthy();
    });

    it("shows first 3 day previews", () => {
      const { getByText } = render(
        <SpinResultCard
          result={{ type: "plan", data: mockPlan }}
          onViewFullRecipe={jest.fn()}
          onSpinAgain={jest.fn()}
        />
      );
      expect(getByText("Mon")).toBeTruthy();
      expect(getByText("Pasta Primavera")).toBeTruthy();
      expect(getByText("Tue")).toBeTruthy();
      expect(getByText("Grilled Chicken")).toBeTruthy();
      expect(getByText("Wed")).toBeTruthy();
      expect(getByText("Fish Tacos")).toBeTruthy();
    });

    it("shows +N more for remaining days", () => {
      const { getByText } = render(
        <SpinResultCard
          result={{ type: "plan", data: mockPlan }}
          onViewFullRecipe={jest.fn()}
          onSpinAgain={jest.fn()}
        />
      );
      expect(getByText("+4 more")).toBeTruthy();
    });

    it("does not render HeartButton for plan variant", () => {
      const { queryByLabelText } = render(
        <SpinResultCard
          result={{ type: "plan", data: mockPlan }}
          onViewFullRecipe={jest.fn()}
          onSpinAgain={jest.fn()}
        />
      );
      expect(queryByLabelText("Save recipe")).toBeNull();
      expect(queryByLabelText("Unsave recipe")).toBeNull();
    });

    it("renders View full plan button", () => {
      const { getByLabelText } = render(
        <SpinResultCard
          result={{ type: "plan", data: mockPlan }}
          onViewFullRecipe={jest.fn()}
          onSpinAgain={jest.fn()}
        />
      );
      expect(getByLabelText("View full weekly plan")).toBeTruthy();
    });

    it("fires onSpinAgain when Spin again button is pressed", () => {
      const onSpin = jest.fn();
      const { getByLabelText } = render(
        <SpinResultCard
          result={{ type: "plan", data: mockPlan }}
          onViewFullRecipe={jest.fn()}
          onSpinAgain={onSpin}
        />
      );
      fireEvent.press(getByLabelText("Spin for another plan"));
      expect(onSpin).toHaveBeenCalledTimes(1);
    });
  });
});
