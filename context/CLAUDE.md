# context/ — React Context Guide

## Purpose of each context

| Context | File | Purpose |
|---|---|---|
| `AuthContext` | `context/AuthContext.tsx` | Supabase session, user object, signUp/signIn/signInWithGoogle/signOut actions, auto-restores via `onAuthStateChange` |
| `AuthRedirectContext` | `context/AuthRedirectContext.tsx` | Post-auth redirect: captures route + pending action before auth, replays after sign-in. Persisted to AsyncStorage for OAuth backgrounding. |
| `ThemeContext` | `context/ThemeContext.tsx` | Light/dark mode preference, persisted to AsyncStorage |
| `UIContext` | `context/UIContext.tsx` | Ephemeral UI state: isSpinning overlay, toast messages |
| `PreferencesContext` | `context/PreferencesContext.tsx` | Dietary filters, time/calorie preferences, weekly mode, pro status, persisted to AsyncStorage |

## Consuming a context

```tsx
import { useAuth } from "@/context/AuthContext";

function MyComponent() {
  const { state, signUp, signIn, signOut } = useAuth();
  // state.user, state.session, state.isAuthenticated, state.isLoading
}
```

## Adding a new context (step-by-step)

1. **Define state interface:**
```ts
interface NotificationState {
  enabled: boolean;
  frequency: "daily" | "weekly";
}
```

2. **Define action union type:**
```ts
type NotificationAction =
  | { type: "SET_ENABLED"; payload: boolean }
  | { type: "SET_FREQUENCY"; payload: "daily" | "weekly" };
```

3. **Write reducer:**
```ts
function notificationReducer(state: NotificationState, action: NotificationAction): NotificationState {
  switch (action.type) {
    case "SET_ENABLED": return { ...state, enabled: action.payload };
    case "SET_FREQUENCY": return { ...state, frequency: action.payload };
    default: return state;
  }
}
```

4. **Create context:**
```ts
const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);
```

5. **Build Provider:**
```tsx
export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(notificationReducer, initialState);
  // AsyncStorage persistence in useEffect if needed
  return <NotificationContext.Provider value={{ state, ... }}>{children}</NotificationContext.Provider>;
}
```

6. **Export custom hook:**
```ts
export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) throw new Error("useNotifications must be used within NotificationProvider");
  return context;
}
```

7. **Add to `providers/index.tsx`**

## Persisting context state

Use `useEffect` inside the Provider to read from AsyncStorage on mount and write on state changes. See `PreferencesContext.tsx` for a complete example with serialization of `Set` types.

## What belongs where

| If the data... | It belongs in... |
|---|---|
| Comes from an API | React Query |
| Is fetched once and rarely changes (e.g., feature flags) | React Query with long `staleTime` |
| Is user input not yet submitted | Local component state (`useState`) |
| Is UI state (modal open, toast visible) | UIContext |
| Is a user preference that persists | PreferencesContext + AsyncStorage |
| Is auth session data | AuthContext (backed by Supabase `onAuthStateChange`) |
| Is theme preference | ThemeContext + AsyncStorage |

---

## Pitfalls

**Storing server data in Context instead of React Query** — Never put API response data in AuthContext, PreferencesContext, etc. That data belongs in React Query for proper caching, refetching, and invalidation.

**Context causing full subtree re-renders** — Split contexts by concern (Auth, Theme, UI, Preferences). Don't put unrelated state in the same context. A theme change shouldn't re-render the preferences screen.
