# Musclepals Quiz — Codebase Overview

Next.js 15 quiz funnel app (App Router, TypeScript, next-intl, Prisma, Zustand).

---

## Directory Structure

```
musclepals-quiz/
├── app/                        # Next.js App Router
│   ├── [locale]/               # Locale-prefixed routes
│   │   ├── page.tsx            # Redirects to default funnel
│   │   ├── layout.tsx          # Root layout (GTM, FB Pixel)
│   │   ├── not-found.tsx       # 404 page
│   │   ├── (funnels)/[funnel]/
│   │   │   ├── page.tsx        # Redirects to first quiz step
│   │   │   ├── layout.tsx      # Funnel layout (FunnelProvider)
│   │   │   └── (slides)/[step]/
│   │   │       └── page.tsx    # Renders each quiz step slide
│   │   ├── result/
│   │   │   ├── [funnel]/[sessionId]/
│   │   │   │   └── page.tsx    # Result + checkout page
│   │   │   └── order/[sessionId]/
│   │   │       └── page.tsx    # Post-purchase confirmation
│   │   └── technical-issues/
│   │       └── page.tsx        # Error fallback page
│   ├── api/                    # API routes
│   │   ├── stripe/{create,notify,webhook}/route.ts
│   │   ├── payu/{create,notify}/route.ts
│   │   ├── p24/{create,notify}/route.ts
│   │   ├── exchange-rates/route.ts
│   │   ├── getPurchaseData/route.ts
│   │   └── data/{count,status}/route.ts
│   ├── components/
│   │   ├── funnels/
│   │   │   ├── NextButton.tsx          # CTA button with locale-aware image
│   │   │   ├── NextButton.config.ts    # Per-funnel button image overrides
│   │   │   ├── SelectMenu.tsx          # Option picker (single/multi select)
│   │   │   └── StepRangeSlider.tsx     # Custom range slider
│   │   ├── header/
│   │   │   ├── ProgressHeader.tsx      # Back button + animated progress bar
│   │   │   └── GoBack.tsx              # Standalone back button
│   │   └── result/
│   │       ├── templates/
│   │       │   ├── StandardResultPage.tsx  # Full result page layout
│   │       │   └── config.ts               # Feature flags + image paths per funnel
│   │       ├── form/
│   │       │   ├── form.tsx            # Checkout form (name/email/payment)
│   │       │   ├── form_pixel.ts       # Pricing resolution + analytics events
│   │       │   ├── checkout_intro.tsx  # Product image + description header
│   │       │   ├── DetailsSection.tsx  # Order details section
│   │       │   ├── PaymentSection.tsx  # Payment method section
│   │       │   └── ContactForm.tsx     # Contact/support form
│   │       ├── answers_summary/
│   │       │   ├── answers_summary.tsx # Collapsible quiz answers accordion
│   │       │   ├── config.ts           # Hidden keys + display options per funnel
│   │       │   ├── mappings.ts         # Emoji + value formatting
│   │       │   └── index.ts            # Barrel export
│   │       ├── youvsfuture/
│   │       │   ├── YOUVSFUTURE.tsx     # Current vs. future body comparison
│   │       │   └── config.ts           # Images, colors, bodyfat % map
│   │       ├── faq/
│   │       │   ├── FaqSection.tsx      # FAQ section wrapper
│   │       │   └── FaqAccordion.tsx    # Accordion component
│   │       ├── Carousel/
│   │       │   ├── Carousel.tsx        # Image carousel
│   │       │   └── c_arrows.tsx        # Arrow controls
│   │       ├── BMIBOX.tsx              # BMI display box
│   │       ├── TDEEBOX.tsx             # TDEE/calorie target display
│   │       ├── PlanSummary.tsx         # Summary of quiz answers as plan cards
│   │       ├── MissingStepsView.tsx    # Error screen for incomplete quiz
│   │       ├── PaymentButton.tsx       # Payment provider button
│   │       ├── ReviewsMarquee.tsx      # Scrolling reviews strip
│   │       └── StickyScroll.tsx        # Sticky scroll container
│   ├── funnel-slides/              # One folder per quiz step
│   │   └── {stepId}/Slide.tsx      # activity, age, bmi, bodyfat, cardio,
│   │                               # diet_goal, difficulty, duration, equipment,
│   │                               # experience, fitness, frequency, gender,
│   │                               # height, location, physique_goal, priority,
│   │                               # pullups, pushups, sleep, weight
│   ├── file/[locale]/[token]/[type]/route.ts  # PDF file download
│   ├── sitemap.ts                  # Dynamic sitemap
│   └── sw.js/route.ts              # Service worker stub
│
├── config/                     # App-wide settings (no business logic)
│   ├── quiz.ts                 # Step order, skip rules, disabled steps/equipment
│   ├── site.ts                 # Canonical host, main site URL, GTM/FB IDs, analytics events
│   ├── i18n.ts                 # Locales, markets, checkout providers per locale
│   ├── metadata.ts             # SEO metadata per locale
│   ├── imagePaths.ts           # Asset path templates per locale
│   ├── support.ts              # Support email addresses per locale
│   ├── payment.ts              # Payment sandbox flag + provider config per locale
│   └── credentials.ts          # Payment API credentials (PayU, P24, Stripe, S3)
│
├── lib/                        # Shared utilities and logic
│   ├── quiz/                   # Quiz engine (canonical source of truth)
│   │   ├── index.ts            # Barrel export for everything in lib/quiz/
│   │   ├── stepIds.ts          # ALL_STEPS list, StepId type, step tags
│   │   ├── stepSlugs.ts        # URL slug per step ID
│   │   ├── ignoredSteps.ts     # Steps excluded from progress count
│   │   ├── funnelDefinitions.ts # Funnel type, pricing, step config per funnel
│   │   ├── funnels.ts          # Funnel helper functions (slugs, steps, domains)
│   │   ├── funnelContext.tsx   # FunnelProvider + useCurrentFunnel hook
│   │   ├── navigation.ts       # getSkippedSteps, resolveNextStep, resolvePrevStep
│   │   ├── stepValidation.ts   # getMissingSteps (required unanswered steps)
│   │   ├── store.ts            # Zustand store (persisted quiz answers)
│   │   └── useStepController.ts # Main quiz hook (select, next, prev, go)
│   ├── domain/
│   │   ├── host.ts             # getHost() — reads request host header
│   │   ├── incomingHost.ts     # Server-side host resolution
│   │   └── effectiveHost.ts    # Resolves effective host with spoofing support
│   ├── i18n/
│   │   ├── localeUtils.ts      # Locale helper utilities
│   │   ├── countryUtils.ts     # Country code helpers
│   │   └── emailUtils.ts       # getSupportEmail() per locale
│   ├── db/
│   │   └── stats.ts            # Prisma queries for analytics stats
│   ├── stripe/
│   │   └── orderProcessor.ts   # Stripe order fulfillment logic
│   ├── gender/
│   │   └── normalizeGenderMF.ts # Normalize gender values to M/F
│   ├── analytics.ts            # trackEvent, pushToDataLayer, convenience wrappers
│   ├── facebookPixel.ts        # FB Pixel trackStandardEvent / trackCustomEvent
│   ├── FacebookPixelProvider.ts # Client-side FB Pixel initializer
│   ├── calc.ts                 # BMR / TDEE / plan calculations
│   ├── health.ts               # BMI + health calculations
│   ├── conversionRates.ts      # Currency conversion helpers
│   ├── exchangeRateApi.ts      # Exchange rate API client
│   ├── imagePath.ts            # Image path resolution helpers
│   ├── metadata.ts             # generateMetadata helper
│   ├── faq.ts                  # FAQ markdown loader
│   ├── n8n.ts                  # n8n webhook client
│   ├── prisma.ts               # Prisma client singleton
│   ├── rateLimit.ts            # Simple rate limiter
│   ├── requestBaseUrl.ts       # Base URL resolution for API calls
│   ├── emailValidator.ts       # Email validation utilities
│   ├── useMarket.ts            # useMarket() client hook
│   └── usePlanField.ts         # usePlanField() — read/write single store field
│
├── i18n/                       # next-intl configuration
│   ├── routing.ts              # Locale routing config
│   ├── config.ts               # Market/locale resolvers, checkout provider utils
│   ├── request.ts              # Per-request config (loads translations, injects URLs)
│   └── translations/           # JSON translation files
│       └── {pl,en,de,fr,ro,cz,bg,hu,it}.json
│
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── migrations/             # SQL migration history
│
├── content/                    # Markdown content
│   └── {pl,en,ro,cz,bg,hu}/faq.md
│
├── public/                     # Static assets
│   ├── btns/                   # Locale-specific CTA button SVGs
│   ├── regional/               # Locale-specific product images
│   ├── example_training/       # Locale-specific sample training plan PNGs
│   ├── vectors/                # Logo, body/exercise SVGs
│   ├── payments/               # Payment provider logos
│   └── components/             # Shared UI SVGs (dynamic_line, boxes)
│
├── scripts/                    # Utility scripts (not part of the app)
│   ├── convert_last_checkout.ts
│   ├── fetch-rates.ts
│   ├── generate-pdf-token.ts
│   ├── rename_assets.js
│   ├── update_translations_assets.js
│   └── verify_locales.js
│
├── middleware.ts               # Next.js middleware (locale routing, canonical redirect)
├── next.config.ts              # Next.js configuration
├── prisma.config.ts            # Prisma configuration
└── .env / .env.example         # Environment variables
```

---

## Key Files Quick Reference

| What you want to change | File |
|---|---|
| Step order / skip rules | `config/quiz.ts` |
| Disable a step or equipment | `config/quiz.ts` |
| GTM ID / FB Pixel ID | `config/site.ts` |
| Main site URL | `config/site.ts` → `MAIN_SITE_URL` |
| Analytics event names | `config/site.ts` → `ANALYTICS_CONFIG.events` |
| Locales / markets | `config/i18n.ts` |
| Checkout provider per locale | `config/i18n.ts` → `localeMarketMap` |
| Pricing per locale | `lib/quiz/funnelDefinitions.ts` → `sharedPricing` |
| Support emails | `config/support.ts` |
| Page metadata / OG images | `config/metadata.ts` |
| Asset paths | `config/imagePaths.ts` |
| Payment credentials | `config/credentials.ts` |
| Payment sandbox mode | `config/payment.ts` |
| Add a new quiz step | `lib/quiz/stepIds.ts` + `config/quiz.ts` + new `app/funnel-slides/{step}/Slide.tsx` |
| Add a new funnel | `lib/quiz/funnelDefinitions.ts` |
| Result page feature flags | `app/components/result/templates/config.ts` |
| Translations | `i18n/translations/{locale}.json` |

---

## Data Flow

```
User visits /[locale]/[funnel]/[step]
        │
        ▼
app/[locale]/(funnels)/[funnel]/(slides)/[step]/page.tsx
  → dynamically imports app/funnel-slides/{step}/Slide.tsx
  → wraps with <FunnelProvider>
        │
        ▼
Slide.tsx uses useStepController() (lib/quiz/useStepController.ts)
  → reads/writes answers via useFunnelStore (lib/quiz/store.ts — Zustand, persisted)
  → navigation via resolveNextStep/resolvePrevStep (lib/quiz/navigation.ts)
  → skip rules from config/quiz.ts → FUNNEL_SKIP_RULES
        │
        ▼
User completes quiz → redirected to /[locale]/result/[funnel]/[sessionId]
  → StandardResultPage.tsx renders the full result + checkout
  → form.tsx handles payment → dispatches to /api/{stripe|payu|p24}/create
```

---

## Environment Variables

See `.env.example` for the full list. Key variables:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXT_PUBLIC_BASE_URL` | Public quiz base URL |
| `SPOOFING` / `DEV_URL` | Dev-only: spoof the base URL |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `PAYU_CLIENT_ID` / `PAYU_CLIENT_SECRET` | PayU credentials |
| `P24_MERCHANT_ID` / `P24_API_KEY` | Przelewy24 credentials |
| `S3_*` | S3 storage for PDF delivery |
| `N8N_WEBHOOK_URL` | n8n automation webhook |
