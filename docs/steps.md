# Steps Guide

## Overview

Steps are reusable, funnel-agnostic components that collect user input. Steps are defined once and can be used in any funnel by including them in the funnel's step order.

## Step Structure

### Step ID

**File**: `lib/steps/stepIds.ts`

Step IDs are defined as a const array:

```typescript
export const ALL_STEPS = [
  'gender',
  'diet_goal',
  'bodyfat',
  // ... other steps
  'your_step_id',  // Add new step here
] as const

export type StepId = typeof ALL_STEPS[number]
```

### Step Slug

**File**: `lib/steps/stepSlugs.ts`

Step slugs control the URL segment for each step:

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

**Note**: Slugs should be URL-friendly (lowercase, underscores, no spaces).

### Step Slide

**Location**: `app/funnel-slides/{stepId}/Slide.tsx`

Each step has a slide component that renders the UI.

## Creating a New Step

### Step 1: Add Step ID

**File**: `lib/steps/stepIds.ts`

```typescript
export const ALL_STEPS = [
  // ... existing steps
  'your_step_id',  // Add here
] as const
```

### Step 2: Add Step Slug

**File**: `lib/steps/stepSlugs.ts`

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

### Step 3: Create Slide Component

**Location**: `app/funnel-slides/your_step_id/Slide.tsx`

```typescript
"use client";

import { useStepController } from '@/lib/useStepController';
import type { StepId } from '@/lib/steps/stepIds.ts';
import ProgressHeader from '@/app/components/header/ProgressHeader';
import NextButton from '@/app/components/funnels/NextButton';
import { useTranslations } from 'next-intl';

const stepId: StepId = 'your_step_id';

export default function Page() {
  const t = useTranslations('YourStepNamespace');
  const { idx, total, value, select, goPrev, goNext, isPending } = useStepController(stepId);

  return (
    <div>
      <ProgressHeader currentIdx={idx} onBack={goPrev} />
      
      <h1>{t('title')}</h1>
      
      {/* Your step UI */}
      
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

### Step 4: Add Translations

**Files**: `i18n/translations/*.json` (all language files)

```json
{
  "YourStepNamespace": {
    "title": "Step Title",
    "description": "Step description",
    "options": {
      "option1": "Option 1",
      "option2": "Option 2"
    }
  }
}
```

### Step 5: Add to Funnel

**File**: `lib/funnels/funnelDefinitions.ts`

Add step to funnel's `steps.order`:

```typescript
steps: stepsFor(
  [
    'gender',
    'your_step_id',  // Add here
    'diet_goal',
    // ... other steps
  ] as const,
  skipRules
)
```

## Step Order in Funnels

Steps are ordered per funnel in `lib/funnels/funnelDefinitions.ts`:

```typescript
steps: stepsFor(
  [
    'gender',           // First step
    'diet_goal',      // Second step
    'bodyfat',        // Third step
    // ... order matters!
  ] as const,
  skipRules
)
```

**Important**: 
- Order determines navigation flow
- Steps can appear in different orders in different funnels
- Same step can be reused across multiple funnels

## Skip Rules

Skip rules allow conditional step skipping based on previous answers:

```typescript
steps: stepsFor(
  stepOrder,
  [
    {
      trigger: { step: 'location', value: 'gym' },
      skip: ['equipment'],  // Skip 'equipment' if location is 'gym'
    },
    {
      trigger: { step: 'gender', value: 'F' },
      skip: ['some_step'],  // Skip step for females
    },
  ]
)
```

**Rules**:
- `trigger.step`: Step ID to check
- `trigger.value`: Value that triggers skip (exact match, case-sensitive)
- `skip`: Array of step IDs to skip when triggered

**Important**:
- Trigger step must come before skipped steps in order
- Skip rules are evaluated in order
- Multiple skip rules can apply to same step

## Step Data Storage

Steps store data using `useStepController`:

```typescript
const { value, select } = useStepController(stepId);

// Store value
select('option1', { advance: false });  // Don't advance
select('option1', { advance: true });   // Advance to next step

// Read value
const currentValue = value;
```

**Storage Details**:
- Data is stored per funnel (separate sessions per funnel)
- Data persists across page refreshes
- Uses session ID (sid) to track user sessions
- Stored in Zustand store

## Accessing Other Step Values

Steps can access values from other steps:

```typescript
const { value: gender } = useStepController('gender' as StepId);
const { value: age } = useStepController('age' as StepId);

// Use for conditional rendering
if (gender === 'F') {
  // Female-specific content
}
```

## Common Step Patterns

### Pattern 1: Simple Selection

```typescript
const { value, select } = useStepController(stepId);

<button onClick={() => select('option1')}>
  Option 1
</button>
```

### Pattern 2: Multiple Choice

```typescript
const { value, select } = useStepController(stepId);
const selected = value ? value.split(',') : [];

function toggle(option: string) {
  const has = selected.includes(option);
  const next = has 
    ? selected.filter(o => o !== option)
    : [...selected, option];
  select(next.join(','), { advance: false });
}
```

### Pattern 3: Range Slider

```typescript
import StepRangeSlider from '@/app/components/funnels/StepRangeSlider';

const steps = ['Option 1', 'Option 2', 'Option 3'];
const rememberedIndex = steps.findIndex(s => s === value);

<StepRangeSlider
  steps={steps}
  initialIndex={0}
  rememberedIndex={rememberedIndex >= 0 ? rememberedIndex : 0}
  onChange={(i) => select(steps[i], { advance: false })}
/>
```

### Pattern 4: Select Menu

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

### Pattern 5: Default Values

```typescript
useEffect(() => {
  if (!value) {
    select('default_value', { advance: false });
  }
}, [value, select]);
```

## Step Validation

Steps can validate input before advancing:

```typescript
const [isValid, setIsValid] = useState(true);
const [error, setError] = useState<string | null>(null);

function validate(value: string): boolean {
  if (!value) {
    setError('Please select an option');
    setIsValid(false);
    return false;
  }
  setIsValid(true);
  setError(null);
  return true;
}

function handleNext() {
  if (!validate(value)) {
    return;
  }
  goNext();
}
```

## Step Navigation

Steps automatically handle navigation:

```typescript
const { goPrev, goNext } = useStepController(stepId);

// Go to previous step
<button onClick={goPrev}>Back</button>

// Go to next step
<button onClick={goNext}>Next</button>

// Or use NextButton component
<NextButton
  currentIdx={idx}
  fieldKey={stepId}
  fieldValue={value}
  onClick={() => select(value, { advance: true })}
/>
```

## Files Involved

- `lib/steps/stepIds.ts` - Step ID definitions
- `lib/steps/stepSlugs.ts` - Step URL slugs
- `app/funnel-slides/{stepId}/Slide.tsx` - Step slide component
- `i18n/translations/*.json` - Step translations
- `lib/funnels/funnelDefinitions.ts` - Step order in funnels

## Best Practices

### 1. Keep Steps Reusable

- Don't hardcode funnel-specific logic
- Use funnel context from `useStepController`
- Make steps work across all funnels

### 2. Use Translations

- Never hardcode text
- Use translation namespaces
- Support all locales

### 3. Handle Edge Cases

- Provide default values
- Validate input
- Handle missing data gracefully

### 4. Follow Naming Conventions

- Step IDs: lowercase, underscores (e.g., `your_step_id`)
- Step slugs: URL-friendly, localized
- Translation namespaces: PascalCase (e.g., `YourStep`)

## Troubleshooting

### Step Not Appearing

**Problem**: Step doesn't show in funnel

**Solution**:
- Verify step ID is in `lib/steps/stepIds.ts`
- Check step is in funnel's `steps.order` array
- Verify slide exists at `app/funnel-slides/{stepId}/Slide.tsx`

### Step Skipped Incorrectly

**Problem**: Step is skipped when it shouldn't be

**Solution**:
- Check skip rules in funnel definition
- Verify trigger step value matches exactly (case-sensitive)
- Ensure trigger step comes before skipped step in order

### Step Data Not Persisting

**Problem**: Step value is lost on refresh

**Solution**:
- Verify using `select()` from `useStepController`
- Check session ID (sid) is set correctly
- Verify funnel context is provided

### Step Navigation Issues

**Problem**: Can't navigate to/from step

**Solution**:
- Check step order in funnel definition
- Verify step slugs are correct
- Check skip rules aren't interfering

## Related Guides

- [Slides Guide](./slides.md) - Creating slide components
- [Funnels Guide](./funnels.md) - Adding steps to funnels
- [Translations Guide](./translations.md) - Step translations

