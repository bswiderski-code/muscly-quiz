'use client'

import { useFunnelStore } from '@/lib/quiz/store'
import { getFunnelSlug, getResultSlug, getStepOrder, getStepSlug, type FunnelKey, FUNNELS } from '@/lib/quiz/funnels'
import { resolveNextStep } from '@/lib/quiz/navigation'
import { useCurrentFunnel } from '@/lib/quiz/funnelContext'
import { getNextButtonConfig } from './NextButton.config'
import { ChevronRight } from 'lucide-react'
import React from 'react'
import { useRouter } from '@/i18n/routing'
import { useLocale, useTranslations } from 'next-intl'
import type { Locale } from '@/i18n/config'
import type { StepId } from '@/lib/quiz/stepIds'
import {
  btnNextRow,
  btnNextRowIcon,
  btnNextRowLabel,
  btnPrimaryVisual,
} from '@/app/components/ui/buttonClasses'

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
  const t = useTranslations('NextButton')
  const locale = useLocale() as Locale
  const contextFunnel = useCurrentFunnel()
  const funnel = funnelProp ?? contextFunnel
  const config = getNextButtonConfig(funnel)

  return (
    <button
      type="button"
      className={`${btnPrimaryVisual} px-8 py-[18px] ${btnNextRow}`}
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '100%',
        margin: '0 auto',
        maxWidth: '400px',
      }}
    >
      <span className={btnNextRowLabel}>{t('alt') || config.alt}</span>
      <ChevronRight
        className={btnNextRowIcon}
        size={19}
        strokeWidth={2.5}
        absoluteStrokeWidth={false}
        aria-hidden="true"
      />
    </button>
  )
}

export default NextButton
