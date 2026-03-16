# Quiz Logic Audit

_Date: 2026-03-16_

---

## Summary

Full audit and refactor of quiz logic. All quiz-related code consolidated into `lib/quiz/`, bugs fixed, redundant code removed. Zero TypeScript errors after changes.

---

## Bugs Fixed

### 1. Conditional React hook call (Critical)
**File:** `lib/useStepController.ts`  
**Problem:** `const funnel = options?.funnel ?? useCurrentFunnel()` — `??` short-circuits in JS, meaning `useCurrentFunnel()` was conditionally called (React Rules of Hooks violation). Could cause silent bugs on re-renders.  
**Fix:** Always call `useCurrentFunnel()` first, then apply `??`:
```ts
const contextFunnel = useCurrentFunnel()
const funnel = options?.funnel ?? contextFunnel
```

### 2. Hardcoded session ID in experience slide (Critical)
**File:** `app/funnel-slides/experience/Slide.tsx`  
**Problem:** `const SID = "default"` — a hardcoded string was used instead of the real session ID from cookies. This meant experience answers were saved under the wrong key and never actually read back.  
**Fix:** Removed `SID` constant entirely. The slide now reads `value` directly from `useStepController`, which handles the real session ID.

### 3. Double-select in experience slide
**File:** `app/funnel-slides/experience/Slide.tsx`  
**Problem:** `onChange` called both `setSaved(v)` (which internally called `select`) AND `select(v, ...)` again — duplicating the store write and causing two navigation attempts.  
**Fix:** `onChange` now calls `select(v, { advance: false })` once.

### 4. Hardcoded `isPending = false` in weight slide
**File:** `app/funnel-slides/weight/Slide.tsx`  
**Problem:** `const isPending = false` ignored the real pending state from the router transition.  
**Fix:** `isPending` is now destructured from `useStepController`.

### 5. Height slide used fragile sid access
**File:** `app/funnel-slides/height/Slide.tsx`  
**Problem:** `const sid = Object.keys(bySid ?? {})[0]` — fragile key extraction instead of the proper `sid` from `useStepController`.  
**Fix:** Uses `sid` from `useStepController` directly.

### 6. Dead `onlyGoBack` prop in BMI slide
**File:** `app/funnel-slides/bmi/Slide.tsx`  
**Problem:** `onlyGoBack` prop was accepted but never passed by the page system (slides are rendered as `<Component />` with no props). The dead branch was live code with its own return path.  
**Fix:** Removed entirely.

### 7. Duplicate skip logic
**Problem:** `getSkippedSteps` was defined both inline in `useStepController.ts` AND in `lib/funnels/navigation.ts`, with slightly different signatures. Any future change to skip logic required updating two places.  
**Fix:** Consolidated into `lib/quiz/navigation.ts`. `useStepController` now imports from there. New signature accepts `skipRules` as a parameter (funnel-aware).

### 8. Duplicate `SkipRule` type
**Files:** `config/funnelFlow.ts` and `lib/funnels/funnelDefinitions.ts`  
**Problem:** Same type defined twice, risk of divergence.  
**Fix:** Defined once in `lib/quiz/funnelFlow.ts`, re-exported from `lib/quiz/funnelDefinitions.ts`.

### 9. Dead navigation fallback in `NextButton`
**File:** `app/components/funnels/NextButton.tsx`  
**Problem:** `handleClick` had fallback navigation code after `if (onClick) { onClick(); return; }`. Since `onClick` was required in the interface, this code was never reached.  
**Fix:** Removed the dead fallback. `NextButton` is now a pure presentation button — it renders the image and calls `onClick`. Navigation is fully owned by the slide.

### 10. Deprecated `getDefaultFunnelForHost` function
**File:** `lib/funnels/funnels.ts`  
**Problem:** Function was marked deprecated and had no callers.  
**Fix:** Removed.

### 11. Unused `locale?` param on slug functions
**Files:** `getFunnelSlug`, `getResultSlug`, `getStepSlug`, `resolveFunnelKey`, `resolveStepId`  
**Problem:** Slugs are no longer localized (all strings are language-neutral), but all functions still accepted a `locale?` param that was never used.  
**Fix:** Removed the param from all functions. All 37 call sites updated automatically.

### 12. Comment duplication
**File:** `lib/validation/stepValidation.ts`  
**Problem:** Lines 26-27 contained the same comment twice: `// Calculate which steps should be skipped based on current answers`.  
**Fix:** Removed the duplicate.

---

## Directory Consolidation

### Before
Quiz logic was scattered across 5 directories:
```
config/funnelFlow.ts       ← step order & skip rules
config/quiz.ts             ← disabled steps & equipment
lib/funnels/funnelContext  ← React context
lib/funnels/funnelDefinitions ← funnel type + definitions
lib/funnels/funnels.ts     ← resolver functions
lib/funnels/navigation.ts  ← skip/next/prev logic
lib/steps/stepIds.ts       ← step IDs and tags
lib/steps/stepSlugs.ts     ← URL slugs
lib/steps/ignoredSteps.ts  ← progress-bar ignored steps
lib/store.ts               ← Zustand store
lib/useStepController.ts   ← main quiz hook
lib/validation/stepValidation.ts ← missing steps checker
```

### After
All 12 files live in `lib/quiz/`:
```
lib/quiz/
  config.ts           (← config/quiz.ts)
  funnelContext.tsx   (← lib/funnels/funnelContext.tsx)
  funnelDefinitions.ts(← lib/funnels/funnelDefinitions.ts)
  funnelFlow.ts       (← config/funnelFlow.ts)
  funnels.ts          (← lib/funnels/funnels.ts)
  ignoredSteps.ts     (← lib/steps/ignoredSteps.ts)
  index.ts            ← barrel export
  navigation.ts       (← lib/funnels/navigation.ts, fixed)
  stepIds.ts          (← lib/steps/stepIds.ts)
  stepSlugs.ts        (← lib/steps/stepSlugs.ts)
  stepValidation.ts   (← lib/validation/stepValidation.ts)
  store.ts            (← lib/store.ts)
  useStepController.ts(← lib/useStepController.ts, fixed)
```

Old paths are now thin re-export stubs so nothing breaks if any path was missed.  
37 source files had their imports updated automatically.

---

## Future Improvements / Bottlenecks

### High priority

1. **`bySid` legacy view in the store** — The store maintains `bySid` as a mirrored view of the current funnel's session data. It was marked "legacy" but is still widely used across slides and components. If a second funnel is ever added, this mirror will only reflect one funnel and can mislead. **Recommendation:** Migrate all reads to `getFor(sid, funnel)` and remove `bySid`.

2. **`alert()` for validation errors** — `equipment/Slide.tsx` and `experience/Slide.tsx` use native `alert()` for validation messages, which is inconsistent with the inline error style used in `height/Slide.tsx` and `weight/Slide.tsx`. **Recommendation:** Replace all `alert()` calls with inline error state.

3. **No input debounce** — `height` and `weight` slides call `setField` on every keystroke. With Zustand + localStorage persistence this is fine for now, but if analytics events or API calls are ever attached to field changes, this will fire too often. **Recommendation:** Add a debounce if field-change side effects are added.

### Medium priority

4. **`SelectMenu` value format inconsistency** — Equipment uses `|`-separated values stored in Zustand but passes `,`-separated to the internal `SelectMenu`, converting on every render. The conversion is in the slide itself (`v.split(',').map(...).join('|')`). This is a footgun if the format ever changes. **Recommendation:** Pick one separator format and use it end-to-end.

5. **Unit conversion logic repeated** — Both `height/Slide.tsx` and `weight/Slide.tsx` contain their own `toNumber()` helper, unit toggle logic, and `_raw` field pattern. If a third numeric step is added, this pattern will be copied a third time. **Recommendation:** Extract a `useNumericInput({ unit, rawField, cmField, ... })` hook.

6. **`DISABLED_STEPS` contains `physique_goal`** — The step is disabled via config but still exists as a slide file, in `ALL_STEPS`, and in `FUNNEL_STEPS_ORDER`. This is fine for feature-flagging but confusing for new developers. **Recommendation:** Add a comment in `funnelFlow.ts` above `physique_goal` explaining it's intentionally disabled.

7. **`skipRules` hardcoded in `funnelFlow.ts`** — Skip rules are currently defined at the config level, not inside the funnel definition. This works fine with one funnel but will need per-funnel rules when more funnels are added. Already correctly used via `FUNNELS[funnel].steps.skipRules` in `useStepController`.

### Low priority

8. **`LocalizedStringMap = string`** — This type alias exists for historical reasons (slugs used to be localized per-language). Now slugs are plain strings. The alias adds confusion without value. Could be removed entirely and replaced with `string` once confirmed slugs will never be re-localized.

9. **`isFunnelAllowedOnDomain` always returns true** — The function exists for future multi-domain use but currently just checks `!!FUNNELS[funnel]`. Document this clearly or remove until needed.

10. **`weight/Slide.tsx` comment in Polish** — Several inline comments are in Polish (`// cel diety z Zustand`, `// reguły celu diety`, etc.). These should be in English for consistency.
