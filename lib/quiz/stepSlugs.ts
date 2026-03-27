import type { StepId } from './stepIds'

export type LocalizedStringMap = string

export const STEP_SLUGS: Record<StepId, LocalizedStringMap> = {
  gender: 'start',
  diet_goal: 'diet_goal',
  bodyfat: 'bodyfat',
  dream_physique: 'dream-physique',
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
  attention_pitstop: 'attention',
  great_decision_pitstop: 'great-decision',
  effects_pitstop: 'effects',
  difficulty_pitstop: 'difficulty-break',
  name: 'name',
}
