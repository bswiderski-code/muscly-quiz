import type { FunnelAnswers } from './store'
import type { StepId } from './stepIds'

const PUSHUPS = ['0-5', '6-10', '11-20', '21-30', '30+'] as const
const PULLUPS = ['0', '1-3', '4-6', '7-10', '10+'] as const

function norm(v: unknown): string {
  if (v === undefined || v === null) return ''
  return String(v).trim()
}

function positiveNumber(v: unknown): boolean {
  if (typeof v === 'number') return Number.isFinite(v) && v > 0
  const n = Number(norm(v).replace(',', '.'))
  return Number.isFinite(n) && n > 0
}

/** True if `answers` has a non-empty, plausible value for this step (blocks Next / advance). */
export function isStepAnswerComplete(stepId: StepId, answers: FunnelAnswers): boolean {
  switch (stepId) {
    case 'gender':
      return answers.gender === 'M' || answers.gender === 'F'
    case 'diet_goal':
      return answers.diet_goal === 'bulk' || answers.diet_goal === 'cut'
    case 'bodyfat':
      return norm(answers.bodyfat) !== ''
    case 'dream_physique':
      return norm(answers.dream_physique) !== ''
    case 'height':
      return positiveNumber(answers.height)
    case 'weight':
      return positiveNumber(answers.weight)
    case 'weight_goal':
      return positiveNumber(answers.weight_goal)
    case 'age': {
      const s = norm(answers.age)
      if (!/^\d{1,2}$/.test(s)) return false
      const n = Number.parseInt(s, 10)
      return n >= 12 && n <= 99
    }
    case 'activity':
      return norm(answers.activity) !== ''
    case 'bmi':
      return true
    case 'location': {
      const l = norm(answers.location)
      return l === 'gym' || l === 'house'
    }
    case 'equipment':
      return norm(answers.equipment) !== ''
    case 'experience':
      return norm(answers.experience) !== ''
    case 'difficulty':
      return norm(answers.difficulty) !== ''
    case 'priority':
      return norm(answers.priority).split(',').filter(Boolean).length > 0
    case 'frequency':
      return norm(answers.frequency) !== ''
    case 'fitness': {
      const n =
        typeof answers.fitness === 'number'
          ? answers.fitness
          : Number(norm(answers.fitness))
      return Number.isFinite(n) && n >= 1 && n <= 10
    }
    case 'sleep':
      return norm(answers.sleep) !== ''
    case 'pushups':
      return (PUSHUPS as readonly string[]).includes(norm(answers.pushups))
    case 'pullups':
      return (PULLUPS as readonly string[]).includes(norm(answers.pullups))
    case 'duration':
      return norm(answers.duration) !== ''
    case 'cardio':
      return answers.cardio === 'yes' || answers.cardio === 'no'
    case 'physique_goal': {
      const p = norm(answers.physique_goal)
      return p === 'aesthetic' || p === 'strength' || p === 'health'
    }
    case 'attention_pitstop':
    case 'great_decision_pitstop':
    case 'effects_pitstop':
    case 'difficulty_pitstop':
      return true
    case 'name':
      return norm(answers.name).length >= 1
    default:
      return false
  }
}
