# Funnels Guide

## Overview

Funnels are now configured in **one place**: `lib/funnels/funnelDefinitions.ts`. All funnel configuration is consolidated here, making it easy to add new funnels or modify existing ones.

## Creating a New Funnel

### Complete Checklist

Follow this checklist to add a new funnel:

#### 1. Add Funnel Definition

**File**: `lib/funnels/funnelDefinitions.ts`

Add a new entry to the `funnelDefinitions` object:

```typescript
export const funnelDefinitions = {
  // ... existing funnels
  your_funnel: {
    slug: { pl: 'twoj_funnel', en: 'your_funnel', fr: 'votre_funnel', de: 'dein_funnel' },
    resultSlug: { pl: 'twoj_funnel', en: 'your_funnel', fr: 'votre_funnel', de: 'dein_funnel' },
    translationNamespace: 'YourFunnelPage', // Must match translation key
    allowedDomains: undefined, // undefined = all domains, or ['domain1.com', 'domain2.com']
    item: 'product_name',
    pricePLN: 3999,
    currency: 'PLN',
    pricing: sharedPricing, // Or define custom pricing
    steps: stepsFor(
      [
        'gender',
        'diet_goal',
        // ... your step order
      ] as const,
      [
        // Optional skip rules
        {
          trigger: { step: 'location', value: 'gym' },
          skip: ['equipment'],
        },
      ]
    ),
    resultTemplate: 'standard',
  },
} satisfies Record<string, FunnelDefinition>
```

**Required Fields:**
- `slug`: URL segment per locale (e.g., `/plan`, `/dom`)
- `resultSlug`: Results page URL segment (usually same as slug)
- `translationNamespace`: Must match translation key in JSON files
- `steps.order`: Array of step IDs in order
- `item`: Product/item identifier
- `pricePLN`: Base price in PLN (cents)
- `currency`: Base currency

**Optional Fields:**
- `allowedDomains`: Array of domains where funnel is available (undefined = all domains)
- `pricing`: Per-locale pricing (uses `sharedPricing` if not specified)
- `resultTemplate`: Result page template ('standard' is default)
- `steps.skipRules`: Conditional step skipping logic

#### 2. Add Landing Page Translations

**Files**: `i18n/translations/*.json` (all language files)

Add a new translation namespace matching `translationNamespace`:

```json
{
  "YourFunnelPage": {
    "homeLabel": "Home Label",
    "titleHtml": "Your Funnel<br /><span style='font-weight: 800'>Title</span>",
    "heroAlt": "Hero image alt text",
    "description": "Your funnel description with <em>formatting</em>.",
    "button": "Start Button Text",
    "privacy": "Privacy Policy",
    "terms": "Terms of Service",
    "assets": {
      "logo": "/path/to/logo.svg",
      "heroImage": "/path/to/hero.svg",
      "btnImage": "/path/to/button.svg",
      "homeUrl": "https://yourdomain.com/",
      "privacyUrl": "https://yourdomain.com/privacy",
      "termsUrl": "https://yourdomain.com/terms"
    }
  }
}
```

**Required Keys:**
- `titleHtml`: HTML title (can include `<br>`, `<span>`, etc.)
- `description`: Description text (can include `<em>`, `<i>`, `<br>`)
- `button`: CTA button text
- `assets.logo`: Logo image path
- `assets.heroImage`: Hero image path
- `assets.btnImage`: Button image path
- `assets.homeUrl`: Homepage URL
- `assets.privacyUrl`: Privacy policy URL
- `assets.termsUrl`: Terms of service URL

**Optional Keys:**
- `homeLabel`: Home link label
- `heroAlt`: Hero image alt text
- `privacy`: Privacy link text
- `terms`: Terms link text

#### 3. Add SEO Configuration

**File**: `config/domains/seo.ts`

Add SEO entries for each domain. You can use the new `funnels` structure or legacy `plan`/`dom` keys:

```typescript
export const domainSeoMap: Record<string, DomainSeoConfig> = {
  'yourdomain.com': {
    appTitle: 'Your Domain Name',
    home: {
      title: 'Home Page Title',
      description: 'Home page description',
    },
    funnels: {
      your_funnel: {
        title: 'Your Funnel Title | Your Domain',
        description: 'Your funnel description for SEO',
      },
    },
    planForm: {
      title: 'Form Title',
      description: 'Form description',
    },
  },
  // ... other domains
}
```

**Note**: The `funnels` object uses funnel keys (e.g., 'plan', 'your_funnel') and is the recommended approach. Legacy `plan` key is still supported for backwards compatibility.

#### 4. Verify Step Order

Ensure all steps in your `steps.order` array:
- Exist in `lib/steps/stepIds.ts`
- Have corresponding slides in `app/funnel-slides/{stepId}/Slide.tsx`
- Have slugs defined in `lib/steps/stepSlugs.ts`

#### 5. Test the Funnel

1. Navigate to `/{funnelSlug}` (e.g., `/plan`, `/dom`)
2. Verify landing page renders correctly
3. Verify translations load
4. Verify step order is correct
5. Test skip rules if defined
6. Verify domain restrictions if set

## Managing Existing Funnels

### Modifying Step Order

**File**: `lib/funnels/funnelDefinitions.ts`

Update the `steps.order` array:

```typescript
steps: stepsFor(
  [
    'gender',
    'new_step',  // Add new step
    'diet_goal',
    // Remove or reorder steps
  ] as const,
  skipRules
)
```

### Adding Skip Rules

Skip rules allow conditional step skipping based on answers:

```typescript
steps: stepsFor(
  stepOrder,
  [
    {
      trigger: { step: 'location', value: 'gym' },
      skip: ['equipment'], // Skip 'equipment' step if location is 'gym'
    },
    {
      trigger: { step: 'gender', value: 'F' },
      skip: ['some_step'], // Skip step for females
    },
  ]
)
```

### Restricting to Specific Domains

Set `allowedDomains` to restrict funnel availability:

```typescript
allowedDomains: ['trenerstrzykawa.pl', 'coachplate.com'], // Only on these domains
// or
allowedDomains: undefined, // Available on all domains (default)
```

### Changing Pricing

Option 1: Use shared pricing (recommended if same across funnels):
```typescript
pricing: sharedPricing,
```

Option 2: Define custom pricing:
```typescript
pricing: {
  pl: {
    currency: 'PLN',
    workout_solo: { amount: 35.99, description: 'workout_solo' },
    workout_bundle: { amount: 39.99, description: 'workout_bundle' },
  },
  // ... other locales
}
```

## All Files That Need Changes

When creating a new funnel, you need to modify:

1. **`lib/funnels/funnelDefinitions.ts`** - Add funnel definition (REQUIRED)
2. **`config/funnels/landingPages.ts`** - Add landing page asset configuration (REQUIRED)
3. **`i18n/translations/*.json`** - Add landing page translations (REQUIRED)
4. **`config/domains/seo.ts`** - Add SEO entries per domain (REQUIRED)

**Files you DON'T need to modify:**
- ❌ No need to create landing page files (handled by `[funnel]/page.tsx`)
- ❌ No need to create layout files (handled dynamically)
- ❌ No need to modify routing (uses `/[funnel]` pattern)
- ❌ No need to modify sitemap (generates automatically)

## Common Pitfalls

### 1. Translation Namespace Mismatch

**Problem**: Landing page shows translation errors

**Solution**: Ensure `translationNamespace` in funnel definition exactly matches the key in translation JSON files.

### 2. Step Not Found

**Problem**: Step doesn't appear or causes errors

**Solution**: 
- Verify step ID is in `lib/steps/stepIds.ts`
- Verify step slug is in `lib/steps/stepSlugs.ts`
- Verify slide exists at `app/funnel-slides/{stepId}/Slide.tsx`

### 3. Domain Restrictions Not Working

**Problem**: Funnel appears on domains where it shouldn't

**Solution**:
- Check `allowedDomains` array includes exact domain names (without www)
- Verify domain normalization in `isFunnelAllowedOnDomain` function
- Check middleware is passing host header correctly

### 4. SEO Not Showing

**Problem**: SEO content not domain-specific

**Solution**:
- Verify SEO entries in `config/domains/seo.ts` for each domain
- Check funnel key matches in `funnels` object
- Verify `getDomainSeoTitle/Description` is called with correct funnel key

### 5. Skip Rules Not Working

**Problem**: Steps not being skipped

**Solution**:
- Verify trigger step value matches exactly (case-sensitive)
- Check step IDs in skip array are valid
- Ensure trigger step comes before skipped steps in order

## Funnel Definition Reference

### Full Type Definition

```typescript
type FunnelDefinition = {
  slug: LocalizedStringMap                    // URL segment per locale
  resultSlug?: LocalizedStringMap            // Results URL segment (defaults to slug)
  translationNamespace: string                // Translation key for landing page
  allowedDomains?: string[]                  // Domain restrictions (undefined = all)
  item: string                               // Product identifier
  pricePLN: number                           // Base price in PLN (cents)
  currency: string                           // Base currency
  pricing?: Partial<Record<Locale, Pricing>> // Per-locale pricing
  resultTemplate?: 'standard'                // Result page template
  steps: {
    order: readonly StepId[]                 // Step order
    slugs: Record<StepId, LocalizedStringMap> // Step slugs (auto from STEP_SLUGS)
    skipRules?: SkipRule[]                   // Conditional skip logic
  }
}
```

### Skip Rule Structure

```typescript
type SkipRule = {
  trigger: {
    step: StepId    // Step ID to check
    value: string   // Value that triggers skip
  }
  skip: StepId[]   // Steps to skip when triggered
}
```

## Examples

### Example 1: Simple Funnel

```typescript
simple: {
  slug: { pl: 'prosty', en: 'simple', fr: 'simple', de: 'einfach' },
  resultSlug: { pl: 'prosty', en: 'simple', fr: 'simple', de: 'einfach' },
  translationNamespace: 'SimplePage',
  allowedDomains: undefined,
  item: 'simple_product',
  pricePLN: 2999,
  currency: 'PLN',
  pricing: sharedPricing,
  steps: stepsFor(['gender', 'age', 'weight'] as const),
  resultTemplate: 'standard',
}
```

### Example 2: Domain-Restricted Funnel

```typescript
premium: {
  slug: { pl: 'premium', en: 'premium', fr: 'premium', de: 'premium' },
  resultSlug: { pl: 'premium', en: 'premium', fr: 'premium', de: 'premium' },
  translationNamespace: 'PremiumPage',
  allowedDomains: ['premiumdomain.com'], // Only on this domain
  item: 'premium_product',
  pricePLN: 9999,
  currency: 'PLN',
  pricing: {
    pl: { currency: 'PLN', workout_solo: { amount: 99.99, description: 'premium_solo' }, workout_bundle: { amount: 149.99, description: 'premium_bundle' } },
    // ... other locales
  },
  steps: stepsFor(['gender', 'diet_goal', 'weight', 'age'] as const),
  resultTemplate: 'standard',
}
```

## Related Files

- `lib/funnels/funnelDefinitions.ts` - Funnel definitions (main file)
- `lib/funnels/funnels.ts` - Funnel utilities and helpers
- `app/[locale]/(funnels)/[funnel]/page.tsx` - Dynamic landing page
- `app/components/funnels/FunnelLandingPage.tsx` - Landing page component
- `i18n/translations/*.json` - Translations
- `config/domains/seo.ts` - SEO configuration
- `app/sitemap.ts` - Sitemap generation

