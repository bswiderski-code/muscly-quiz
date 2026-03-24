'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { useRouter } from '@/i18n/routing'
import { useFunnelStore } from '@/lib/quiz/store'
import { useMarket } from '@/lib/useMarket'
import { getMarketForLocale, type Locale as AppLocale } from '@/i18n/config'
import { resolveFunnelKeyByResultSlug, getFunnelSlug } from '@/lib/quiz/funnels'
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
import { getMissingSteps } from '@/lib/quiz/stepValidation'
import type { StepId } from '@/lib/quiz/stepIds'
import { getSupportEmail } from '@/lib/i18n/emailUtils'

const reviewImageCounts: Record<string, number> = {
  bg: 7,
  cz: 6,
  en: 6,
  hu: 7,
  pl: 11,
  ro: 8,
}

interface StandardResultPageProps {
  faqSection?: React.ReactNode;
  checkoutProvider?: import('@/i18n/config').CheckoutProvider;
}

export default function StandardResultPage({ faqSection, checkoutProvider: checkoutProviderProp }: StandardResultPageProps) {
  const router = useRouter()
  const t = useTranslations('ResultPage')
  const planPageT = useTranslations('PlanPage')
  const reportFormT = useTranslations('ReportForm')
  const reviewsT = useTranslations('ReviewsMarquee')
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
    subtitleKey,
    intro1Key,
    intro2Key,
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
          if (data.recentCount !== null) {
            setReportCount(data.recentCount)
          }
          if (data.totalCount !== null) {
            setTotalOpenedCheckouts(data.totalCount)
          }
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

  // Validate required steps
  useEffect(() => {
    if (!sessionId || !answers) return
    
    const missing = getMissingSteps(answers, resolvedFunnel, sessionId)
    setMissingSteps(missing)
  }, [answers, resolvedFunnel, sessionId])

  const analyzeList = t.raw(analyzeListKey) as unknown as Record<string, string>
  const contactBox = t.raw('contactBox') as {
    title: string
    emailIntro: string
    emailAddress: string
    responseTime: string
  }
  const supportEmail = contactBox?.emailAddress || getSupportEmail(locale)
  
  useEffect(() => {
    if (useFunnelStore.persist.hasHydrated()) {
      setStoreHydrated(true)
    }
    return useFunnelStore.persist.onFinishHydration(() => {
      setStoreHydrated(true)
    })
  }, [])

  useEffect(() => {
    if (!storeHydrated) return
    if (answers) return
    const timeout = setTimeout(() => {
      setHasTimeoutError(true)
    }, 10000)
    return () => clearTimeout(timeout)
  }, [storeHydrated, answers])

  if (!storeHydrated && !hasTimeoutError) {
    return null
  }

  if (hasTimeoutError) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px 16px',
          boxSizing: 'border-box',
          textAlign: 'center',
          fontFamily: "inherit",
        }}
      >
        <p style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{t('loadingErrorTitle')}</p>
        <p
          style={{ fontSize: 14, maxWidth: 340, lineHeight: 1.5 }}
          dangerouslySetInnerHTML={{
            __html: String(t.raw('loadingErrorHtml')).replaceAll('{email}', supportEmail),
          }}
        />
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            router.push({
              pathname: '/[funnel]',
              params: { funnel: resolvedFunnel },
            })
          }}
          style={{
            cursor: 'pointer',
            marginTop: 24,
          }}
        >
          {t('loadingErrorBtn')}
        </button>
      </div>
    )
  }

  if (!answers) {
    return null
  }

  // Show missing steps view if steps are missing
  if (missingSteps.length > 0 && sessionId) {
    return (
      <MissingStepsView
        sessionId={sessionId}
        funnel={resolvedFunnel}
        missingSteps={missingSteps}
        onRetry={() => {
          // Track retry if needed in the future
        }}
      />
    )
  }

  const { weight, diet_goal, age, activity, height, bodyfat, bmi } = answers

  return (
    <>
      <div
        style={{
          maxWidth: config.containerMaxWidth,
          margin: '0 auto',
          padding: '8px 16px',
          boxSizing: 'border-box',
        }}
      >
      <header style={{ textAlign: 'center', marginTop: 16 }}>
        <h1
          style={{
            fontWeight: 700,
            fontSize: 32,
            marginBottom: 4,
          }}
          dangerouslySetInnerHTML={{ __html: t.raw(titleKey) }}
        />

        <YOUVSFUTURE
          sid={sessionId ?? 'default'}
          weight={weight || 0}
          diet_goal={diet_goal || ''}
          age={age || 30}
          activity={activity || ''}
          heightCm={height}
          bodyfat={bodyfat}
          funnelKey={resolvedFunnel}
          style={{ marginTop: 24 }}
        />

        <div style={{ marginTop: 32 }}>
          <p style={{ fontSize: 19, lineHeight: 1.4, marginTop: 0, marginBottom: 24 }} dangerouslySetInnerHTML={{ __html: t.raw(intro1Key) }} />
          <p style={{ fontSize: 19, lineHeight: 1.4, marginTop: 16 }} dangerouslySetInnerHTML={{ __html: t.raw(intro2Key) }} />
        </div>
      </header>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 32, marginBottom: 32 }}>
        <hr style={{ width: '100%', maxWidth: 400, border: '1px solid #000' }} />
      </div>

      <section style={{ textAlign: 'center', marginTop: 16 }}>
        <h2
          style={{
            fontWeight: 700,
            fontSize: 32,
            lineHeight: 1.2,
            marginBottom: 24,
          }}
          dangerouslySetInnerHTML={{ __html: t.raw(subtitleKey) }}
        />

        <div style={{ marginTop: 40 }}>
          {config.showBmiBox && bmi !== undefined && (
            <BMIBOX bmi={bmi} pointerLeft={((bmi - 12) / (45 - 12)) * 100} />
          )}
        </div>
        {config.showTdeeBox && <TDEEBOX sid={sessionId ?? 'default'} funnelKey={resolvedFunnel} />}
      </section>

      <section style={{ marginTop: 48 }}>
        <div 
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'left',
            fontSize: 16,
            lineHeight: 1.5,
            maxWidth: 420,
            margin: '0 auto',
          }}
        >
          <p style={{ fontSize: 26, marginBottom: 12 }}><b>{t(analyzeTitleKey)}</b></p>
          <ul style={{ paddingLeft: 0, marginTop: 0 }}>
            {Object.values(analyzeList).map((html, index) => (
                <li key={index} dangerouslySetInnerHTML={{ __html: html }} />
            ))}
          </ul>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            marginTop: 32,
            width: '100%',
          }}
        >
          <p
            style={{
              fontSize: 16,
              lineHeight: 1.5,
              maxWidth: 420,
              margin: 0,
              textAlign: 'center',
              flex: '1 1 100%',
            }}
            dangerouslySetInnerHTML={{ __html: t.raw(conclusion1Key) }}
          />
        </div>

        <p
          style={{
            fontSize: 16,
            lineHeight: 1.5,
            maxWidth: 360,
            margin: '12px auto 0',
            textAlign: 'center',
          }}
          dangerouslySetInnerHTML={{ __html: t.raw(conclusion2Key) }}
        />
      </section>

      {config.showPlanSummary && (
        <section style={{ marginTop: 48 }}>
          <PlanSummary sid={sessionId ?? 'default'} funnelKey={resolvedFunnel} />
        </section>
      )}

      <section
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          margin: '48px auto 0',
          width: '100%',
          maxWidth: 420,
          padding: '0 12px',
          boxSizing: 'border-box',
        }}
      >
        <h2
          style={{
            textAlign: 'center',
            fontWeight: 700,
            fontSize: 24,
            marginTop: 0,
            lineHeight: 1.2,
            marginBottom: 24,
          }}
        >
          {t(purchaseTitleKey)}
        </h2>
        <div style={{ textAlign: 'center', marginTop: 8, width: '100%' }}>
          <button
            type="button"
            className="btn btn-secondary"
            aria-expanded={showSamplePlan}
            onClick={() => setShowSamplePlan((s) => !s)}
            style={{
              display: 'inline-flex',
              cursor: 'pointer',
              fontSize: 17,
              fontWeight: 400,
              minWidth: 160,
              boxSizing: 'border-box',
              touchAction: 'manipulation',
              padding: '10px 14px',
              lineHeight: 1.3,
            }}
            >
              {t(sampleBtnKey)}
            </button>

          <div
            aria-hidden={!showSamplePlan}
            style={{
              overflow: 'hidden',
              transition: 'max-height 320ms ease, opacity 240ms ease, padding 240ms ease',
              maxHeight: showSamplePlan ? '1000px' : '0px',
              opacity: showSamplePlan ? 1 : 0,
              padding: showSamplePlan ? '12px 0 0 0' : '0 0 0 0',
              width: '100%',
            }}
          >
            <div style={{ width: '100%', maxWidth: 360, margin: '0 auto' }}>
              <h3 style={{ fontSize: 20, fontWeight: 600, textAlign: 'center', margin: '12px 0', width: '100%', maxWidth: '100%' }}>{t(sampleTitleKey)}</h3>
              <div style={{ width: '100%', boxSizing: 'border-box' }}>
                <EmblaCarousel funnelKey={resolvedFunnel} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ marginTop: 40, textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <hr style={{ width: '100%', maxWidth: 400, border: '1px solid #000' }} />
        </div>

        <p
          style={{
            fontSize: 24,
            lineHeight: 1.5,
            margin: '16px 0',
            fontFamily: 'inherit',
          }}
          dangerouslySetInnerHTML={{
            __html: t.raw(joinAthletesKey).replace('{count}', (totalOpenedCheckouts !== null ? totalOpenedCheckouts : 0).toString())
          }}
        />

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24, marginBottom: 24 }}>
          <hr style={{ width: '100%', maxWidth: 400, border: '1px solid #000' }} />
        </div>
      </section>

      <section style={{ marginTop: 48 }}>
        <AnswersSummary sid={sessionId ?? 'default'} funnelSlug={funnelSlug} />
      </section>

      <section style={{ marginTop: 48 }} id="form-section">
        <CheckoutForm
          sessionId={sessionId ?? 'default'}
          funnelKey={resolvedFunnel}
          locale={locale as AppLocale}
          checkoutProvider={checkoutProviderProp ?? effectiveMarket.checkoutProvider}
          marketCurrency={effectiveMarket.currency}
          separatorText={reportFormT('orText')}
          paymentNoteHtml={String(reportFormT.raw('paymentNote'))}
        />
        <div style={{ marginTop: 24 }}>
          <DetailsSection diet_goal={String(answers?.diet_goal ?? '')} />
        </div>
      </section>

      <div className="reports-wrap" style={{ textAlign: 'center', marginTop: 8 }}>
        <div className="reports-box">
          <span className="reports-highlight">
            {reportCount !== null ? `${reportCount} ${t('reportNote1')}` : '...'}
          </span>
          <br />
          <span className="reports-note">{t('reportNote2')}</span>
        </div>
      </div>

      <div style={{ marginTop: 48, marginBottom: 48 }}>
      </div>
      <section style={{ marginTop: 48 }}>
        {config.showFaq && (faqSection)}
        {config.showContactBox && (
        <div
          style={{
            margin: '24px auto 48px',
            maxWidth: 400,
            background: '#fff',
            border: '4px solid #000',
            borderRadius: 16,
            padding: '28px 24px 24px 24px',
            boxSizing: 'border-box',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            fontFamily: "inherit",
            textAlign: 'center',
            position: 'relative',
          }}
        >
          <h2 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 14px 0', lineHeight: 1.2 }}>
            {contactBox.title}
          </h2>
          <div style={{ fontSize: 17, marginBottom: 14 }}>
            {contactBox.emailIntro}
            <br />
            <a
              href={`mailto:${contactBox.emailAddress}`}
              style={{ color: '#0077ff', fontWeight: 700, textDecoration: 'none' }}
            >
              {contactBox.emailAddress}
            </a>
          </div>
          <div style={{ fontSize: 15, color: '#333', marginTop: 12, opacity: 0.85 }}>
            {contactBox.responseTime}
          </div>
        </div>
        )}
      </section>
        <div style={{ maxWidth: 400, margin: '0px auto 32px', textAlign: 'center' }}>
          <button
            type="button"
            className="btn btn-primary funnel-choice-btn"
            onClick={() => {
              const el = document.getElementById('form-section');
              if (el) {
                const yOffset = -80;
                const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
                window.scrollTo({ top: y, behavior: 'smooth' });
              }
            }}
            style={{
              padding: '20px',
              fontSize: 20,
              width: '100%',
              cursor: 'pointer',
            }}
          >
            {t('ctaButton.label')}
          </button>
        </div>

        <footer style={{ textAlign: 'center', marginTop: 0, marginBottom: 16, fontSize: 18, fontFamily: 'inherit' }}>
            <div style={{ marginBottom: 8 }}>
              <a href={privacyUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#222', textDecoration: 'none', display: 'block', marginBottom: 16 }}>
                {privacyLabel}
              </a>
              <a href={termsUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#222', textDecoration: 'none', display: 'block' }}>
                {termsLabel}
              </a>
            </div>

        </footer>
      </div>
    </>
  )
}
