# SEO Guide

## Overview

SEO is **domain-specific** and **funnel-specific**. Each domain can have independent SEO content, even if they share the same locale. This allows different branding and messaging per domain.

## SEO Structure

### Domain SEO Configuration

**File**: `config/domains/seo.ts`

```typescript
export type DomainSeoConfig = {
  appTitle: string;                    // App title (used in <title>, apple-mobile-web-app-title)
  home: { title: string; description: string };  // Homepage SEO
  funnels?: Record<string, { title: string; description: string }>;  // Funnel-specific SEO
  planForm?: { title: string; description: string };  // Form page SEO
}
```

### Recommended Structure (New)

Use the `funnels` object keyed by funnel key:

```typescript
'yourdomain.com': {
  appTitle: 'Your Domain Name',
  home: {
    title: 'Home Title | Your Domain',
    description: 'Home description',
  },
  funnels: {
    plan: {
      title: 'Plan Title | Your Domain',
      description: 'Plan description',
    },
    dom: {
      title: 'Home Workout Title | Your Domain',
      description: 'Home workout description',
    },
    your_funnel: {
      title: 'Your Funnel Title | Your Domain',
      description: 'Your funnel description',
    },
  },
  planForm: {
    title: 'Form Title | Your Domain',
    description: 'Form description',
  },
}
```

### Legacy Structure (Still Supported)

Legacy `plan` and `dom` keys are still supported for backwards compatibility:

```typescript
'yourdomain.com': {
  appTitle: 'Your Domain Name',
  home: { title: '...', description: '...' },
  plan: { title: '...', description: '...' },
  dom: { title: '...', description: '...' },
  planForm: { title: '...', description: '...' },
}
```

## Adding SEO for a New Domain

### Step 1: Add Domain SEO Entry

**File**: `config/domains/seo.ts`

Add entries for all three variants (base, www, local):

```typescript
export const domainSeoMap: Record<string, DomainSeoConfig> = {
  'newdomain.com': {
    appTitle: 'New Domain Name',
    home: {
      title: 'Home Page Title | New Domain',
      description: 'Home page description for SEO',
    },
    funnels: {
      plan: {
        title: 'Plan Title | New Domain',
        description: 'Plan description for SEO',
      },
      // Add entries for all funnels available on this domain
    },
    planForm: {
      title: 'Form Title | New Domain',
      description: 'Form description for SEO',
    },
  },
  'www.newdomain.com': {
    // Same as above
  },
  'newdomain.local': {
    // Same as above
  },
}
```

### Step 2: Add SEO for New Funnel

When adding a new funnel, add SEO entries for all domains:

```typescript
'trenerstrzykawa.pl': {
  // ... existing config
  funnels: {
    plan: { /* ... */ },
    dom: { /* ... */ },
    new_funnel: {  // Add new funnel SEO
      title: 'New Funnel Title | Trener Strzykawa',
      description: 'New funnel description',
    },
  },
}
```

## How SEO Works

### Fallback Chain

1. **Domain-specific SEO** (from `config/domains/seo.ts`)
2. **Locale-based translations** (from `i18n/translations/*.json` → `Seo` namespace)

If domain SEO is not configured, it falls back to locale-based translations automatically.

### Usage in Code

**Homepage** (`app/[locale]/layout.tsx`):
```typescript
const title = await getDomainSeoTitle(host, locale, 'home');
const description = await getDomainSeoDescription(host, locale, 'home');
```

**Funnel Landing Page** (`lib/metadata/funnelLandingMetadata.ts`):
```typescript
const title = await getDomainSeoTitle(host, locale, funnelKey);
const description = await getDomainSeoDescription(host, locale, funnelKey);
```

**Form Pages** (`app/[locale]/(funnels)/[funnel]/(slides)/[step]/page.tsx`):
```typescript
const title = await getDomainSeoTitle(host, locale, 'planForm');
const description = await getDomainSeoDescription(host, locale, 'planForm');
```

## SEO Metadata Types

### Landing Pages (Indexed)

**Function**: `funnelLandingMetadata()`

- `index: true, follow: true`
- Used for funnel landing pages (e.g., `/plan`, `/dom`)
- Appears in sitemap

### Step Pages (Not Indexed)

**Function**: `funnelStepMetadata()`

- `index: false, follow: false`
- Used for funnel step pages (e.g., `/plan/gender`, `/plan/diet_goal`)
- Not in sitemap, prevents indexing of intermediate steps

### Homepage

**Function**: `createMetadata()`

- Uses `home` SEO from domain config
- Indexed and in sitemap

## Canonical URLs

Canonical URLs are automatically generated:
- Use incoming `baseUrl` (host header) by default
- Can be overridden with `*_BASE_URL` environment variables
- Local development (`.local`) doesn't generate canonicals

## Sitemap Generation

**File**: `app/sitemap.ts`

Sitemap automatically:
- Includes all funnels from `funnelDefinitions`
- Generates entries for all locales
- Respects domain restrictions (only includes funnels allowed on current domain)
- Updates when funnels are added/removed

## Best Practices

### 1. Domain-Specific Branding

Each domain should have unique:
- `appTitle` (brand name)
- Titles and descriptions that reflect domain branding
- Even if sharing locale with another domain

### 2. Funnel-Specific SEO

Each funnel should have:
- Unique title and description
- Relevant keywords for the funnel type
- Clear value proposition

### 3. Title Format

Recommended format:
```
{Page/Funnel Name} | {Brand Name}
```

Examples:
- `Plan treningowy | Trener Strzykawa`
- `Workout plan | Coach Plate`
- `Your Home Workout Plan | Coach Plate`

### 4. Description Length

- Keep descriptions between 150-160 characters
- Include primary keywords
- Clear call-to-action or value proposition

## Common Issues

### SEO Not Domain-Specific

**Problem**: All domains show same SEO content

**Solution**:
- Verify domain entries in `config/domains/seo.ts`
- Check all three variants (base, www, local) are configured
- Verify `getDomainSeoTitle/Description` is called with correct parameters

### Missing Funnel SEO

**Problem**: Funnel landing page shows generic SEO

**Solution**:
- Add funnel entry to `funnels` object in domain SEO config
- Verify funnel key matches exactly
- Check fallback to locale translations if domain not configured

### Canonical URL Issues

**Problem**: Wrong canonical URL

**Solution**:
- Check `baseUrl` is passed correctly from headers
- Verify `*_BASE_URL` env vars if using strict normalization
- Check domain normalization in `resolveBaseUrl()`

## Files Involved

- `config/domains/seo.ts` - Domain SEO configuration
- `lib/seo/getDomainSeo.ts` - SEO retrieval utilities
- `lib/metadata.ts` - Metadata building functions
- `lib/metadata/funnelLandingMetadata.ts` - Funnel landing page metadata
- `app/[locale]/layout.tsx` - Homepage metadata
- `app/sitemap.ts` - Sitemap generation

## Related Guides

- [Domains Guide](./domains.md) - Adding domains
- [Funnels Guide](./funnels.md) - Funnel configuration

