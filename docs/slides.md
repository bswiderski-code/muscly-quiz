# Funnel Slides Guide

## Overview

Funnel slides are **funnel-agnostic** components that can be reused across any funnel. They automatically work with the current funnel context and don't need to know which funnel they're being used in.

## How Slides Work

### Funnel Context

Slides get the current funnel automatically via `useStepController`:

```typescript
import { useStepController } from '@/lib/useStepController';
import type { StepId } from '@/lib/steps/stepIds.ts';

const stepId: StepId = 'gender';

export default function Page() {
  // Automatically gets current funnel from context
  const { idx, total, value, select, goPrev, goNext } = useStepController(stepId);
  // ...
}
```

The funnel context is provided by `FunnelProvider` in `app/[locale]/(funnels)/[funnel]/(slides)/[step]/page.tsx`, so slides don't need to know which funnel they're in.

### Data Storage

Slides store data using `useStepController`, which automatically:
- Stores data per funnel (so different funnels have separate data)
- Uses session ID (sid) to track user sessions
- Handles navigation between steps
- Respects skip rules defined in funnel configuration

## Creating a New Slide

### Step 1: Create the Slide File

Create a new directory in `app/funnel-slides/` with the step ID as the name:

```
app/funnel-slides/
  your_step_id/
    Slide.tsx
    your_step_id.css  (optional, if you need styles)
```

### Step 2: Define the Step ID

Add your step ID to `lib/steps/stepIds.ts`:

```typescript
export const ALL_STEPS = [
  // ... existing steps
  'your_step_id',  // Add here
] as const
```

### Step 3: Add Step Slug Translations

Add localized slugs to `lib/steps/stepSlugs.ts`:

```typescript
export const STEP_SLUGS: Record<StepId, LocalizedStringMap> = {
  // ... existing steps
  your_step_id: { 
    pl: 'twoj_krok', 
    en: 'your_step', 
    fr: 'votre_etape', 
    de: 'dein_schritt' 
  },
}
```

### Step 4: Create the Slide Component

Basic slide structure:

```typescript
"use client";

import { useStepController } from '@/lib/useStepController';
import type { StepId } from '@/lib/steps/stepIds.ts';
import ProgressHeader from '@/app/components/header/ProgressHeader';
import NextButton from '@/app/components/funnels/NextButton';
import { useTranslations } from 'next-intl';

const stepId: StepId = 'your_step_id';

export default function Page() {
  const t = useTranslations('YourStepNamespace'); // Translation namespace
  const { idx, total, value, select, goPrev, goNext, isPending } = useStepController(stepId);

  return (
    <div>
      <ProgressHeader currentIdx={idx} onBack={goPrev} />
      
      <h1>{t('title')}</h1>
      
      {/* Your slide content */}
      
      <NextButton
        currentIdx={idx}
        fieldKey={stepId}
        fieldValue={value}
        onClick={() => select(value, { advance: true })}
      />
    </div>
  );
}
```

### Step 5: Add Translations

Add translations to all language files in `i18n/translations/`:

```json
{
  "YourStepNamespace": {
    "title": "Your Step Title",
    // ... other translations
  }
}
```

## Common Patterns

### Pattern 1: Simple Selection

```typescript
const { value, select } = useStepController(stepId);

<button onClick={() => select('option1')}>
  Option 1
</button>
```

### Pattern 2: Accessing Other Step Values

```typescript
const { value: gender } = useStepController('gender' as StepId);
// Use gender to conditionally render content
```

### Pattern 3: Default Values

```typescript
useEffect(() => {
  if (!value) {
    select('default_value', { advance: false });
  }
}, [value, select]);
```

### Pattern 4: Using SelectMenu Component

```typescript
import SelectMenu, { type SelectOption } from '@/app/components/funnels/SelectMenu';

const options: SelectOption[] = [
  { value: 'option1', label: t('option1') },
  { value: 'option2', label: t('option2') },
];

<SelectMenu
  options={options}
  value={value}
  onChange={(val) => select(val, { advance: false })}
/>
```

### Pattern 5: Using StepRangeSlider

```typescript
import StepRangeSlider from '@/app/components/funnels/StepRangeSlider';

const steps = ['Option 1', 'Option 2', 'Option 3'];
const rememberedIndex = steps.findIndex(s => s.value === value);

<StepRangeSlider
  steps={steps}
  initialIndex={0}
  rememberedIndex={rememberedIndex >= 0 ? rememberedIndex : 0}
  onChange={(i) => select(steps[i].value, { advance: false })}
/>
```

## Important Rules

### ✅ DO

- Use `useStepController` to get funnel context automatically
- Use translation namespaces for all user-facing text
- Store values using `select()` from `useStepController`
- Access other step values via `useStepController('other_step_id')`
- Use `ProgressHeader` for consistent navigation
- Use `NextButton` for consistent next button behavior

### ❌ DON'T

- Hardcode funnel-specific logic in slides
- Access funnel directly (slides are funnel-agnostic)
- Use hardcoded strings (use translations)
- Store data directly in Zustand (use `useStepController`)
- Create funnel-specific slides (reuse slides across funnels)

## Troubleshooting

### Slide Not Appearing

1. Check step ID is in `lib/steps/stepIds.ts`
2. Check step slug is in `lib/steps/stepSlugs.ts`
3. Verify step is included in funnel's `steps.order` array
4. Check file path: `app/funnel-slides/{stepId}/Slide.tsx`

### Translations Not Working

1. Verify translation namespace matches in all language files
2. Check you're using `useTranslations('Namespace')` correctly
3. Ensure translation keys exist in JSON files

### Data Not Persisting

1. Verify you're using `select()` from `useStepController`
2. Check funnel context is provided (should be automatic)
3. Verify session ID (sid) is being set correctly

### Navigation Issues

1. Check step order in funnel definition
2. Verify skip rules aren't excluding your step
3. Ensure `goNext()` and `goPrev()` are called correctly

## File Structure

```
app/funnel-slides/
  {stepId}/
    Slide.tsx          # Main slide component (required)
    {stepId}.css       # Styles (optional)
```

## Related Files

- `lib/steps/stepIds.ts` - Step ID definitions
- `lib/steps/stepSlugs.ts` - Step URL slugs
- `lib/useStepController.ts` - Slide controller hook
- `lib/funnels/funnelDefinitions.ts` - Funnel step orders
- `i18n/translations/*.json` - Translations

