# Domains Guide

## Overview

Domains are configured in `config/domains.json` and automatically get `www.` and `.local` variants. Each domain maps to a market configuration (locale, currency, payment provider).

## Adding a New Domain

### Step 1: Add Domain to Market Config

**File**: `config/domains.json`

Add a new entry:

```json
{
  "yourdomain.com": {
    "market": "us",
    "locale": "en",
    "currency": "USD",
    "checkoutProvider": "stripe"
  }
}
```

**Fields:**
- `market`: Market code ('pl', 'us', 'fr', 'de')
- `locale`: Language locale ('pl', 'en', 'fr', 'de')
- `currency`: Currency code ('PLN', 'USD', 'EUR')
- `checkoutProvider`: Payment provider ('p24', 'payu', 'stripe')

**Automatic Variants:**
- `yourdomain.com` → Added automatically
- `www.yourdomain.com` → Added automatically
- `yourdomain.local` → Added automatically for development

### Step 2: Add SEO Configuration

**File**: `config/domains/seo.ts`

Add SEO entries for the domain:

```typescript
export const domainSeoMap: Record<string, DomainSeoConfig> = {
  'yourdomain.com': {
    appTitle: 'Your Domain Name',
    home: {
      title: 'Home Page Title | Your Domain',
      description: 'Home page description for SEO',
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
      // Add entries for all funnels available on this domain
    },
    planForm: {
      title: 'Form Title | Your Domain',
      description: 'Form description',
    },
  },
  'www.yourdomain.com': {
    // Same as above (or reference the base domain)
  },
  'yourdomain.local': {
    // Same as above (or reference the base domain)
  },
}
```

**Note**: You need to add entries for all three variants (base, www, local) or they'll fall back to locale-based translations.

### Step 3: Test Domain

1. Add domain to `/etc/hosts` for local testing:
   ```
   127.0.0.1 yourdomain.local
   ```

2. Access `http://yourdomain.local:3000`

3. Verify:
   - Correct locale is detected
   - Correct currency is used
   - Correct payment provider is selected
   - SEO content is domain-specific

## Domain Configuration Structure

### Market Codes

- `pl`: Polish market
- `us`: US/English market
- `fr`: French market
- `de`: German market

### Locales

- `pl`: Polish
- `en`: English
- `fr`: French
- `de`: German

### Currencies

- `PLN`: Polish Zloty
- `USD`: US Dollar
- `EUR`: Euro

### Checkout Providers

- `p24`: Przelewy24 (Polish)
- `payu`: PayU (Polish)
- `stripe`: Stripe (International)

**Note**: Polish market (`pl`) can switch between `p24` and `payu` via `NEXT_PUBLIC_PL_PAYMENTS` environment variable.

## Domain Restrictions for Funnels

Funnels can be restricted to specific domains using `allowedDomains` in funnel definition:

```typescript
// In lib/funnels/funnelDefinitions.ts
your_funnel: {
  // ... other config
  allowedDomains: ['yourdomain.com', 'anotherdomain.com'], // Only on these domains
  // or
  allowedDomains: undefined, // Available on all domains (default)
}
```

**How it works:**
- If `allowedDomains` is undefined or empty, funnel is available on all domains
- If `allowedDomains` is set, funnel only appears on listed domains
- Domain checking is case-insensitive and handles `www.` variants
- Sitemap automatically filters funnels by domain restrictions

## Domain Detection

Domains are detected in `middleware.ts`:
1. Reads `x-forwarded-host` or `host` header
2. Normalizes domain (removes port, handles IPv6)
3. Strips `www.` prefix in production
4. Maps to locale via `getLocaleForHost()`

## Testing Domains Locally

### Method 1: Use .local Variant

1. Domain automatically gets `.local` variant
2. Add to `/etc/hosts`:
   ```
   127.0.0.1 yourdomain.local
   ```
3. Access `http://yourdomain.local:3000`

### Method 2: Use localhost with Header

Use a tool like `curl` or browser extension to set custom host header.

## Common Issues

### Domain Not Detected

**Problem**: Wrong locale or market detected

**Solution**:
- Verify domain is in `config/domains.json`
- Check domain name matches exactly (case-insensitive)
- Verify `www.` variant is handled (automatically added)

### SEO Not Domain-Specific

**Problem**: SEO content is locale-based, not domain-specific

**Solution**:
- Add domain entries to `config/domains/seo.ts`
- Verify all three variants (base, www, local) are configured
- Check `getDomainSeo()` is being called with correct host

### Funnel Not Available on Domain

**Problem**: Funnel returns 404 on specific domain

**Solution**:
- Check `allowedDomains` in funnel definition
- Verify domain name matches exactly (case-insensitive)
- Check domain normalization in `isFunnelAllowedOnDomain()`

## Files Involved

- `config/domains.json` - Domain market configuration
- `config/domains/seo.ts` - Domain SEO configuration
- `i18n/config.ts` - Domain mapping and utilities
- `middleware.ts` - Domain detection and locale routing
- `lib/funnels/funnelDefinitions.ts` - Funnel domain restrictions

## Related Guides

- [SEO Guide](./seo.md) - SEO configuration per domain
- [Funnels Guide](./funnels.md) - Funnel domain restrictions

