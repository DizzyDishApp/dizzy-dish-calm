# hooks/ — React Query Guide

## How data fetching is structured

```
lib/api.ts          → Raw fetcher functions (async, typed, no React Query)
lib/queryKeys.ts    → Cache key factory constants
hooks/use*.ts       → Query/mutation hooks that compose api + keys
app/*.tsx           → Screen components that consume hooks
```

## Existing query hooks

All query hooks live in `hooks/` and are named `use[Entity][Action].ts`:
- `useSpinRecipe.ts` — `useSpinRecipe()`, `useSpinWeeklyPlan()`
- `useRecipePool.ts` — `useRecipePool()` (Spoonacular pool, tier-aware, 30 min stale time)
- `useGuestSpinLimit.ts` — guest spin tracking (3 spins/day, AsyncStorage, daily reset)
- `useSavedRecipes.ts` — `useSavedRecipes()`, `useSaveRecipe()`, `useUnsaveRecipe()`
- `useUserProfile.ts` — `useUserProfile()`, `useSubscription()`
- `useInstacart.ts` — `useConnectInstacart()`

## Adding a new query (step-by-step)

1. **Add fetcher to `lib/api.ts`:**
```ts
export async function fetchMealHistory(): Promise<MealHistoryEntry[]> {
  return request<MealHistoryEntry[]>('/meals/history');
}
```

2. **Add key to `lib/queryKeys.ts`:**
```ts
meals: {
  all: ["meals"] as const,
  history: () => [...queryKeys.meals.all, "history"] as const,
},
```

3. **Create hook in `hooks/useMealHistory.ts`:**
```ts
import { useQuery } from "@tanstack/react-query";
import { fetchMealHistory } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";

export function useMealHistory() {
  return useQuery({
    queryKey: queryKeys.meals.history(),
    queryFn: fetchMealHistory,
  });
}
```

4. **Use in component:**
```tsx
const { data, isLoading, isError } = useMealHistory();
```

## Adding a new mutation

```ts
export function useDeleteRecipe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteRecipe(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recipes.saved() });
    },
  });
}
```

## Optimistic updates

See `useSaveRecipe` in `hooks/useSavedRecipes.ts` for a complete example:
1. Cancel outgoing queries for the same key
2. Snapshot previous data
3. Optimistically update the cache
4. Return context with previous data
5. On error, restore from context
6. On settled, invalidate to refetch

## Cache key conventions

Keys follow a hierarchical factory pattern in `queryKeys.ts`:
- `["recipes"]` — all recipe-related queries
- `["recipes", "saved"]` — saved recipes specifically
- `["recipes", "detail", "abc123"]` — specific recipe by ID
- `["recipes", "pool", fingerprint]` — Spoonacular pool (fingerprint = dietary + tier)

## Typing React Query

```ts
useQuery<Recipe[], Error>({ ... })
useMutation<void, Error, { recipeId: string }>({ ... })
```

## Pagination with `useInfiniteQuery`

Not currently used, but when needed:
```ts
export function useRecipeSearch(query: string) {
  return useInfiniteQuery({
    queryKey: queryKeys.recipes.search(query),
    queryFn: ({ pageParam = 0 }) => searchRecipes(query, pageParam),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: 0,
  });
}
```

---

## Pitfalls

**Storing server data in Context instead of React Query** — Never put API response data in AuthContext, PreferencesContext, etc. That data belongs in React Query.

**Using `useEffect` for data fetching instead of React Query** — All `useEffect(() => { fetch(...).then(setData) }, [])` patterns must be replaced with `useQuery`. This gets you loading/error states, caching, deduplication, and background refetching for free.

**Missing `queryKey` dependencies causing stale cache** — Always use the `queryKeys.ts` factory. If your query depends on a parameter, include it in the key: `queryKeys.recipes.detail(id)`.

**`refetchOnWindowFocus: true` on mobile** — Disabled globally in `queryClient.ts`. On mobile there's no "window focus" event like on web. The `AppState` change event exists but is handled differently.

**In mutation tests, use `setQueryData` spy** — `qc.getQueryData` after `waitFor(isSuccess)` can be flaky with React Query v5. The `setQueryData` spy pattern is reliable.
