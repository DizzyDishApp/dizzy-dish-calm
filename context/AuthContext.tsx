import React, { createContext, useContext, useEffect, useReducer } from "react";
import type { Session } from "@supabase/supabase-js";
import type { User } from "@/types";
import { supabase } from "@/lib/supabase";
import { logInRevenueCat, logOutRevenueCat } from "@/lib/revenueCat";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import * as AppleAuthentication from "expo-apple-authentication";

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

export function authReducer(state: AuthState, action: AuthAction): AuthState {
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

export function mapSupabaseUser(session: Session): User {
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
  signInWithGoogle: () => Promise<{ error: string | null }>;
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
        logInRevenueCat(session.user.id);
      } else {
        dispatch({ type: "CLEAR_SESSION" });
        logOutRevenueCat();
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

  const signInWithApple = async (): Promise<{ error: string | null }> => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      const { error } = await supabase.auth.signInWithIdToken({
        provider: "apple",
        token: credential.identityToken!,
      });
      if (error) return { error: error.message };
      return { error: null };
    } catch (e: unknown) {
      if ((e as any).code === "ERR_REQUEST_CANCELED") return { error: null };
      const message = e instanceof Error ? e.message : "Apple sign-in failed.";
      return { error: message };
    }
  };

  const signInWithGoogle = async (): Promise<{ error: string | null }> => {
    try {
      const redirectTo = Linking.createURL("auth/callback");

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo, skipBrowserRedirect: true },
      });

      if (error) return { error: error.message };
      if (!data.url) return { error: "No OAuth URL returned." };

      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectTo,
        { preferEphemeralSession: false }
      );

      if (result.type !== "success") {
        return { error: null }; // user cancelled — not an error
      }

      // Extract tokens from the redirect URL fragment
      const url = result.url;
      const params = new URLSearchParams(
        url.includes("#") ? url.split("#")[1] : url.split("?")[1]
      );
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");

      if (accessToken && refreshToken) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (sessionError) return { error: sessionError.message };
      }

      return { error: null };
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Google sign-in failed.";
      return { error: message };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ state, signUp, signIn, signInWithGoogle, signInWithApple, signOut }}>
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
