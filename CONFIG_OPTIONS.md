# Musclepals Quiz – Central Config Options

A reference list of options to consider when creating a single configuration that manages the whole project.

---

## 1. Site & Branding

| Option | Description | Current Location |
|--------|-------------|------------------|
| `canonicalHost` | Primary domain (e.g. `quiz.musclepals.com`) | `config/site.ts` |
| `baseUrl` | Full base URL (falls back to canonical; overridden by env) | `config/site.ts` |
| `appTitle` | Default app title across locales | `config/metadata.ts` |
| `defaultLocale` | Fallback locale when none in URL | `config/i18n.ts` |
| `assetPaths` | Logos, buttons, images, placeholders | `config/imagePaths.ts` |

---

## 2. Locales & Markets

| Option | Description | Current Location |
|--------|-------------|------------------|
| `locales` | Enabled locales (e.g. `pl`, `en`, `ro`, …) | `config/i18n.ts` |
| `localeConfig` | Per-locale: market, currency, checkout provider, GTM, FB Pixel, funnels | `config/i18n.ts` |
| `marketToCountry` | Map market code → country code | `config/i18n.ts` |
| `supportEmails` | Per-locale support email | `config/support.ts` |
| `defaultSupportEmail` | Fallback support email | `config/support.ts` |

---

## 3. Quiz & Funnel Flow

| Option | Description | Current Location |
|--------|-------------|------------------|
| `funnelStepsOrder` | Order of quiz steps | `config/funnelFlow.ts` |
| `funnelSkipRules` | Conditions to skip steps (e.g. location=gym → skip equipment) | `config/funnelFlow.ts` |
| `disabledSteps` | Steps hidden/disabled globally | `config/quiz.ts` |
| `disabledEquipment` | Equipment options disabled | `config/quiz.ts` |
| `funnels` | Available funnel IDs (e.g. `workout`) | `config/i18n.ts` per locale |

---

## 4. Payments

| Option | Description | Current Location |
|--------|-------------|------------------|
| `plPayment.sandbox` | Polish payment sandbox mode | env + `config/payment.ts` |
| `plPayment.provider` | Polish provider: `payu` \| `p24` | env + `config/payment.ts` |
| `payu.payuSandbox` | PayU sandbox flag | env |
| `p24.p24Sandbox` | P24 sandbox flag | env |
| `stripe.stripeSandbox` | Stripe sandbox flag | env |
| `payu.credentials` | PayU sandbox/production credentials | `config/credentials.ts` |
| `p24.credentials` | P24 sandbox/production credentials | `config/credentials.ts` |
| `stripe.credentials` | Stripe sandbox/production credentials | `config/credentials.ts` |
| `plPayment.payu.*` | PayU merchant/pos keys (fallback) | `config/payment.ts` |
| `plPayment.p24.*` | P24 merchant/crc keys (fallback) | `config/payment.ts` |

---

## 5. Integrations

| Option | Description | Current Location |
|--------|-------------|------------------|
| `n8n.webhookUrl` | n8n automation webhook URL | `.env` |
| `n8n.webhookSecret` | Webhook secret for validation | `.env` |
| `s3.bucket` | S3 bucket name | `config/credentials.ts` |
| `s3.region` | S3 region | `config/credentials.ts` |
| `s3.endpoint` | S3 endpoint URL | `config/credentials.ts` |
| `s3.credentials` | Access key + secret | `config/credentials.ts` |

---

## 6. Analytics & Tracking

| Option | Description | Current Location |
|--------|-------------|------------------|
| `gtmId` | Global GTM ID (default) | `config/site.ts` |
| `fbPixelId` | Global FB Pixel ID (default) | `config/site.ts` |
| `localeGtmId` | Per-locale GTM override | `config/i18n.ts` |
| `localeFbPixelId` | Per-locale FB Pixel override | `config/i18n.ts` |
| `analytics.events` | Event names (e.g. `quiz_completed`, `purchase`) | `config/Analytics.ts` |

---

## 7. Metadata & SEO

| Option | Description | Current Location |
|--------|-------------|------------------|
| `localeMetadata` | Per-locale: `appTitle`, `home`, `planForm`, `ogImage`, `funnels` | `config/metadata.ts` |
| `funnelMetadata` | Per-funnel titles/descriptions | `config/metadata.ts` |

---

## 8. Environment & Runtime

| Option | Description | Current Location |
|--------|-------------|------------------|
| `databaseUrl` | PostgreSQL connection string | `.env` |
| `spoofing` | Dev domain spoofing enabled | `.env` |
| `devUrl` | Local base URL when spoofing | `.env` |
| `spoofed` | Domain to simulate (e.g. `quiz.musclepals.com`) | `.env` |

---

## 9. Build & Tooling (if included)

| Option | Description | Current Location |
|--------|-------------|------------------|
| `tsconfig.paths` | Path aliases (e.g. `@/*`) | `tsconfig.json` |
| `next.intl` | next-intl plugin config | `next.config.ts` |
| `tailwind.content` | Tailwind content paths | `postcss.config.mjs` |
| `eslint.rules` | Custom lint rules | `eslint.config.mjs` |

---

## 10. Optional / Future

| Option | Description |
|--------|-------------|
| `featureFlags` | Feature toggles (e.g. new payment flow, A/B variants) |
| `rateLimits` | API rate limits per endpoint |
| `maintenanceMode` | Maintenance flag / message |
| `debug` | Debug logging enabled |
| `allowedOrigins` | CORS allowed origins |
| `sessionTimeout` | User session / quiz timeout in minutes |
| `maxRetries` | Payment / webhook retry counts |

---

## Suggested Config Structure (High-Level)

```
config/
├── project.config.ts      # Single entry – imports & re-exports
└── sections/
    ├── site.ts
    ├── locales.ts
    ├── quiz.ts
    ├── payments.ts
    ├── integrations.ts
    ├── analytics.ts
    └── metadata.ts
```

**Or** a single `config.ts` / `project.config.ts` with nested objects:

```ts
export const projectConfig = {
  site: { ... },
  locales: { ... },
  quiz: { ... },
  payments: { ... },
  integrations: { ... },
  analytics: { ... },
  metadata: { ... },
};
```

**Tradeoff:** Single file = easier overview, but harder to navigate. Split files = clearer separation, but more imports. Recommendation: keep split files and add a thin `project.config.ts` that re-exports everything for consumers that want "one config."
