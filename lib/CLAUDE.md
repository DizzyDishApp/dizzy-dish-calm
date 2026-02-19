# lib/ — Backend & API Guide

## Supabase Guide

### Overview
Supabase provides the backend for authentication and database. The client is initialized in `lib/supabase.ts` with session persistence via AsyncStorage.

### Architecture
```
lib/supabase.ts       → Supabase client singleton (auth + DB)
context/AuthContext    → Listens to onAuthStateChange, exposes signUp/signIn/signOut
lib/api.ts            → Fetcher functions that call supabase.from(...) for DB operations
hooks/use*.ts          → React Query hooks that call api.ts fetchers
```

### Database Tables
Two tables in `public` schema, both with Row Level Security (RLS) enabled:

**`profiles`** — Auto-created on sign-up via trigger on `auth.users`:
| Column | Type | Notes |
|---|---|---|
| `id` | uuid (PK) | References `auth.users(id)` |
| `email` | text | |
| `display_name` | text | Defaults to email prefix |
| `avatar_url` | text | |
| `is_pro` | boolean | Default `false` |
| `instacart_connected` | boolean | Default `false` |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

**`saved_recipes`** — User's saved recipe collection:
| Column | Type | Notes |
|---|---|---|
| `id` | uuid (PK) | Auto-generated |
| `user_id` | uuid (FK) | References `profiles(id)` |
| `recipe_id` | text | |
| `recipe_data` | jsonb | Full `Recipe` object |
| `created_at` | timestamptz | |
| Unique constraint | | `(user_id, recipe_id)` |

### RLS Policies
- Users can only read/update their own profile
- Users can only CRUD their own saved recipes
- All queries automatically scoped by `auth.uid()`

### Auth Flow
1. `AuthProvider` mounts → calls `supabase.auth.getSession()` to restore existing session
2. Subscribes to `supabase.auth.onAuthStateChange()` for real-time session updates
3. On sign-up/sign-in → Supabase sets session → `onAuthStateChange` fires → AuthContext updates
4. Session tokens auto-refresh via Supabase client (configured with `autoRefreshToken: true`)
5. Sessions persist across app restarts via AsyncStorage

### Google OAuth Flow
Google sign-in uses `supabase.auth.signInWithOAuth` + `expo-web-browser`:
1. `signInWithGoogle()` in `AuthContext` calls `supabase.auth.signInWithOAuth({ provider: "google" })` with `skipBrowserRedirect: true`
2. Opens the returned URL in an in-app browser via `WebBrowser.openAuthSessionAsync`
3. After Google consent, Supabase redirects to the app's `redirectTo` URL with tokens in the URL fragment
4. Tokens are extracted and passed to `supabase.auth.setSession()` to establish the session
5. `onAuthStateChange` fires, AuthContext updates, user is signed in

**Redirect URI:** `Linking.createURL("auth/callback")` — resolves to `dizzydish://auth/callback` in production builds, `exp://...` in Expo Go.

**Supabase config required:**
- Google provider enabled with Web Client ID + Secret
- `dizzydish://auth/callback` in Redirect URLs (and `exp://` variant for dev)

**Google Cloud Console config required:**
- Web OAuth 2.0 Client ID with `https://<project>.supabase.co/auth/v1/callback` as authorized redirect URI
- OAuth consent screen configured with authorized domains, test users (if in Testing mode)

**Known limitation:** OAuth does not work in Expo Go. Requires a development build (`npx expo run:ios` / `run:android`).

### Account Screen Auth UX
The account screen uses an **identifier-first** pattern:
1. User enters email → taps GET STARTED
2. `checkEmailExists` RPC checks Supabase for existing account (requires `check_email_exists` SQL function)
3. Existing user → single password field + "Welcome Back" heading
4. New user → password + confirm password + "Create Account" heading
5. On successful auth → `AuthRedirectContext` replays any pending action and navigates back

### Environment Variables
```
EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### What's wired vs. still mocked
| Feature | Status |
|---|---|
| Email sign-up / sign-in | Supabase Auth |
| Session persistence & refresh | Supabase Auth + AsyncStorage |
| User profile (read) | Supabase `profiles` table |
| Saved recipes (CRUD) | Supabase `saved_recipes` table |
| Google OAuth sign-in | Wired — needs dev build to test |
| Social auth (Apple/Facebook) | Not yet wired |
| Recipe spin | Spoonacular pool draw; fixture fallback |
| Weekly plan spin | Spoonacular pool draw; fixture fallback |
| Subscription / payments | RevenueCat SDK (`lib/revenueCat.ts`) |
| Instacart | Mocked |

---

## RevenueCat Integration

### Architecture
```
lib/revenueCat.ts           → RevenueCat client: init, customerInfo, offerings, purchase, restore, identity sync
lib/api.ts                  → updateUserProStatus(isPro) — writes profiles.is_pro after purchase/restore
hooks/useUserProfile.ts     → useRevenueCatInfo() — queries RC, exposes purchase/restore mutations
context/AuthContext.tsx     → logInRevenueCat / logOutRevenueCat on onAuthStateChange
app/(modal)/paywall.tsx     → Paywall screen (feature list, monthly/annual toggle, purchase + restore)
app/(modal)/settings.tsx    → Shows "Pro Active" or "Upgrade to Pro →" based on User.isPro
app/result.tsx              → Calorie upsell navigates to paywall when recipe.calories === "—"
```

### Pro Status Flow
```
RevenueCat CustomerInfo
  ↓ (on purchase / restore / app foreground)
updateUserProStatus(isPro) in lib/api.ts
  ↓
Supabase profiles.is_pro updated
  ↓
queryClient.invalidateQueries(queryKeys.user.profile)
  ↓
useUserProfile() refetches → User.isPro = true
  ↓
useRecipePool reads User.isPro → fetchProPool (with nutrition)
```

**Critical rule:** `User.isPro` from `useUserProfile()` is the **only** source of truth for Pro feature gating. It is NOT in `PreferencesContext`. This prevents free users from self-upgrading.

### Products & Entitlement
| Product ID (iOS) | Product ID (Android) | Price | Type |
|---|---|---|---|
| `com.dizzydish.pro.monthly` | `pro_monthly` | $2.99/month | Auto-Renewable Subscription |
| `com.dizzydish.pro.annual` | `pro_annual` | $14.99/year | Auto-Renewable Subscription |

RevenueCat entitlement ID: **`pro_access`** (both products attached)
RevenueCat offering ID: **`default`** (monthly + annual packages)

### lib/revenueCat.ts API
| Function | Purpose |
|---|---|
| `initRevenueCat()` | Configure SDK at app startup. No-op if no key set. |
| `getCustomerInfo()` | Returns `CustomerInfo \| null` (null = RC unavailable) |
| `getOfferings()` | Returns `PurchasesOfferings \| null` |
| `purchasePackage(pkg)` | Triggers IAP sheet; returns `CustomerInfo` on success |
| `restorePurchases()` | Restores prior transactions; returns `CustomerInfo \| null` |
| `logInRevenueCat(userId)` | Links Supabase user ID to RC identity |
| `logOutRevenueCat()` | Resets to anonymous identity |
| `isProEntitlement(info)` | Returns `true` if `pro_access` entitlement is active |

All functions use dynamic `require()` with try/catch — safe in Expo Go and in tests (no native crash).

### Environment Variables
```
EXPO_PUBLIC_REVENUECAT_IOS_KEY=appl_...
EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=goog_...
```

Keys are omitted → `initRevenueCat()` is a no-op → `getCustomerInfo()` returns null → `User.isPro` stays false (free tier). The fixture fallback pool works correctly without any RC key.

### Sandbox Testing (no real money)
- **iOS:** Create a StoreKit Configuration file (`.storekit`) in Xcode. Point your scheme at it. iOS Simulator processes sandbox purchases instantly.
- **Android:** Add your Google account as a License Tester in Play Console. Sandbox purchases work on a real device.
- RevenueCat dashboard → **Sandbox** tab shows all test transactions.

### Pitfalls

**RevenueCat requires a dev build** — `react-native-purchases` has native code. It cannot run in Expo Go. Use `npx expo run:ios` / `run:android` to test real purchases. Fixture pool + `User.isPro = false` work correctly in Expo Go without the SDK.

**`logOutRevenueCat()` on anonymous users throws** — The RevenueCat SDK throws if `logOut()` is called when the current identity is already anonymous. The wrapper in `lib/revenueCat.ts` silently swallows this error.

**`app.json` plugin key is a placeholder** — `$REVENUECAT_ANDROID_KEY` in `app.json` is a placeholder string. Replace it with the actual key value (or use EAS environment variables) before running `eas build`.

---

## Spoonacular Integration

### Architecture
```
lib/spoonacular.ts      → API client: raw types, mapper, tag builder, ingredient filter, pool fetchers
lib/fixtures/           → 25 hand-crafted fallback recipes (same raw SpoonacularRecipe format)
hooks/useRecipePool.ts  → React Query: fetches + caches the pool (keyed on dietary fingerprint + tier)
lib/api.ts              → drawRecipeFromPool / drawWeeklyPlanFromPool — client-side draw from RQ cache
hooks/useSpinRecipe.ts  → Mutations that call drawRecipeFromPool / drawWeeklyPlanFromPool
```

### Pool Strategy

| Tier | Endpoint | Nutrition | Key params |
|---|---|---|---|
| Free / Guest | `/recipes/random` | None (calories show "—") | `include-tags`, `exclude-tags` |
| Pro | `/recipes/complexSearch` | Full (real calorie display) | `diet`, `intolerances`, `addRecipeNutrition=true` |

The pool is cached in React Query under `queryKeys.recipes.pool(fingerprint)` where `fingerprint` encodes the sorted dietary filters + tier (`"|pro"` or `"|free"`).

### Fixture Fallback Pool

Both fetch functions fall back to `lib/fixtures/spoonacularRecipes.ts` in these scenarios:

| Condition | Console log |
|---|---|
| No API key | `[spoonacular] No API key — using fixture pool` |
| Network error | `[spoonacular] Network error — using fixture pool: <error>` |
| HTTP 401 | `[spoonacular] INVALID API KEY (401) — using fixture pool` |
| HTTP 402 | `[spoonacular] QUOTA EXCEEDED (402) — using fixture pool` |
| HTTP 200, 0 recipes | `[spoonacular] API returned 0 recipes — using fixture pool` |

**Exported types:** `SpoonacularRecipe`, `SpoonacularIngredient`, `SpoonacularNutrient` are exported from `lib/spoonacular.ts`. Fixtures use `import type` to avoid circular runtime dependency.

### Spin Flow (end-to-end)
1. `useRecipePool` fetches and caches the pool from Spoonacular (or fixtures)
2. User taps spin → `spinRecipe.mutate(request)` / `spinWeeklyPlan.mutate(request)`
3. `drawRecipeFromPool` / `drawWeeklyPlanFromPool` reads the pool from RQ cache (synchronous)
4. Applies client-side `passesTimeFilter` + `passesCalorieFilter` on the pre-loaded pool
5. Returns a random matching recipe; navigates to result screen

### Guest Spin Limit
Free/Guest users get **3 spins per day**. Tracked in AsyncStorage via `hooks/useGuestSpinLimit.ts` — stores count + date, resets at midnight. Authenticated users have no limit.

### Tag Format
Spoonacular include/exclude tags use `+` for spaces, **not** `%20`:
- ✅ `gluten+free`, `dairy+free`, `main+course`
- ❌ `gluten%20free`

### Environment Variable
```
EXPO_PUBLIC_SPOONACULAR_API_KEY=your_key_here
```

Free tier: 150 points/day. `/recipes/random` = 1 point. `/recipes/complexSearch` with nutrition = more. Set IP restrictions in the Spoonacular dashboard — the key is visible in the JS bundle.

---

## Pitfalls

**`react-native-url-polyfill/auto` on Expo SDK 52+ / Hermes** — Do NOT import it. Hermes has native URL/URLSearchParams support. Importing the polyfill causes a silent crash (app stuck on splash screen). The package is installed as a peer dep but must not be imported.

**OAuth in Expo Go** — `WebBrowser.openAuthSessionAsync` cannot intercept `exp://` redirects reliably. OAuth flows require a development build with the native `dizzydish://` scheme. Use `npx expo run:ios` / `run:android` to test OAuth.

**Spoonacular returns HTTP 200 with empty results when quota is silently exceeded** — The API sometimes returns `{"status":"failure","code":402,...}` with HTTP 200. The `!response.ok` check won't catch it. The post-parse zero-length check in `fetchRandomPool`/`fetchProPool` triggers the fixture fallback. Watch for `[spoonacular] API returned 0 recipes — using fixture pool` in logs.
