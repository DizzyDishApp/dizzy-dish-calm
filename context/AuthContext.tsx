import React, { createContext, useContext, useEffect, useReducer } from "react";
import type { User } from "@/types";
import { getItem, setItem, removeItem, StorageKeys } from "@/lib/asyncStorage";

// ── State ──

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
};

// ── Actions ──

type AuthAction =
  | { type: "SET_USER"; payload: { user: User; token: string } }
  | { type: "LOGOUT" }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "RESTORE_SESSION"; payload: { user: User; token: string } };

// ── Reducer ──

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "SET_USER":
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };
    case "RESTORE_SESSION":
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };
    case "LOGOUT":
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
}

// ── Context ──

interface AuthContextValue {
  state: AuthState;
  login: (user: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ── Provider ──

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Restore session from AsyncStorage on mount
  useEffect(() => {
    async function restoreSession() {
      try {
        const token = await getItem<string>(StorageKeys.AUTH_TOKEN);
        const user = await getItem<User>(StorageKeys.USER);
        if (token && user) {
          dispatch({ type: "RESTORE_SESSION", payload: { user, token } });
        } else {
          dispatch({ type: "SET_LOADING", payload: false });
        }
      } catch {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    }
    restoreSession();
  }, []);

  const login = async (user: User, token: string) => {
    await setItem(StorageKeys.AUTH_TOKEN, token);
    await setItem(StorageKeys.USER, user);
    dispatch({ type: "SET_USER", payload: { user, token } });
  };

  const logout = async () => {
    await removeItem(StorageKeys.AUTH_TOKEN);
    await removeItem(StorageKeys.USER);
    dispatch({ type: "LOGOUT" });
  };

  return (
    <AuthContext.Provider value={{ state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ──

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
