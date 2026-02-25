## Summary

<!-- What does this PR do? Why? -->

## Type of change

- [ ] `feat` — New feature
- [ ] `fix` — Bug fix
- [ ] `refactor` — Code change with no behavior change
- [ ] `chore` — Build, deps, config
- [ ] `docs` — Documentation only
- [ ] `test` — Tests only
- [ ] `style` — Formatting only
- [ ] `hotfix` — Urgent production fix

## PR checklist

- [ ] `npx tsc --noEmit` passes (no TypeScript errors)
- [ ] All existing tests pass (`npm run test:ci`)
- [ ] New features have tests
- [ ] Server data uses React Query — not Context
- [ ] Components have accessibility props (`accessibilityRole`, `accessibilityLabel`)
- [ ] No `StyleSheet.create()` unless NativeWind can't express it
- [ ] Animations use Reanimated (not the legacy Animated API)
- [ ] Haptic feedback added for interactive elements
- [ ] Loading, error, and empty states handled for all new queries

## Testing notes

<!-- How did you test this? Device/simulator, OS version, scenarios covered. -->

## Screenshots / recordings

<!-- Optional but encouraged for UI changes -->
