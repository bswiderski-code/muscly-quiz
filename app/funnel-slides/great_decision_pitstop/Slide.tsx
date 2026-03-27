'use client'

import PitStopSlide from '@/app/funnel-slides/pit_stop/PitStopSlide'
import type { StepId } from '@/lib/quiz/stepIds'

const stepId = 'great_decision_pitstop' as const satisfies StepId

export default function Page() {
  return <PitStopSlide stepId={stepId} />
}
