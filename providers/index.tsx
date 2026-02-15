import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { UIProvider } from "@/context/UIContext";
import { PreferencesProvider } from "@/context/PreferencesContext";

/**
 * Composes all providers into a single wrapper component.
 * Used in app/_layout.tsx to keep the root layout clean.
 *
 * Order matters:
 *   1. QueryClientProvider (outermost — server state)
 *   2. AuthProvider (auth state needed by most things)
 *   3. ThemeProvider (theme needed for styling)
 *   4. PreferencesProvider (user preferences)
 *   5. UIProvider (innermost — ephemeral UI state)
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <PreferencesProvider>
            <UIProvider>{children}</UIProvider>
          </PreferencesProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
