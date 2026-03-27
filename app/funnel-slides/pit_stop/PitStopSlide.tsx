'use client'

import ProgressHeader from '@/app/components/header/ProgressHeader'
import NextButton from '@/app/components/funnels/NextButton'
import { useStepController } from '@/lib/quiz/useStepController'
import type { StepId } from '@/lib/quiz/stepIds'
import '../funnel.css'

type Props = { stepId: StepId }

export default function PitStopSlide({ stepId }: Props) {
  const { idx, goPrev, goNext } = useStepController(stepId)

  return (
    <main className="funnel-page">
      <div className="funnel-header-wrapper">
        <ProgressHeader currentIdx={idx} onBack={goPrev} />
      </div>
      <div className="funnel-content funnel-content--centered funnel-content--with-fixed-button">
        <div className="funnel-submit-wrap">
          <NextButton currentIdx={idx} stepId={stepId} onClick={goNext} />
        </div>
      </div>
    </main>
  )
}
