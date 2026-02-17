import React, { createContext, useContext, useRef, useCallback, useEffect } from "react";
import { getItem, setItem, removeItem } from "@/lib/asyncStorage";
import type { Recipe } from "@/types";

// ── Types ──

export interface PendingAction {
  type: "save_recipe";
  payload: { recipeId: string; recipe: Recipe };
}

export interface AuthRedirectSnapshot {
  previousRoute: string | null;
  pendingAction: PendingAction | null;
}

interface AuthRedirectContextValue {
  /** Snapshot the current route and optional pending action before navigating to auth. */
  setSnapshot: (route: string, action?: PendingAction) => void;
  /** Consume and clear the snapshot. Returns null if none exists. */
  consumeSnapshot: () => Promise<AuthRedirectSnapshot | null>;
}

const STORAGE_KEY = "auth_redirect_snapshot";

const AuthRedirectContext = createContext<AuthRedirectContextValue | undefined>(
  undefined
);

// ── Provider ──

export function AuthRedirectProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const snapshotRef = useRef<AuthRedirectSnapshot | null>(null);

  // Restore any persisted snapshot on mount (e.g. app backgrounded during OAuth)
  useEffect(() => {
    getItem<AuthRedirectSnapshot>(STORAGE_KEY).then((persisted) => {
      if (persisted && !snapshotRef.current) {
        snapshotRef.current = persisted;
      }
    });
  }, []);

  const setSnapshot = useCallback(
    (route: string, action?: PendingAction) => {
      const snapshot: AuthRedirectSnapshot = {
        previousRoute: route,
        pendingAction: action ?? null,
      };
      snapshotRef.current = snapshot;
      // Persist in case the app backgrounds (e.g. during OAuth redirect)
      setItem(STORAGE_KEY, snapshot);
    },
    []
  );

  const consumeSnapshot = useCallback(async (): Promise<AuthRedirectSnapshot | null> => {
    const snapshot = snapshotRef.current;
    snapshotRef.current = null;
    await removeItem(STORAGE_KEY);
    return snapshot;
  }, []);

  return (
    <AuthRedirectContext.Provider value={{ setSnapshot, consumeSnapshot }}>
      {children}
    </AuthRedirectContext.Provider>
  );
}

// ── Hook ──

export function useAuthRedirect(): AuthRedirectContextValue {
  const context = useContext(AuthRedirectContext);
  if (!context) {
    throw new Error(
      "useAuthRedirect must be used within an AuthRedirectProvider"
    );
  }
  return context;
}
