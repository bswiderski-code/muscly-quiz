'use client'

import { useMemo } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { useRouter } from '@/i18n/routing'
import { getFunnelSlug, getFirstStep, getStepSlug, type FunnelKey } from '@/lib/quiz/funnels'
import type { StepId } from '@/lib/quiz/stepIds'

interface MissingStepsViewProps {
  sessionId: string
  funnel: FunnelKey
  missingSteps: StepId[]
  onRetry: () => void
}

export default function MissingStepsView({
  sessionId,
  funnel,
  missingSteps,
  onRetry,
}: MissingStepsViewProps) {
  const t = useTranslations('MissingSteps')
  const locale = useLocale()
  const router = useRouter()

  // Get step labels from translations
  const stepLabels = useMemo(() => {
    const labels: Record<string, string> = {}
    const answersSummary = t.raw('stepLabels') as Record<string, string> | undefined
    if (answersSummary) {
      Object.assign(labels, answersSummary)
    }
    return labels
  }, [t])

  // Get translated step names
  const translatedSteps = useMemo(() => {
    return missingSteps.map((stepId) => {
      const label = stepLabels[stepId] || stepId
      return label
    })
  }, [missingSteps, stepLabels])

  const buttonAlt = t('buttonAlt')

  const handleRetry = () => {
    // Navigate to the first step of the funnel
    const firstStep = getFirstStep(funnel)
    const funnelSlug = getFunnelSlug(funnel)
    const stepSlug = getStepSlug(funnel, firstStep)
    
    router.push({
      pathname: '/[funnel]/[step]',
      params: { funnel: funnelSlug, step: stepSlug },
    })
    
    // Call onRetry callback to track retry attempts
    onRetry()
  }

  const stepList = translatedSteps.join(', ')
  
  // Get the description template and replace {steps} with formatted version
  const descriptionHtml = useMemo(() => {
    const template = t('description', { steps: stepList }) as string
    // Replace the plain stepList with bold version
    return template.replace(stepList, `<strong>${stepList}</strong>`)
  }, [t, stepList])

  return (
    <div
      style={{
        maxWidth: 600,
        margin: '40px auto',
        padding: '24px',
        textAlign: 'center',
        fontFamily: "inherit",
      }}
    >
      <h1
        style={{
          fontSize: 28,
          fontWeight: 700,
          marginBottom: 16,
        }}
      >
        {t('title')}
      </h1>
      
      <p
        style={{
          fontSize: 18,
          lineHeight: 1.5,
          marginBottom: 24,
        }}
        dangerouslySetInnerHTML={{
          __html: descriptionHtml,
        }}
      />

      <button
        type="button"
        className="btn btn-primary"
        onClick={handleRetry}
        style={{
          cursor: 'pointer',
          display: 'flex',
          margin: '0 auto',
          width: '100%',
          maxWidth: 400,
        }}
      >
        {buttonAlt}
      </button>
    </div>
  )
}

