import React, { createContext, useContext, useEffect, useReducer } from "react";
import type { DietaryFilter, TimeFilter, CalorieFilter } from "@/types";
import { getItem, setItem, StorageKeys } from "@/lib/asyncStorage";

// ── State ──

interface PreferencesState {
  dietary: Set<DietaryFilter>;
  time: TimeFilter;
  calories: CalorieFilter;
  weeklyMode: boolean;
}

const initialState: PreferencesState = {
  dietary: new Set<DietaryFilter>(),
  time: "Any",
  calories: "Any",
  weeklyMode: false,
};

// ── Serialization helpers for Set ──

// Bump this when changing defaults so persisted stale values get replaced.
const PREFS_VERSION = 2;

interface SerializedPreferences {
  version?: number;
  dietary: string[];
  time: TimeFilter;
  calories: CalorieFilter;
  weeklyMode: boolean;
}

function serialize(state: PreferencesState): SerializedPreferences {
  return {
    version: PREFS_VERSION,
    dietary: Array.from(state.dietary),
    time: state.time,
    calories: state.calories,
    weeklyMode: state.weeklyMode,
  };
}

const VALID_DIETARY: ReadonlySet<string> = new Set<string>([
  "Vegetarian", "Vegan", "Gluten Free", "Dairy Free", "Sugar Free",
  "No Pork", "No Beef", "No Peanuts", "No Tree Nuts", "No Shrimp",
  "No Shellfish", "No Fish", "No Soy", "No Eggs", "No Sesame",
  "Keto", "Paleo", "Pescatarian", "Low FODMAP",
]);

function deserialize(data: SerializedPreferences): PreferencesState {
  // Strip any invalid values that were incorrectly stored in dietary
  // (e.g. "Under 30 Min" was cast as DietaryFilter in v1).
  const cleanDietary = new Set<DietaryFilter>(
    data.dietary.filter((d) => VALID_DIETARY.has(d)) as DietaryFilter[]
  );

  // If persisted data is from an older version, only restore dietary
  // selections and weeklyMode — let time/calories use the new defaults.
  if (!data.version || data.version < PREFS_VERSION) {
    return {
      ...initialState,
      dietary: cleanDietary,
      weeklyMode: data.weeklyMode,
    };
  }
  return {
    dietary: cleanDietary,
    time: data.time,
    calories: data.calories,
    weeklyMode: data.weeklyMode,
  };
}

// ── Actions ──

type PreferencesAction =
  | { type: "TOGGLE_DIETARY"; payload: DietaryFilter }
  | { type: "SET_TIME"; payload: TimeFilter }
  | { type: "SET_CALORIES"; payload: CalorieFilter }
  | { type: "SET_WEEKLY_MODE"; payload: boolean }
  | { type: "RESTORE"; payload: PreferencesState };

// ── Reducer ──

function preferencesReducer(
  state: PreferencesState,
  action: PreferencesAction
): PreferencesState {
  switch (action.type) {
    case "TOGGLE_DIETARY": {
      const next = new Set(state.dietary);
      if (next.has(action.payload)) {
        next.delete(action.payload);
      } else {
        next.add(action.payload);
      }
      return { ...state, dietary: next };
    }
    case "SET_TIME":
      return { ...state, time: action.payload };
    case "SET_CALORIES":
      return { ...state, calories: action.payload };
    case "SET_WEEKLY_MODE":
      return { ...state, weeklyMode: action.payload };
    case "RESTORE":
      return action.payload;
    default:
      return state;
  }
}

// ── Context ──

interface PreferencesContextValue {
  state: PreferencesState;
  toggleDietary: (filter: DietaryFilter) => void;
  setTime: (filter: TimeFilter) => void;
  setCalories: (filter: CalorieFilter) => void;
  setWeeklyMode: (weekly: boolean) => void;
}

const PreferencesContext = createContext<PreferencesContextValue | undefined>(
  undefined
);

// ── Provider ──

export function PreferencesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, dispatch] = useReducer(preferencesReducer, initialState);

  // Restore from AsyncStorage. The deserialize function handles version
  // migration — stale v1 data gets new defaults for time/calories.
  useEffect(() => {
    async function restore() {
      const saved = await getItem<SerializedPreferences>(
        StorageKeys.PREFERENCES
      );
      if (saved) {
        dispatch({ type: "RESTORE", payload: deserialize(saved) });
      }
    }
    restore();
  }, []);

  // Persist on change
  useEffect(() => {
    setItem(StorageKeys.PREFERENCES, serialize(state));
  }, [state]);

  const toggleDietary = (filter: DietaryFilter) => {
    dispatch({ type: "TOGGLE_DIETARY", payload: filter });
  };

  const setTime = (filter: TimeFilter) => {
    dispatch({ type: "SET_TIME", payload: filter });
  };

  const setCalories = (filter: CalorieFilter) => {
    dispatch({ type: "SET_CALORIES", payload: filter });
  };

  const setWeeklyMode = (weekly: boolean) => {
    dispatch({ type: "SET_WEEKLY_MODE", payload: weekly });
  };

  return (
    <PreferencesContext.Provider
      value={{ state, toggleDietary, setTime, setCalories, setWeeklyMode }}
    >
      {children}
    </PreferencesContext.Provider>
  );
}

// ── Hook ──

export function usePreferences(): PreferencesContextValue {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error(
      "usePreferences must be used within a PreferencesProvider"
    );
  }
  return context;
}
