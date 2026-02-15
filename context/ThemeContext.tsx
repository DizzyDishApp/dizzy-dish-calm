import React, { createContext, useContext, useEffect, useReducer } from "react";
import type { ThemeMode } from "@/types";
import { getItem, setItem, StorageKeys } from "@/lib/asyncStorage";

// ── State ──

interface ThemeState {
  mode: ThemeMode;
}

const initialState: ThemeState = {
  mode: "light",
};

// ── Actions ──

type ThemeAction =
  | { type: "SET_THEME"; payload: ThemeMode }
  | { type: "TOGGLE_THEME" };

// ── Reducer ──

function themeReducer(state: ThemeState, action: ThemeAction): ThemeState {
  switch (action.type) {
    case "SET_THEME":
      return { ...state, mode: action.payload };
    case "TOGGLE_THEME":
      return { ...state, mode: state.mode === "light" ? "dark" : "light" };
    default:
      return state;
  }
}

// ── Context ──

interface ThemeContextValue {
  state: ThemeState;
  setTheme: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

// ── Provider ──

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(themeReducer, initialState);

  // Restore theme from AsyncStorage
  useEffect(() => {
    async function restore() {
      const saved = await getItem<ThemeMode>(StorageKeys.THEME);
      if (saved) {
        dispatch({ type: "SET_THEME", payload: saved });
      }
    }
    restore();
  }, []);

  // Persist theme changes
  useEffect(() => {
    setItem(StorageKeys.THEME, state.mode);
  }, [state.mode]);

  const setTheme = (mode: ThemeMode) => {
    dispatch({ type: "SET_THEME", payload: mode });
  };

  const toggleTheme = () => {
    dispatch({ type: "TOGGLE_THEME" });
  };

  return (
    <ThemeContext.Provider value={{ state, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// ── Hook ──

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
