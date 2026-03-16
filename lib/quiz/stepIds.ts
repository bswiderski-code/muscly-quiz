export const ALL_STEPS = [
  'gender',
  'diet_goal',
  'bodyfat',
  'height',
  'weight',
  'age',
  'activity',
  'bmi',
  'location',
  'equipment',
  'experience',
  'difficulty',
  'priority',
  'frequency',
  'fitness',
  'sleep',
  'pushups',
  'pullups',
  'duration',
  'cardio',
  'physique_goal',
] as const

export type StepId = typeof ALL_STEPS[number]

// 'nonselective' steps don't require user input and are excluded from progress count
export type StepTag = 'nonselective'

export const STEP_TAGS: Record<StepId, StepTag | undefined> = {
  gender: undefined,
  diet_goal: undefined,
  bodyfat: undefined,
  height: undefined,
  weight: undefined,
  age: undefined,
  activity: undefined,
  bmi: 'nonselective',
  location: undefined,
  equipment: undefined,
  experience: undefined,
  difficulty: undefined,
  priority: undefined,
  frequency: undefined,
  fitness: undefined,
  sleep: undefined,
  pushups: undefined,
  pullups: undefined,
  duration: undefined,
  cardio: undefined,
  physique_goal: undefined,
}
