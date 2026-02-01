# Translations Guide

## Overview

All user-facing text must come from translation files. The project uses `next-intl` for internationalization. Translations are stored in JSON files per locale.

## Translation File Structure

**Location**: `i18n/translations/{locale}.json`

**Supported Locales**: `pl`, `en`, `fr`, `de`

**File Structure**:
```json
{
  "Namespace": {
    "key": "value",
    "nested": {
      "key": "nested value"
    }
  }
}
```

## Translation Namespaces

### Core Namespaces

1. **`Seo`** - SEO fallback translations
   - Used when domain-specific SEO is not configured
   - Contains: `appTitle`, `home`, `plan`, `dom`, `planForm`

2. **`PlanPage`**, **`DomPage`**, etc. - Funnel landing pages
   - One namespace per funnel (matches `translationNamespace` in funnel definition)
   - Contains: `titleHtml`, `description`, `button`, `assets`, etc.

3. **Step Namespaces** - One per step
   - `Gender` - Gender selection step
   - `DietGoal` - Diet goal step
   - `Bodyfat` - Body fat step
   - `Weight` - Weight step
   - `Height` - Height step
   - `Age` - Age step
   - `Activity` - Activity level step
   - `BMI` - BMI calculation step
   - `Location` - Training location step
   - `Equipment` - Equipment step
   - `Experience` - Experience step
   - `Difficulty` - Difficulty step
   - `Priority` - Priority step
   - `Frequency` - Frequency step
   - `Fitness` - Fitness level step
   - `Sleep` - Sleep step

4. **Component Namespaces**
   - `CheckoutProducts` - Checkout product names
   - `ReviewsWidget` - Reviews widget text

## Adding a New Language

### Step 1: Add Locale to Config

**File**: `i18n/config.ts`

Add locale to `locales` array:

```typescript
export const locales = ['pl', 'en', 'fr', 'de', 'es'] as const; // Add 'es'
```

### Step 2: Create Translation File

**File**: `i18n/translations/es.json`

Copy structure from existing locale (e.g., `en.json`) and translate all content.

### Step 3: Update Routing

**File**: `i18n/routing.ts`

Routing automatically uses locales from config, no changes needed.

### Step 4: Add Domain Mapping (Optional)

**File**: `config/domains.json`

Add domain entries for new locale:

```json
{
  "yourdomain.es": {
    "market": "es",
    "locale": "es",
    "currency": "EUR",
    "checkoutProvider": "stripe"
  }
}
```

## Adding Translations for a New Funnel

### Step 1: Add Landing Page Namespace

**Files**: `i18n/translations/*.json` (all language files)

Add namespace matching `translationNamespace` from funnel definition:

```json
{
  "YourFunnelPage": {
    "titleHtml": "Your Title<br /><span style='font-weight: 800'>with HTML</span>",
    "description": "Description with <em>formatting</em>.",
    "button": "Start Button",
    "assets": {
      "logo": "/path/to/logo.svg",
      "heroImage": "/path/to/hero.svg",
      "btnImage": "/path/to/button.svg",
      "homeUrl": "https://domain.com/",
      "privacyUrl": "https://domain.com/privacy",
      "termsUrl": "https://domain.com/terms"
    }
  }
}
```

### Step 2: Add SEO Translations (Optional)

**Files**: `i18n/translations/*.json` → `Seo` namespace

Add fallback SEO if domain-specific SEO not configured:

```json
{
  "Seo": {
    "your_funnel": {
      "title": "Funnel Title",
      "description": "Funnel description"
    }
  }
}
```

## Adding Translations for a New Step

### Step 1: Create Step Namespace

**Files**: `i18n/translations/*.json` (all language files)

Add namespace matching step name (e.g., `YourStep`):

```json
{
  "YourStep": {
    "title": "Step Title",
    "description": "Step description",
    "options": {
      "option1": "Option 1 Label",
      "option2": "Option 2 Label"
    }
  }
}
```

### Step 2: Use in Slide Component

```typescript
const t = useTranslations('YourStep');
<h1>{t('title')}</h1>
```

## Translation Best Practices

### 1. Never Hardcode Text

❌ **Bad**:
```typescript
<h1>Welcome</h1>
```

✅ **Good**:
```typescript
const t = useTranslations('Welcome');
<h1>{t('title')}</h1>
```

### 2. Use Rich Text Formatting

For HTML content, use `t.raw()` and `t.rich()`:

```typescript
// In JSON
{
  "titleHtml": "Title with <b>bold</b> and <br />line break"
}

// In component
<h1 dangerouslySetInnerHTML={{ __html: t.raw('titleHtml') }} />

// Or with rich formatting
<p>{t.rich('description', {
  em: (chunks) => <em>{chunks}</em>,
  br: () => <br />,
})}</p>
```

### 3. Keep Keys Consistent

Use consistent naming across locales:
- Same key structure
- Same nesting levels
- Same optional keys

### 4. Handle Missing Translations

`next-intl` automatically falls back to:
1. Translation in current locale
2. Translation in default locale
3. Translation key itself (if not found)

### 5. Use Namespaces

Group related translations:
- One namespace per component/feature
- One namespace per step
- One namespace per funnel

## Common Patterns

### Pattern 1: Simple Translation

```typescript
const t = useTranslations('Namespace');
<p>{t('key')}</p>
```

### Pattern 2: Nested Keys

```json
{
  "Namespace": {
    "nested": {
      "key": "value"
    }
  }
}
```

```typescript
const t = useTranslations('Namespace');
<p>{t('nested.key')}</p>
```

### Pattern 3: HTML Content

```json
{
  "Namespace": {
    "titleHtml": "Title with <b>bold</b>"
  }
}
```

```typescript
const t = useTranslations('Namespace');
<h1 dangerouslySetInnerHTML={{ __html: t.raw('titleHtml') }} />
```

### Pattern 4: Rich Formatting

```json
{
  "Namespace": {
    "description": "Text with <em>emphasis</em> and <br />line break"
  }
}
```

```typescript
const t = useTranslations('Namespace');
<p>{t.rich('description', {
  em: (chunks) => <em>{chunks}</em>,
  br: () => <br />,
})}</p>
```

### Pattern 5: Dynamic Keys

```json
{
  "Namespace": {
    "options": {
      "option1": "Option 1",
      "option2": "Option 2"
    }
  }
}
```

```typescript
const t = useTranslations('Namespace');
const options = ['option1', 'option2'].map(key => ({
  value: key,
  label: t(`options.${key}`)
}));
```

## Server vs Client Components

### Server Components

```typescript
import { getTranslations } from 'next-intl/server';

export default async function ServerComponent() {
  const t = await getTranslations('Namespace');
  return <h1>{t('title')}</h1>;
}
```

### Client Components

```typescript
'use client';
import { useTranslations } from 'next-intl';

export default function ClientComponent() {
  const t = useTranslations('Namespace');
  return <h1>{t('title')}</h1>;
}
```

## Troubleshooting

### Translation Not Found

**Problem**: Shows translation key instead of text

**Solution**:
- Verify namespace exists in translation file
- Check key spelling matches exactly
- Ensure locale file exists and is loaded

### HTML Not Rendering

**Problem**: HTML tags show as text

**Solution**:
- Use `t.raw()` with `dangerouslySetInnerHTML`
- Or use `t.rich()` with formatters
- Don't use regular `t()` for HTML content

### Missing Translation in One Locale

**Problem**: One locale shows key, others work

**Solution**:
- Check translation file for that locale
- Verify key exists in all locales
- Check JSON syntax is valid

## Files Involved

- `i18n/translations/*.json` - Translation files
- `i18n/config.ts` - Locale configuration
- `i18n/routing.ts` - Routing configuration
- `i18n/request.ts` - Translation loading

## Related Guides

- [Funnels Guide](./funnels.md) - Funnel landing page translations
- [Slides Guide](./slides.md) - Step translations
- [SEO Guide](./seo.md) - SEO translations

