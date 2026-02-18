# __tests__/ — Testing Guide

## Setup
```bash
npm test                    # Run all tests
npm test -- --watch         # Watch mode
npm test -- --coverage      # Coverage report
npm run test:ci             # CI mode (--ci --runInBand --forceExit)
npm test -- --testPathPattern=MyThing   # Run a single file
```

## Framework
- `jest-expo` preset
- `@testing-library/react-native` for component tests
- `jest.setup.js` provides global mocks for all native/Expo modules

## Infrastructure

**`babel.config.js`** — NativeWind's JSX transform (`jsxImportSource: "nativewind"` + `nativewind/babel` preset) is conditionally disabled when `NODE_ENV === "test"`. Without this, the `react-native-css-interop` wrap-jsx runtime breaks all component rendering in tests.

**`jest.setup.js`** — Global mocks for:
- `react-native-reanimated` (via its built-in `setUpTests()`)
- `react-native-css-interop` (`maybeHijackSafeAreaProvider` passthrough)
- `react-native-safe-area-context` (SafeAreaView → View, insets → zeros)
- `expo-haptics`, `expo-router`, `expo-web-browser`, `expo-linking`
- `@expo/vector-icons` (Ionicons → Text element, using `React.createElement` — not `Text()` directly, it's a class component)
- `@react-native-async-storage/async-storage` (built-in jest mock)
- `@/lib/supabase` (full auth + DB mock with jest.fn() on all methods)
- `@/lib/haptics` (all haptic helpers as jest.fn())

**`__tests__/test-utils.tsx`** — Shared helpers (excluded from test runs via `testPathIgnorePatterns`):
- `createTestQueryClient()` — QueryClient with retries disabled and gcTime 0
- `renderWithQuery()` — Wraps UI in QueryClientProvider

## Conventions
- Test files: `__tests__/ComponentName.test.tsx`
- One test file per component/hook
- Pure functions (reducers, helpers) exported for direct unit testing
- Screen tests mock context hooks at the module level with `jest.mock()`
- Use `mock` prefix for mutable variables referenced inside `jest.mock()` factories
- `react-test-renderer` must match `react` version (both 19.1.0 if using React 19)

## Existing test coverage (111 tests across 11 suites)
| File | What it tests | Tests |
|---|---|---|
| `AuthContextReducer.test.ts` | `authReducer`, `mapSupabaseUser` pure functions | 6 |
| `api.checkEmailExists.test.ts` | `checkEmailExists` with supabase.rpc mock | 4 |
| `PrimaryButton.test.tsx` | Rendering, loading state, press, a11y | 6 |
| `SocialButton.test.tsx` | Provider labels, press, a11y | 5 |
| `InputField.test.tsx` | Placeholder, input, props | 5 |
| `AuthContext.test.tsx` | Provider mount, signUp/signIn/signInWithGoogle/signOut | 8 |
| `AccountScreen.test.tsx` | Unauth/auth views, validation, phase transitions, errors | 16 |
| `spoonacular.mapping.test.ts` | `mapSpoonacularRecipe`, `buildTagParams`, ingredient/time/calorie filters, `pickEmoji`, `stripHtml` | varies |
| `useGuestSpinLimit.test.ts` | Guest spin limit: increment, daily reset, limit reached | varies |
| `useRecipePool.test.tsx` | Pool fetch, cache key fingerprint, tier switching | varies |
| `useSpinRecipe.test.tsx` | `drawRecipeFromPool` / `drawWeeklyPlanFromPool`: success, empty pool, filter mismatch | varies |

## Adding a new test

1. Create `__tests__/MyThing.test.tsx`
2. Import from `__tests__/test-utils` for React Query wrappers if needed:
```tsx
import { renderWithQuery } from "@/__tests__/test-utils";
const { getByText } = renderWithQuery(<MyComponent />);
```
3. Mock context hooks at module level if testing a screen:
```tsx
const mockMyHook = jest.fn();
jest.mock("@/context/MyContext", () => ({
  useMyContext: () => mockMyHook(),
}));
```
4. For pure functions, import and test directly — no mocks needed

## Mocking Context (for screen tests)
Mock at the module level for fine-grained control without rendering the real provider tree:
```tsx
let mockState = { isAuthenticated: false };

jest.mock("@/context/AuthContext", () => ({
  useAuth: () => ({ state: mockState, signIn: jest.fn() }),
}));
```

## Mocking React Query mutations
In mutation tests, `setQueryData` spy pattern is reliable; `qc.getQueryData` after `waitFor(isSuccess)` can be flaky with React Query v5.

## CI
GitHub Actions runs `npm run test:ci` on every push to `main`/`feat/**`/`fix/**` and on PRs to `main`. Workflow at `.github/workflows/test.yml`.

---

## Pitfalls

**NativeWind breaks Jest tests** — The `jsxImportSource: "nativewind"` babel config wraps every JSX element in `react-native-css-interop`'s wrap-jsx runtime, calling `maybeHijackSafeAreaProvider`. This crashes all component tests. Fix is in `babel.config.js`: conditionally disable NativeWind presets when `process.env.NODE_ENV === "test"`. The `className` prop becomes a no-op in tests, but rendering and interaction testing works correctly.

**`jest.mock()` variable scoping** — Variables referenced inside `jest.mock()` factory functions must either be prefixed with `mock` (e.g., `mockCurrentAuthState`) or use `require()` inside the factory. This is a babel-jest restriction to prevent uninitialized variable access.

**`react-native-safe-area-context` mock** — The built-in `.tsx` mock doesn't work well with this setup. Use a manual mock in `jest.setup.js`. Also mock `react-native-css-interop/dist/runtime/third-party-libs/react-native-safe-area-context` for `maybeHijackSafeAreaProvider`.

**Jest setup key** — Use `setupFiles` (not `setupFilesAfterSetup` or `setupFilesAfterFramework`) in `jest.config.js` / `package.json` jest config.
