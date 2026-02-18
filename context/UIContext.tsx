import React, { createContext, useContext, useReducer } from "react";

// ── State ──

interface UIState {
  isSpinning: boolean;
  toastMessage: string | null;
  toastVariant: "default" | "error" | null;
  toastVisible: boolean;
}

const initialState: UIState = {
  isSpinning: false,
  toastMessage: null,
  toastVariant: null,
  toastVisible: false,
};

// ── Actions ──

type UIAction =
  | { type: "SET_SPINNING"; payload: boolean }
  | { type: "SHOW_TOAST"; payload: { message: string; variant?: "default" | "error" } }
  | { type: "HIDE_TOAST" };

// ── Reducer ──

function uiReducer(state: UIState, action: UIAction): UIState {
  switch (action.type) {
    case "SET_SPINNING":
      return { ...state, isSpinning: action.payload };
    case "SHOW_TOAST":
      return {
        ...state,
        toastMessage: action.payload.message,
        toastVariant: action.payload.variant ?? "default",
        toastVisible: true,
      };
    case "HIDE_TOAST":
      return { ...state, toastMessage: null, toastVariant: null, toastVisible: false };
    default:
      return state;
  }
}

// ── Context ──

interface UIContextValue {
  state: UIState;
  setSpinning: (spinning: boolean) => void;
  showToast: (message: string, variant?: "default" | "error") => void;
  hideToast: () => void;
}

const UIContext = createContext<UIContextValue | undefined>(undefined);

// ── Provider ──

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(uiReducer, initialState);

  const setSpinning = (spinning: boolean) => {
    dispatch({ type: "SET_SPINNING", payload: spinning });
  };

  const showToast = (message: string, variant?: "default" | "error") => {
    dispatch({ type: "SHOW_TOAST", payload: { message, variant } });
  };

  const hideToast = () => {
    dispatch({ type: "HIDE_TOAST" });
  };

  return (
    <UIContext.Provider value={{ state, setSpinning, showToast, hideToast }}>
      {children}
    </UIContext.Provider>
  );
}

// ── Hook ──

export function useUI(): UIContextValue {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error("useUI must be used within a UIProvider");
  }
  return context;
}
