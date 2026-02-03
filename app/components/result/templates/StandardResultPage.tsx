'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import Image from 'next/image'
import { useRouter } from '@/i18n/routing'
import { useFunnelStore } from '@/lib/store'
import { useMarket } from '@/lib/useMarket'
import { getMarketForLocale, type Locale as AppLocale } from '@/i18n/config'
import { resolveFunnelKeyByResultSlug, getFunnelSlug } from '@/lib/funnels/funnels'
import { getResultPageConfig } from './config'
import YOUVSFUTURE from '@/app/components/result/youvsfuture/YOUVSFUTURE'
import BMIBOX from '@/app/components/result/BMIBOX'
import TDEEBOX from '@/app/components/result/TDEEBOX'
import CheckoutForm from '@/app/components/result/form/form'
import PlanSummary from '@/app/components/result/PlanSummary'
import ReviewsMarquee from '@/app/components/result/ReviewsMarquee'
import FAQPlan from '@/app/components/result/faq/faq_plan'
import { DetailsSection } from '@/app/components/result/form/DetailsSection'
import { EmblaCarousel } from '@/app/components/result/Carousel/Carousel'
import AnswersSummary from '@/app/components/result/answers_summary/answers_summary'
import MissingStepsView from '@/app/components/result/MissingStepsView'
import { getMissingSteps } from '@/lib/validation/stepValidation'
import type { StepId } from '@/lib/steps/stepIds'

const reviewImageCounts: Record<string, number> = {
  bg: 7,
  cz: 6,
  en: 6,
  hu: 7,
  pl: 11,
  ro: 8,
}

export default function StandardResultPage() {
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
    () => resolveFunnelKeyByResultSlug(funnelSlug ?? 'workout', locale) ?? 'workout',
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

  const [minTimeElapsed, setMinTimeElapsed] = useState(false)
  const [shouldFadeOut, setShouldFadeOut] = useState(false)
  const [loaderRemoved, setLoaderRemoved] = useState(false)
  const [isDataReady, setIsDataReady] = useState<boolean>(() => !!answers)
  const [hasTimeoutError, setHasTimeoutError] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)

  const [reportCount, setReportCount] = useState<number | null>(null)
  const [showSamplePlan, setShowSamplePlan] = useState(false)
  const [totalOpenedCheckouts, setTotalOpenedCheckouts] = useState<number | null>(null)
  const [missingSteps, setMissingSteps] = useState<StepId[]>([])

  const {
    titleKey,
    subtitleKey,
    intro1Key,
    answersButtonImage,
    checkoutIntroImage,
    intro2Key,
    analyzeTitleKey,
    analyzeListKey,
    conclusion1Key,
    conclusion2Key,
    purchaseTitleKey,
    sampleBtnKey,
    sampleTitleKey,
    joinAthletesKey,
    trustImageAltKey,
    purchaseImageAltKey,
    ctaButtonAltKey,
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
  const supportEmail = contactBox?.emailAddress || 'support@musclepals.com'
  
  const replaceLocale = (path: string) => path.replace(/{locale}/g, locale);

  const trustImageSrc = replaceLocale(config.trustImage);
  const purchaseImageSrc = replaceLocale(config.purchaseImage);
  const sampleImageSrc = replaceLocale(config.sampleImage);
  const ctaButtonImageSrc = replaceLocale(config.ctaButtonImage);
  const loadingErrorBtnSrc = replaceLocale(config.loadingErrorBtnImage);

  const imageWidth = config.purchaseImageWidth;
  const imageHeight = config.purchaseImageHeight[locale] || config.purchaseImageHeight.default;

  useEffect(() => {
    if (answers && sessionId) {
      fetch('/api/funnel/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sid: sessionId,
          funnel: resolvedFunnel,
          ...answers,
        }),
      }).catch((err) => console.error('Failed to auto-save funnel data:', err));
    }
  }, [answers, sessionId, resolvedFunnel]);

  useEffect(() => {
    if (answers) {
      setIsDataReady(true)
    }
  }, [answers])

  useEffect(() => {
    const timer = setTimeout(() => setMinTimeElapsed(true), 3000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (minTimeElapsed && isDataReady && !shouldFadeOut) {
      setShouldFadeOut(true)
      setTimeout(() => setLoaderRemoved(true), 320)
    }
  }, [minTimeElapsed, isDataReady, shouldFadeOut])

  useEffect(() => {
    if (isDataReady) return
    const timeout = setTimeout(() => {
      if (!answers) {
        setHasTimeoutError(true)
      }
    }, 10000)
    return () => clearTimeout(timeout)
  }, [isDataReady, answers])

  if (!isHydrated) {
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
        }}
      />
    )
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
          fontFamily: "'Comic Relief', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
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
          onClick={() => {
            router.push({
              pathname: '/[funnel]',
              params: { funnel: resolvedFunnel },
            })
          }}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            marginTop: 24,
          }}
        >
          <Image
            src={loadingErrorBtnSrc}
            alt="Try again"
            width={512}
            height={67}
            style={{ maxWidth: '100%', height: 'auto', width: 280 }}
          />
        </button>
      </div>
    )
  }

  const Loader = (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#ffffff',
        color: '#000000',
        padding: '24px 16px',
        boxSizing: 'border-box',
        textAlign: 'center',
        fontFamily: "'Comic Relief', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        opacity: shouldFadeOut ? 0 : 1,
        transition: 'opacity 320ms cubic-bezier(0.4, 0.0, 0.2, 1)',
        pointerEvents: shouldFadeOut ? 'none' : 'all',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            border: '3px solid #000',
            boxShadow: '0 3px 0 rgba(0,0,0,0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 8,
              borderRadius: '999px',
              border: '3px solid #000',
              borderTopColor: 'transparent',
              animation: 'spin 900ms linear infinite',
            }}
          />
          <div
            style={{
              width: 18,
              height: 4,
              borderRadius: 999,
              background: '#000',
              position: 'relative',
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                border: '2px solid #000',
                background: '#fff',
                position: 'absolute',
                top: -6,
                right: -4,
              }}
            />
          </div>
        </div>

        <div>
          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: 0.4,
            }}
          >
            {t('loadingTitle')}
          </div>
          <div
            style={{
              fontSize: 14,
              marginTop: 4,
              opacity: 0.8,
            }}
          >
            {t('loadingSubtitle')}
          </div>
        </div>

        <div
          style={{
            width: '100%',
            maxWidth: 260,
            height: 8,
            borderRadius: 999,
            border: '2px solid #000',
            boxShadow: '0 2px 0 rgba(0,0,0,0.35)',
            background: '#fff',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: '45%',
              height: '100%',
              background: '#000',
              borderRadius: 999,
              animation: 'loading-bar 1400ms cubic-bezier(0.4, 0.0, 0.2, 1) infinite',
            }}
          />
        </div>
      </div>

      <style jsx global>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes loading-bar {
          0% { transform: translateX(-120%); }
          50% { transform: translateX(10%); }
          100% { transform: translateX(120%); }
        }
      `}</style>
    </div>
  )

  if (!answers && !hasTimeoutError) {
    return Loader
  }

  if (!answers) {
    return <p style={{ textAlign: 'center', padding: '40px' }}>{t('loadingData')}</p>
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

  const showLoader = !loaderRemoved

  const { weight, diet_goal, age, activity, height, bodyfat, bmi } = answers

  return (
    <>
      {showLoader && Loader}
      <div
        style={{
          maxWidth: config.containerMaxWidth,
          margin: '0 auto',
          padding: '8px 16px',
          boxSizing: 'border-box',
          minHeight: showLoader ? '100vh' : 'auto',
        }}
      >
      <h1
        style={{
          textAlign: 'center',
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

      <div style={{ textAlign: 'center', marginTop: 32 }}>
        <p style={{ fontSize: 19, lineHeight: 1.4, marginTop: 0, marginBottom: 24 }} dangerouslySetInnerHTML={{ __html: t.raw(intro1Key) }} />
        <Image
          src={config.introBicepImage}
          alt={config.introBicepAlt}
          width={303}
          height={151}
          style={{ width: '100%', maxWidth: 303, height: 'auto', display: 'block', margin: '0 auto' }}
          priority
        />
        <p style={{ fontSize: 19, lineHeight: 1.4, marginTop: 16 }} dangerouslySetInnerHTML={{ __html: t.raw(intro2Key) }} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
        <Image
          src={config.dividerImage}
          alt={config.dividerAlt}
          width={400}
          height={20}
          style={{ width: '100%', maxWidth: 400, height: 'auto' }}
        />
      </div>

      <h2
        style={{
          textAlign: 'center',
          fontWeight: 700,
          fontSize: 32,
          marginTop: 16,
          lineHeight: 1.2,
        }}
        dangerouslySetInnerHTML={{ __html: t.raw(subtitleKey) }}
      />

      {config.showBmiBox && bmi !== undefined && (
        <BMIBOX bmi={bmi} pointerLeft={((bmi - 12) / (45 - 12)) * 100} />
      )}
      {config.showTdeeBox && <TDEEBOX sid={sessionId ?? 'default'} funnelKey={resolvedFunnel} />}

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
        <Image
          src={trustImageSrc}
          alt={t(trustImageAltKey)}
          width={337}
          height={221}
          style={{
            width: '100%',
            maxWidth: 337,
            height: 'auto',
          }}
        />
      </div>
      <div style={{ marginTop: 0 }}>
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
      height: '100%',
    }}
  >
    <p style={{ fontSize: 26 }}><b>{t(analyzeTitleKey)}</b></p>
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
      marginTop: 24,
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
</div>

{config.showPlanSummary && (
  <div style={{ marginTop: 18 }}>
    <PlanSummary sid={sessionId ?? 'default'} funnelKey={resolvedFunnel} />
  </div>
)}

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          margin: '24px auto 0',
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
          }}
        >
          {t(purchaseTitleKey)}
        </h2>
        <Image
          src={purchaseImageSrc}
          alt={t(purchaseImageAltKey)}
          width={imageWidth}
          height={imageHeight}
          style={{
            width: '100%',
            maxWidth: 351,
            height: 'auto',
            marginBottom: 16,
            display: 'block',
          }}
        />
        <div style={{ textAlign: 'center', marginTop: 0, width: '100%' }}>
          <button
            type="button"
            aria-expanded={showSamplePlan}
            onClick={() => setShowSamplePlan((s) => !s)}
            style={{
              display: 'inline-block',
              background: 'transparent',
              border: '2px solid transparent',
              padding: '10px 14px',
              color: '#000',
              textDecoration: 'underline',
              cursor: 'pointer',
              fontSize: 17,
              fontWeight: 400,
              fontFamily: "'Comic Relief', Arial, Helvetica, sans-serif",
              borderRadius: 12,
              minWidth: 160,
              boxSizing: 'border-box',
              touchAction: 'manipulation',
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
              <Image src={sampleImageSrc} alt="Rafal" width={394} height={383} style={{ width: '100%', height: 'auto', display: 'block' }} />
              <h3 style={{ fontSize: 20, fontWeight: 600, textAlign: 'center', margin: '12px 0', width: '100%', maxWidth: '100%' }}>{t(sampleTitleKey)}</h3>
              <div style={{ width: '100%', boxSizing: 'border-box' }}>
                <EmblaCarousel funnelKey={resolvedFunnel} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
        <Image
          src={config.dividerImage}
          alt={config.dividerAlt}
          width={400}
          height={20}
          style={{ width: '100%', maxWidth: 400, height: 'auto' }}
        />
      </div>

      <p
        style={{
          textAlign: 'center',
          fontSize: 24,
          lineHeight: 1.5,
          margin: '16px 0',
          fontFamily: 'inherit',
        }}
        dangerouslySetInnerHTML={{
          __html: t.raw(joinAthletesKey).replace('{count}', (totalOpenedCheckouts !== null ? totalOpenedCheckouts : 0).toString())
        }}
      />

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 0 }}>
        <Image
          src={config.dividerImage}
          alt={config.dividerAlt}
          width={400}
          height={20}
          style={{ width: '100%', maxWidth: 400, height: 'auto' }}
        />
      </div>

      <div style={{ marginTop: 18 }}>
        <AnswersSummary sid={sessionId ?? 'default'} funnelSlug={funnelSlug} answersButtonImage={answersButtonImage} />
      </div>

      <div style={{ marginTop: 16 }} id="form-section">

        <CheckoutForm
          sessionId={sessionId ?? 'default'}
          funnelKey={resolvedFunnel}
          locale={locale as AppLocale}
          checkoutProvider={effectiveMarket.checkoutProvider}
          marketCurrency={effectiveMarket.currency}
          separatorText={reportFormT('orText')}
          paymentNoteHtml={String(reportFormT.raw('paymentNote'))}
        />
        <div style={{ marginTop: 14 }}>
          <DetailsSection diet_goal={String(answers?.diet_goal ?? '')} />
        </div>
      </div>

      <div className="reports-wrap" style={{ textAlign: 'center', marginTop: 8 }}>
        <div className="reports-box">
          <span className="reports-highlight">
            {reportCount !== null ? `${reportCount} ${t('reportNote1')}` : '...'}
          </span>
          <br />
          <span className="reports-note">{t('reportNote2')}</span>
        </div>
      </div>

      <div style={{ marginTop: 32 }}>
        {config.showReviews && (
          <>
            <h2 style={{ textAlign: 'center', fontWeight: 700, fontSize: 28, marginBottom: 16, lineHeight: 1.2 }}>
              {reviewsT('title')}
            </h2>
            {(() => {
              const baseLocale = locale.split('-')[0].toLowerCase();
              const effectiveLocale = reviewImageCounts[baseLocale] ? baseLocale : 'en';
              const effectiveCount = reviewImageCounts[effectiveLocale] || 6;
              
              console.log('[Reviews] Resolved ReviewsMarquee props:', { 
                originalLocale: locale, 
                baseLocale, 
                effectiveLocale, 
                effectiveCount 
              });
              
              return (
                <ReviewsMarquee 
                  locale={effectiveLocale} 
                  imageCount={effectiveCount} 
                />
              );
            })()}
          </>
        )}
      </div>
      <div style={{ marginTop: 32 }}>
        {config.showFaq && <FAQPlan />}
        {config.showContactBox && (
        <div
          style={{
            margin: '32px auto 32px',
            maxWidth: 400,
            background: '#fff',
            border: '4px solid #000',
            borderRadius: 16,
            padding: '22px 20px 18px 20px',
            boxSizing: 'border-box',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            fontFamily: "'Comic Relief', Arial, Helvetica, sans-serif",
            textAlign: 'center',
            position: 'relative',
          }}
        >
          <h2 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 10px 0', lineHeight: 1.2 }}>
            {contactBox.title}
          </h2>
          <div style={{ fontSize: 17, marginBottom: 10 }}>
            {contactBox.emailIntro}
            <br />
            <a
              href={`mailto:${contactBox.emailAddress}`}
              style={{ color: '#0077ff', fontWeight: 700, textDecoration: 'none' }}
            >
              {contactBox.emailAddress}
            </a>
          </div>
          <div style={{ fontSize: 15, color: '#333', marginTop: 8, opacity: 0.85 }}>
            {contactBox.responseTime}
          </div>
        </div>
        )}
        </div>
        <div style={{ maxWidth: 400, margin: '0px auto 32px', textAlign: 'center' }}>
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById('form-section');
              if (el) {
                const yOffset = -80;
                const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
                window.scrollTo({ top: y, behavior: 'smooth' });
              }
            }}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              display: 'block',
              width: '100%',
            }}
          >
        <Image
          src={ctaButtonImageSrc}
          alt={t(ctaButtonAltKey)}
          width={394}
          height={63}
          style={{ width: '100%', height: 'auto', display: 'block' }}
        />
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
