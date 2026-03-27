'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { useRouter } from '@/i18n/routing'
import { useFunnelStore } from '@/lib/quiz/store'
import { useMarket } from '@/lib/useMarket'
import { getMarketForLocale, type Locale as AppLocale } from '@/i18n/config'
import { resolveFunnelKeyByResultSlug } from '@/lib/quiz/funnels'
import { getResultPageConfig } from './config'
import YOUVSFUTURE from '@/app/components/result/youvsfuture/YOUVSFUTURE'
import BMIBOX from '@/app/components/result/BMIBOX'
import TDEEBOX from '@/app/components/result/TDEEBOX'
import CheckoutForm from '@/app/components/result/form/form'
import PlanSummary from '@/app/components/result/PlanSummary'
import { DetailsSection } from '@/app/components/result/form/DetailsSection'
import { EmblaCarousel } from '@/app/components/result/Carousel/Carousel'
import AnswersSummary from '@/app/components/result/answers_summary/answers_summary'
import MissingStepsView from '@/app/components/result/MissingStepsView'
import StickyScroll from '@/app/components/result/StickyScroll'
import { getMissingSteps } from '@/lib/quiz/stepValidation'
import type { StepId } from '@/lib/quiz/stepIds'
import { getSupportEmail } from '@/lib/i18n/emailUtils'
import {
  btnPrimary,
  btnPrimaryVisual,
  btnSecondaryVisual,
} from '@/app/components/ui/buttonClasses'

// ─── Shared style helpers ────────────────────────────────────────────────────

const S = {
  sec: {
    padding: '32px 22px',
    boxSizing: 'border-box' as const,
  },
  secBorder: {
    borderTop: '0.5px solid rgba(255,255,255,0.07)',
  },
  eyebrow: {
    display: 'block',
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.12em',
    textTransform: 'uppercase' as const,
    color: 'var(--ds-primary)',
    marginBottom: 8,
  },
  secTitle: {
    fontSize: 22,
    fontWeight: 800,
    lineHeight: 1.15,
    margin: '0 0 18px',
    color: 'var(--ds-text)',
  },
  card: {
    background: 'var(--ds-card-bg)',
    borderRadius: 10,
    padding: 14,
    border: '0.5px solid rgba(255,255,255,0.07)',
  },
  insightBox: {
    background: 'rgba(76,200,122,0.07)',
    border: '0.5px solid rgba(76,200,122,0.2)',
    borderRadius: 9,
    padding: '12px 14px',
    fontSize: 13,
    color: 'rgba(244,244,245,0.65)',
    lineHeight: 1.6,
    marginTop: 14,
  },
  pillarNum: {
    width: 26,
    height: 26,
    borderRadius: '50%',
    background: 'rgba(217,241,102,0.1)',
    color: 'var(--ds-primary)',
    fontSize: 11,
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 2,
  } as React.CSSProperties,
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface StandardResultPageProps {
  faqSection?: React.ReactNode
  checkoutProvider?: import('@/i18n/config').CheckoutProvider
  caseStudiesSection?: React.ReactNode
  trustSection?: React.ReactNode
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function StandardResultPage({
  faqSection,
  checkoutProvider: checkoutProviderProp,
  caseStudiesSection,
  trustSection,
}: StandardResultPageProps) {
  const router = useRouter()
  const t = useTranslations('ResultPage')
  const bmiT = useTranslations('BMIBOX')
  const planPageT = useTranslations('PlanPage')
  const reportFormT = useTranslations('ReportForm')
  const locale = useLocale()
  const privacyUrl = planPageT('assets.privacyUrl')
  const termsUrl = planPageT('assets.termsUrl')
  const privacyLabel = planPageT('privacy')
  const termsLabel = planPageT('terms')

  const params = useParams<{ funnel: string; sessionId: string }>()
  const sessionId = Array.isArray(params?.sessionId) ? params.sessionId[0] : params?.sessionId
  const funnelSlug = Array.isArray(params?.funnel) ? params.funnel[0] : params?.funnel

  const resolvedFunnel = useMemo(
    () => resolveFunnelKeyByResultSlug(funnelSlug ?? 'workout') ?? 'workout',
    [funnelSlug, locale],
  )

  const config = useMemo(() => getResultPageConfig(resolvedFunnel), [resolvedFunnel])

  const setDefaultFunnel = useFunnelStore((s) => s.setDefaultFunnel)
  useEffect(() => {
    setDefaultFunnel(resolvedFunnel)
  }, [resolvedFunnel, setDefaultFunnel])

  const answers = useFunnelStore((s) => s.getFor(sessionId ?? 'default', resolvedFunnel))

  const market = useMarket()
  const fallbackMarket = getMarketForLocale(locale as AppLocale)
  const effectiveMarket = market.isKnownHost ? market : fallbackMarket

  const [hasTimeoutError, setHasTimeoutError] = useState(false)
  const [storeHydrated, setStoreHydrated] = useState(false)
  const [reportCount, setReportCount] = useState<number | null>(null)
  const [showSamplePlan, setShowSamplePlan] = useState(false)
  const [totalOpenedCheckouts, setTotalOpenedCheckouts] = useState<number | null>(null)
  const [missingSteps, setMissingSteps] = useState<StepId[]>([])

  const {
    titleKey,
    analyzeTitleKey,
    analyzeListKey,
    conclusion1Key,
    conclusion2Key,
    purchaseTitleKey,
    sampleBtnKey,
    sampleTitleKey,
    joinAthletesKey,
  } = config

  useEffect(() => {
    const fetchCount = () => {
      fetch('/api/data/count')
        .then((res) => res.json())
        .then((data) => {
          if (data.recentCount !== null) setReportCount(data.recentCount)
          if (data.totalCount !== null) setTotalOpenedCheckouts(data.totalCount)
        })
        .catch(() => {
          setReportCount(null)
          setTotalOpenedCheckouts(null)
        })
    }
    fetchCount()
    const interval = setInterval(fetchCount, 300000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!sessionId || !answers) return
    const missing = getMissingSteps(answers, resolvedFunnel, sessionId)
    setMissingSteps(missing)
  }, [answers, resolvedFunnel, sessionId])

  const analyzeList = t.raw(analyzeListKey) as unknown as Record<string, string>

  // ─── Computed stats (must be before any conditional returns) ──────────────
  const computedStats = useMemo(() => {
    const w = answers?.weight || 0
    const h = answers?.height || 0
    const a = answers?.age || 0
    const g = answers?.gender
    const act = answers?.activity || ''
    const dg = answers?.diet_goal || ''

    let bmr = 0
    if (w && h && a) {
      const female = g === 'F' || g === 'female'
      bmr = Math.round(female
        ? 10 * w + 6.25 * h - 5 * a - 161
        : 10 * w + 6.25 * h - 5 * a + 5)
    }

    const actMap: Record<string, number> = {
      low_activity: 1.2,
      some_activity: 1.35,
      light_training: 1.5,
      regular_training: 1.7,
      hard_work: 1.9,
    }
    const tdee = bmr ? Math.round(bmr * (actMap[act] ?? 1.5)) : 0
    const dailyCal = tdee ? (dg === 'cut' ? tdee - 300 : tdee + 300) : 0
    const hydration = w ? `${(w * 0.035).toFixed(1)} l` : null

    return { bmr, dailyCal, hydration }
  }, [answers?.weight, answers?.height, answers?.age, answers?.gender, answers?.activity, answers?.diet_goal])

  const contactBox = t.raw('contactBox') as {
    title: string
    emailIntro: string
    emailAddress: string
    responseTime: string
  }
  const supportEmail = contactBox?.emailAddress || getSupportEmail(locale)

  useEffect(() => {
    if (useFunnelStore.persist.hasHydrated()) setStoreHydrated(true)
    return useFunnelStore.persist.onFinishHydration(() => setStoreHydrated(true))
  }, [])

  useEffect(() => {
    if (!storeHydrated) return
    if (answers) return
    const timeout = setTimeout(() => setHasTimeoutError(true), 10000)
    return () => clearTimeout(timeout)
  }, [storeHydrated, answers])

  if (!storeHydrated && !hasTimeoutError) return null

  if (hasTimeoutError) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', boxSizing: 'border-box', textAlign: 'center' }}>
        <p style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{t('loadingErrorTitle')}</p>
        <p
          style={{ fontSize: 14, maxWidth: 340, lineHeight: 1.5 }}
          dangerouslySetInnerHTML={{ __html: String(t.raw('loadingErrorHtml')).replaceAll('{email}', supportEmail) }}
        />
        <button
          type="button"
          className={btnPrimary}
          onClick={() => router.push({ pathname: '/[funnel]', params: { funnel: resolvedFunnel } })}
          style={{ cursor: 'pointer', marginTop: 24 }}
        >
          {t('loadingErrorBtn')}
        </button>
      </div>
    )
  }

  if (!answers) return null

  if (missingSteps.length > 0 && sessionId) {
    return (
      <MissingStepsView
        sessionId={sessionId}
        funnel={resolvedFunnel}
        missingSteps={missingSteps}
        onRetry={() => {}}
      />
    )
  }

  const { weight, diet_goal, age, activity, height, bodyfat, bmi } = answers

  const BMI_MIN = 12
  const BMI_MAX = 45
  const bmiPointer = bmi !== undefined ? ((Math.max(BMI_MIN, Math.min(BMI_MAX, bmi)) - BMI_MIN) / (BMI_MAX - BMI_MIN)) * 100 : 50

  const { bmr, dailyCal, hydration } = computedStats

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <StickyScroll targetId="form-section" />

      {/* ── 1. HERO ── */}
      <div style={{ maxWidth: 430, margin: '0 auto', boxSizing: 'border-box' }}>
        <section style={{ padding: '28px 22px 24px' }}>
          {/* Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(217,241,102,0.08)', border: '0.5px solid rgba(217,241,102,0.25)', color: 'var(--ds-primary)', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '5px 12px', borderRadius: 20, marginBottom: 18 }}>
            ✓ {t('heroSection.badge')}
          </div>

          {/* Title */}
          <h1
            style={{ fontWeight: 800, fontSize: 30, lineHeight: 1.1, marginBottom: 6, color: 'var(--ds-text)' }}
            dangerouslySetInnerHTML={{ __html: t.raw(titleKey) }}
          />

          {/* Subtitle */}
          <p style={{ fontSize: 13, color: 'rgba(244,244,245,0.45)', marginBottom: 22, lineHeight: 1.5 }}>
            {t('heroSection.subtitle')}
          </p>

          {/* Transform visualization */}
          <YOUVSFUTURE
            sid={sessionId ?? 'default'}
            weight={weight || 0}
            diet_goal={diet_goal || ''}
            age={age || 30}
            activity={activity || ''}
            heightCm={height}
            bodyfat={bodyfat}
            funnelKey={resolvedFunnel}
          />

          {/* Price preview strip */}
          <div style={{ background: 'rgba(76,200,122,0.07)', border: '0.5px solid rgba(76,200,122,0.2)', borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 20, gap: 12 }}>
            <div>
              <strong style={{ color: '#4cc87a', display: 'block', fontSize: 13 }}>{t('heroSection.priceLine')}</strong>
              <span style={{ fontSize: 12, color: 'rgba(244,244,245,0.55)', lineHeight: 1.5 }}>{t('heroSection.priceNote')}</span>
            </div>
            <div style={{ background: 'rgba(76,200,122,0.12)', border: '0.5px solid rgba(76,200,122,0.3)', color: '#4cc87a', fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 20, whiteSpace: 'nowrap' }}>
              {t('heroSection.priceBadge')}
            </div>
          </div>
        </section>

        {/* ── 2. DATA SECTION ── */}
        <section style={{ ...S.sec, ...S.secBorder }}>
          <span style={S.eyebrow}>{t('dataSection.eyebrow')}</span>
          <h2 style={S.secTitle} dangerouslySetInnerHTML={{ __html: t.raw('dataSection.title') }} />

          {/* Stats 2×2 grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
            {bmi !== undefined && (
              <div style={S.card}>
                <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.09em', color: 'rgba(244,244,245,0.35)', marginBottom: 6 }}>{t('dataSection.bmiLabel')}</div>
                <div style={{ fontSize: 21, fontWeight: 700, lineHeight: 1, marginBottom: 2, color: 'var(--ds-primary)' }}>{bmi}</div>
                <div style={{ fontSize: 10, color: 'rgba(244,244,245,0.35)' }}>{bmiT('categories.' + (() => {
                  if (bmi < 16) return 'lt16'
                  if (bmi < 17) return 'lt17'
                  if (bmi < 18.5) return 'lt18_5'
                  if (bmi < 25) return 'lt25'
                  if (bmi < 30) return 'lt30'
                  if (bmi < 35) return 'lt35'
                  if (bmi < 40) return 'lt40'
                  return 'gt40'
                })())}</div>
              </div>
            )}
            {bmr > 0 && (
              <div style={S.card}>
                <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.09em', color: 'rgba(244,244,245,0.35)', marginBottom: 6 }}>{t('dataSection.bmrLabel')}</div>
                <div style={{ fontSize: 21, fontWeight: 700, lineHeight: 1, marginBottom: 2, color: 'var(--ds-text)' }}>{bmr}</div>
                <div style={{ fontSize: 10, color: 'rgba(244,244,245,0.35)' }}>{t('dataSection.bmrUnit')}</div>
              </div>
            )}
            {dailyCal > 0 && (
              <div style={S.card}>
                <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.09em', color: 'rgba(244,244,245,0.35)', marginBottom: 6 }}>{t('dataSection.caloriesLabel')}</div>
                <div style={{ fontSize: 21, fontWeight: 700, lineHeight: 1, marginBottom: 2, color: 'var(--ds-primary)' }}>{dailyCal} kcal</div>
                <div style={{ fontSize: 10, color: 'rgba(244,244,245,0.35)' }}>{t('dataSection.caloriesUnit')}</div>
              </div>
            )}
            {hydration && (
              <div style={S.card}>
                <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.09em', color: 'rgba(244,244,245,0.35)', marginBottom: 6 }}>{t('dataSection.hydrationLabel')}</div>
                <div style={{ fontSize: 21, fontWeight: 700, lineHeight: 1, marginBottom: 2, color: '#4a9de0' }}>{hydration}</div>
                <div style={{ fontSize: 10, color: 'rgba(244,244,245,0.35)' }}>{t('dataSection.hydrationUnit')}</div>
              </div>
            )}
          </div>

          {config.showBmiBox && bmi !== undefined && (
            <BMIBOX bmi={bmi} pointerLeft={bmiPointer} />
          )}
          {config.showTdeeBox && (
            <TDEEBOX sid={sessionId ?? 'default'} funnelKey={resolvedFunnel} />
          )}

          {/* Insight */}
          <div style={S.insightBox} dangerouslySetInnerHTML={{ __html: t.raw(conclusion1Key) }} />
        </section>

        {/* ── 3. PLAN SPECS ── */}
        {config.showPlanSummary && (
          <section style={{ ...S.sec, ...S.secBorder }}>
            <span style={S.eyebrow}>{t('planSectionEyebrow')}</span>
            <h2 style={S.secTitle}>{t('planSectionTitle')}</h2>
            <PlanSummary sid={sessionId ?? 'default'} funnelKey={resolvedFunnel} />
          </section>
        )}

        {/* ── 4. METHODOLOGY ── */}
        <section style={{ ...S.sec, ...S.secBorder }}>
          <span style={S.eyebrow}>{t('methodologyEyebrow')}</span>
          <h2 style={S.secTitle}>{t(analyzeTitleKey)}</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {Object.values(analyzeList).map((html, i) => (
              <div key={i} style={{ display: 'flex', gap: 14 }}>
                <div style={S.pillarNum}>{i + 1}</div>
                <div style={{ paddingTop: 4 }}>
                  <div style={{ fontSize: 14, lineHeight: 1.5, color: 'var(--ds-text)' }} dangerouslySetInnerHTML={{ __html: html }} />
                </div>
              </div>
            ))}
          </div>

          <p
            style={{ fontSize: 13, lineHeight: 1.65, color: 'rgba(244,244,245,0.55)', marginTop: 20 }}
            dangerouslySetInnerHTML={{ __html: t.raw(conclusion2Key) }}
          />
        </section>
      </div>

      {/* ── 5. CASE STUDIES (full-bleed) ── */}
      {caseStudiesSection}

      {/* ── 6. PRICING ── */}
      <div style={{ maxWidth: 430, margin: '0 auto', boxSizing: 'border-box' }}>
        <section style={{ ...S.sec, ...S.secBorder }} id="form-section">
          <span style={S.eyebrow}>{t('pricingSectionEyebrow')}</span>
          <h2 style={S.secTitle}>{t(purchaseTitleKey)}</h2>

          {/* Sample plan toggle */}
          <div style={{ marginBottom: 20, textAlign: 'center' }}>
            <button
              type="button"
              className={`${btnSecondaryVisual} w-full py-3 text-sm`}
              aria-expanded={showSamplePlan}
              onClick={() => setShowSamplePlan((s) => !s)}
            >
              {t(sampleBtnKey)}
            </button>
            <div
              aria-hidden={!showSamplePlan}
              style={{ overflow: 'hidden', transition: 'max-height 320ms ease, opacity 240ms ease', maxHeight: showSamplePlan ? '1000px' : '0px', opacity: showSamplePlan ? 1 : 0 }}
            >
              <h3 style={{ fontSize: 18, fontWeight: 600, textAlign: 'center', margin: '16px 0 8px', color: 'var(--ds-text)' }}>{t(sampleTitleKey)}</h3>
              <EmblaCarousel funnelKey={resolvedFunnel} />
            </div>
          </div>

          {/* Join athletes count */}
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <div
              style={{ fontSize: 15, lineHeight: 1.5, color: 'rgba(244,244,245,0.7)' }}
              dangerouslySetInnerHTML={{ __html: t.raw(joinAthletesKey).replace('{count}', (totalOpenedCheckouts ?? 0).toString()) }}
            />
          </div>

          {/* No subscription note */}
          <div style={{ textAlign: 'center', fontSize: 12, color: 'rgba(244,244,245,0.4)', padding: '10px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: 8, marginBottom: 14, border: '0.5px solid rgba(255,255,255,0.07)' }}>
            <strong style={{ color: '#4cc87a' }}>{t('pricingSectionNoSub')}</strong>
          </div>

          {/* Checkout form */}
          <CheckoutForm
            sessionId={sessionId ?? 'default'}
            funnelKey={resolvedFunnel}
            locale={locale as AppLocale}
            checkoutProvider={checkoutProviderProp ?? effectiveMarket.checkoutProvider}
            marketCurrency={effectiveMarket.currency}
            separatorText={reportFormT('orText')}
            paymentNoteHtml={String(reportFormT.raw('paymentNote'))}
          />
          <div style={{ marginTop: 16 }}>
            <DetailsSection diet_goal={String(answers?.diet_goal ?? '')} />
          </div>

          {/* Report count */}
          <div style={{ marginTop: 16, padding: '14px', borderRadius: 8, border: '0.5px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)', textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--ds-text)' }}>
              {reportCount !== null ? `${reportCount} ${t('reportNote1')}` : '...'}
            </div>
            <div style={{ fontSize: 14, color: 'rgba(244,244,245,0.45)', marginTop: 2 }}>{t('reportNote2')}</div>
          </div>
        </section>

        {/* ── 7. GUARANTEE ── */}
        <section style={{ ...S.sec, ...S.secBorder }}>
          <div style={{ background: 'rgba(76,200,122,0.06)', border: '0.5px solid rgba(76,200,122,0.2)', borderRadius: 14, padding: 22, textAlign: 'center' }}>
            <div style={{ width: 54, height: 54, borderRadius: '50%', background: 'rgba(76,200,122,0.12)', margin: '0 auto 14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="26" height="26" fill="none" viewBox="0 0 24 24" stroke="#4cc87a" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <path d="M9 12l2 2 4-4"/>
              </svg>
            </div>
            <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 10, color: 'var(--ds-text)' }}>{t('guarantee.title')}</div>
            <div
              style={{ fontSize: 13, color: 'rgba(244,244,245,0.6)', lineHeight: 1.75 }}
              dangerouslySetInnerHTML={{ __html: t.raw('guarantee.text') }}
            />
          </div>
        </section>
      </div>

      {/* ── 8. TRUST / REVIEWS (full-bleed) ── */}
      {trustSection}

      <div style={{ maxWidth: 430, margin: '0 auto', boxSizing: 'border-box' }}>
        {/* ── 9. FINAL CTA ── */}
        <section style={{ ...S.sec, ...S.secBorder, textAlign: 'center' }}>
          <h2 style={{ fontWeight: 800, fontSize: 26, lineHeight: 1.15, marginBottom: 6, color: 'var(--ds-text)' }}>{t('finalCta.title')}</h2>
          <p style={{ fontSize: 13, color: 'rgba(244,244,245,0.4)', marginBottom: 22 }}>{t('finalCta.subtitle')}</p>

          <button
            type="button"
            className={`${btnPrimaryVisual} w-full cursor-pointer p-5 text-xl`}
            onClick={() => {
              const el = document.getElementById('form-section')
              if (el) {
                const y = el.getBoundingClientRect().top + window.pageYOffset - 80
                window.scrollTo({ top: y, behavior: 'smooth' })
              }
            }}
          >
            {t('ctaButton.label')}
          </button>

          {/* Trust row */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 18, marginTop: 14, flexWrap: 'wrap' }}>
            {(['trust1', 'trust2', 'trust3'] as const).map((key) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: 'rgba(244,244,245,0.4)' }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#4cc87a', flexShrink: 0 }} />
                {t(`finalCta.${key}`)}
              </div>
            ))}
          </div>
        </section>

        {/* ── 10. ANSWERS SUMMARY ── */}
        <section style={{ ...S.sec, ...S.secBorder }}>
          <AnswersSummary sid={sessionId ?? 'default'} funnelSlug={funnelSlug} />
        </section>

        {/* ── 11. FAQ + CONTACT ── */}
        <section style={{ ...S.sec, ...S.secBorder }}>
          {config.showFaq && faqSection}
          {config.showContactBox && (
            <div style={{ margin: '24px auto 0', background: 'var(--ds-card-bg)', border: '0.5px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '28px 24px 24px', boxSizing: 'border-box', textAlign: 'center' }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 14px', lineHeight: 1.2, color: 'var(--ds-text)' }}>{contactBox.title}</h2>
              <div style={{ fontSize: 16, marginBottom: 14, color: 'rgba(244,244,245,0.7)' }}>
                {contactBox.emailIntro}
                <br />
                <a href={`mailto:${supportEmail}`} style={{ color: 'var(--ds-primary)', fontWeight: 700, textDecoration: 'none' }}>
                  {supportEmail}
                </a>
              </div>
              <div style={{ fontSize: 13, color: 'rgba(244,244,245,0.45)', marginTop: 12 }}>{contactBox.responseTime}</div>
            </div>
          )}
        </section>

        {/* ── 12. FOOTER CTA + LINKS ── */}
        <section style={{ ...S.sec, ...S.secBorder }}>
          <button
            type="button"
            className={`${btnPrimaryVisual} w-full cursor-pointer p-5 text-xl`}
            onClick={() => {
              const el = document.getElementById('form-section')
              if (el) {
                const y = el.getBoundingClientRect().top + window.pageYOffset - 80
                window.scrollTo({ top: y, behavior: 'smooth' })
              }
            }}
          >
            {t('ctaButton.label')}
          </button>

          <footer style={{ textAlign: 'center', marginTop: 24, marginBottom: 8, fontSize: 15 }}>
            <a href={privacyUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(244,244,245,0.4)', textDecoration: 'none', display: 'block', marginBottom: 12 }}>
              {privacyLabel}
            </a>
            <a href={termsUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(244,244,245,0.4)', textDecoration: 'none', display: 'block' }}>
              {termsLabel}
            </a>
          </footer>
        </section>
      </div>
    </>
  )
}
