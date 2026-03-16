import type { StepId } from './stepIds'
import { STEP_TAGS } from './stepIds'
import type { FunnelKey } from './funnels'
import { getStepOrder, FUNNELS } from './funnels'
import type { FunnelAnswers } from './store'
import { getSkippedSteps } from './navigation'

/**
 * Returns which required steps are missing from the answers.
 * Steps tagged 'nonselective' and steps skipped by skip rules are excluded.
 */
export function getMissingSteps(
  answers: FunnelAnswers | undefined,
  funnel: FunnelKey,
  _sessionId: string,
): StepId[] {
  const order = getStepOrder(funnel)

  if (!answers) {
    return order.filter(stepId => !STEP_TAGS[stepId])
  }

  const skipRules = FUNNELS[funnel]?.steps.skipRules ?? []
  const skippedSteps = getSkippedSteps(answers, skipRules)

  return order.filter(stepId => {
    if (STEP_TAGS[stepId] === 'nonselective') return false
    if (skippedSteps.has(stepId)) return false
    const value = answers[stepId as keyof FunnelAnswers]
    return value === undefined || value === null || value === '' || (typeof value === 'string' && value.trim() === '')
  })
}
