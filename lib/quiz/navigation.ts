import type { StepId } from './stepIds'
import type { FunnelAnswers } from './store'
import type { SkipRule } from '@/config/quiz'

export function getSkippedSteps(answers: Partial<FunnelAnswers>, skipRules: SkipRule[]): Set<StepId> {
  const skipped = new Set<StepId>()
  for (const rule of skipRules) {
    const allTriggersMatch = rule.trigger.every(t => {
      const answer = answers[t.step as keyof FunnelAnswers]
      return answer !== undefined && String(answer) === t.value
    })
    if (allTriggersMatch) {
      rule.skip.forEach(s => skipped.add(s))
    }
  }
  return skipped
}

export function resolveNextStep(
  currentStepId: StepId,
  order: readonly StepId[],
  answers: Partial<FunnelAnswers>,
  skipRules: SkipRule[],
): StepId | null {
  const idx = order.indexOf(currentStepId)
  if (idx === -1) return null

  const skipped = getSkippedSteps(answers, skipRules)

  let nextIdx = idx + 1
  while (nextIdx < order.length) {
    if (!skipped.has(order[nextIdx])) return order[nextIdx]
    nextIdx++
  }
  return null
}

export function resolvePrevStep(
  currentStepId: StepId,
  order: readonly StepId[],
  answers: Partial<FunnelAnswers>,
  skipRules: SkipRule[],
): StepId | null {
  const idx = order.indexOf(currentStepId)
  if (idx === -1) return null

  const skipped = getSkippedSteps(answers, skipRules)

  let prevIdx = idx - 1
  while (prevIdx >= 0) {
    if (!skipped.has(order[prevIdx])) return order[prevIdx]
    prevIdx--
  }
  return null
}
