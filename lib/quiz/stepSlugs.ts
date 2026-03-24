import type { StepId } from './stepIds'

export type LocalizedStringMap = string

export const STEP_SLUGS: Record<StepId, LocalizedStringMap> = {
  gender: 'start',
  diet_goal: 'diet_goal',
  bodyfat: 'bodyfat',
  height: 'height',
  weight: 'weight',
  weight_goal: 'desired-weight',
  age: 'age',
  activity: 'activity',
  bmi: 'bmi',
  location: 'location',
  equipment: 'equipment',
  experience: 'experience',
  difficulty: 'difficulty',
  priority: 'priority',
  frequency: 'frequency',
  fitness: 'fitness',
  sleep: 'sleep',
  pushups: 'pushups',
  pullups: 'pullups',
  duration: 'duration',
  cardio: 'cardio',
  physique_goal: 'physique_goal',
}
