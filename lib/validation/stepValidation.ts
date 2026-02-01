import type { StepId } from '../steps/stepIds'
import { STEP_TAGS } from '../steps/stepIds'
import type { FunnelKey } from '../funnels/funnels'
import { getStepOrder, FUNNELS } from '../funnels/funnels'
import type { FunnelAnswers } from '../store'

/**
 * Checks which required steps are missing from the answers.
 * Steps tagged as 'nonselective' or 'notalways' are not required.
 * Steps that are skipped due to skip rules are also not required.
 */
export function getMissingSteps(
  answers: FunnelAnswers | undefined,
  funnel: FunnelKey,
  sessionId: string
): StepId[] {
  if (!answers) {
    const order = getStepOrder(funnel)
    return order.filter(stepId => !STEP_TAGS[stepId])
  }

  const order = getStepOrder(funnel)
  const skipRules = FUNNELS[funnel]?.steps.skipRules ?? []
  
  // Calculate which steps should be skipped based on current answers
  const skippedSteps = new Set<StepId>()
  for (const rule of skipRules) {
    const triggerValue = answers[rule.trigger.step as keyof FunnelAnswers]
    if (triggerValue !== undefined && String(triggerValue) === rule.trigger.value) {
      rule.skip.forEach(s => skippedSteps.add(s))
    }
  }

  const missing: StepId[] = []
  
  for (const stepId of order) {
    // Skip if step is tagged as nonselective or notalways
    const tag = STEP_TAGS[stepId]
    if (tag === 'nonselective' || tag === 'notalways') {
      continue
    }
    
    // Skip if step is skipped due to skip rules
    if (skippedSteps.has(stepId)) {
      continue
    }
    
    // Check if step value is missing
    const value = answers[stepId as keyof FunnelAnswers]
    // Check for undefined, null, empty string, or whitespace-only string
    if (value === undefined || value === null || value === '' || (typeof value === 'string' && value.trim() === '')) {
      missing.push(stepId)
    }
  }
  
  return missing
}

