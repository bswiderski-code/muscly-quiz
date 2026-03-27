import type { StepId } from '@/lib/quiz/stepIds'

export type SkipRule = {
  trigger: { step: StepId; value: string }[]
  skip: StepId[]
}

// Steps that are disabled/hidden in the quiz (filtered out of `order` in funnelDefinitions)
export const DISABLED_STEPS: StepId[] = []

// Equipment options disabled globally
export const DISABLED_EQUIPMENT: string[] = ['pullup_bar', 'dip_bar']

// The order in which funnel steps are presented
export const FUNNEL_STEPS_ORDER: readonly StepId[] = [
  'gender',
  'age',
  'attention_pitstop',
  'diet_goal',
  'bodyfat',
  'dream_physique',
  'great_decision_pitstop',
  'weight',
  'weight_goal',
  'height',
  'activity',
  'effects_pitstop',
  'difficulty',
  'difficulty_pitstop',
  'location',
  'equipment',
  'frequency',
  'duration',
  'priority',
  'cardio',
  'pushups',
  'pullups',
  'sleep',
  'name',
]

// Steps to skip depending on previous answers
export const FUNNEL_SKIP_RULES: SkipRule[] = [
  { trigger: [{ step: 'location', value: 'gym' }], skip: ['equipment', 'pushups', 'pullups'] },
]
