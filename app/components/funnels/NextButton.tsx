'use client'

import { useFunnelStore } from '@/lib/quiz/store'
import { getFunnelSlug, getResultSlug, getStepOrder, getStepSlug, type FunnelKey, FUNNELS } from '@/lib/quiz/funnels'
import { resolveNextStep } from '@/lib/quiz/navigation'
import { useCurrentFunnel } from '@/lib/quiz/funnelContext'
import { getNextButtonConfig } from './NextButton.config'
import React from 'react'
import { useRouter } from '@/i18n/routing'
import { useLocale, useTranslations } from 'next-intl'
import type { Locale } from '@/i18n/config'
import type { StepId } from '@/lib/quiz/stepIds'

interface NextButtonProps {
  currentIdx: number
  stepId: StepId
  fieldKey?: string
  fieldValue?: any
  onClick: () => void
  disabled?: boolean
  funnel?: FunnelKey
}

const NextButton: React.FC<NextButtonProps> = ({
  currentIdx, stepId, fieldKey = '', fieldValue, onClick, disabled = false, funnel: funnelProp,
}) => {
  const locale = useLocale() as Locale
  const contextFunnel = useCurrentFunnel()
  const funnel = funnelProp ?? contextFunnel
  const config = getNextButtonConfig(funnel)

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        background: 'none',
        border: 'none',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        margin: '0 auto',
      }}
    >
      <img
        src={config.imageSrc.replace('{locale}', locale)}
        alt={config.alt}
        style={{ width: '90%', height: 'auto', maxHeight: '60px', maxWidth: '400px' }}
      />
    </button>
  )
}

export default NextButton
