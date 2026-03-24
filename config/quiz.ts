import type { StepId } from '@/lib/quiz/stepIds'

export type SkipRule = {
  trigger: { step: StepId; value: string }[]
  skip: StepId[]
}

// Steps that are disabled/hidden in the quiz
export const DISABLED_STEPS: StepId[] = ['physique_goal']

// Equipment options disabled globally
export const DISABLED_EQUIPMENT: string[] = ['pullup_bar', 'dip_bar']

// The order in which funnel steps are presented
export const FUNNEL_STEPS_ORDER: readonly StepId[] = [
  'gender',
  'diet_goal',
  'height',
  'weight',
  'weight_goal',
  'age',
  'bodyfat',
  'bmi',
  'activity',
  'location',
  'equipment',
  'pushups',
  'pullups',
  'difficulty',
  'cardio',
  'experience',
  'priority',
  'frequency',
  'duration',
  'fitness',
  'sleep',
  'physique_goal',
]

// Steps to skip depending on previous answers
export const FUNNEL_SKIP_RULES: SkipRule[] = [
  { trigger: [{ step: 'location', value: 'gym' }], skip: ['equipment', 'pushups', 'pullups'] },
  { trigger: [{ step: 'location', value: 'house' }], skip: ['difficulty'] },
]
