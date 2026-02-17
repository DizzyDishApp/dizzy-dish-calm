import React, { createContext, useContext, useEffect, useReducer } from "react";
import type { Session } from "@supabase/supabase-js";
import type { User } from "@/types";
import { supabase } from "@/lib/supabase";

// ── State ──

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,
};

// ── Actions ──

type AuthAction =
  | { type: "SET_SESSION"; payload: { user: User; session: Session } }
  | { type: "CLEAR_SESSION" }
  | { type: "SET_LOADING"; payload: boolean };

// ── Reducer ──

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "SET_SESSION":
      return {
        ...state,
        user: action.payload.user,
        session: action.payload.session,
        isAuthenticated: true,
        isLoading: false,
      };
    case "CLEAR_SESSION":
      return {
        ...state,
        user: null,
        session: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
}

// ── Helpers ──

function mapSupabaseUser(session: Session): User {
  const su = session.user;
  return {
    id: su.id,
    email: su.email ?? "",
    displayName:
      su.user_metadata?.full_name ??
      su.user_metadata?.display_name ??
      su.email?.split("@")[0],
    avatarUrl: su.user_metadata?.avatar_url,
    isPro: false,
    instacartConnected: false,
  };
}

// ── Context ──

interface AuthContextValue {
  state: AuthState;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ── Provider ──

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    // Get existing session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        dispatch({
          type: "SET_SESSION",
          payload: { user: mapSupabaseUser(session), session },
        });
      } else {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    });

    // Listen for auth changes (sign in, sign out, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        dispatch({
          type: "SET_SESSION",
          payload: { user: mapSupabaseUser(session), session },
        });
      } else {
        dispatch({ type: "CLEAR_SESSION" });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (
    email: string,
    password: string
  ): Promise<{ error: string | null }> => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) return { error: error.message };
    return { error: null };
  };

  const signIn = async (
    email: string,
    password: string
  ): Promise<{ error: string | null }> => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) return { error: error.message };
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ state, signUp, signIn, signOut }}>
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
