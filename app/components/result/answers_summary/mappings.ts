import type { StepId } from '@/lib/quiz/stepIds'

/**
 * Emoji mappings for different answer keys and values
 * Centralizes all emoji logic that was previously hardcoded in the component
 */
export const ANSWER_EMOJIS: Record<string, string | ((value: any) => string)> = {
  // Simple key-based emojis
  age: '🎂',
  height: '📏',
  weight: '⚖️',
  weight_goal: '⚖️',
  bodyfat: '💧',
  dream_physique: '✨',
  activity: '🏃‍♂️',
  experience: '🎓',
  difficulty: '🧗',
  equipment: '🧰',
  priority: '🎯',
  frequency: '📅',
  fitness: '💪',
  sleep: '🛌',
  pushups: '💪',
  pullups: '🧗',
  duration: '⏱️',
  bmi: '📊',
  name: '👤',
  email: '✉️',
  cardio: '❤️',

  // Value-dependent emojis
  gender: (value: any) => {
    // Normalize gender for emoji lookup
    if (value === 'male' || value === 'M') return '👨'
    if (value === 'female' || value === 'F' || value === 'Kobieta') return '👩'
    return '🧑'
  },

  diet_goal: (value: any) => {
    if (value === 'bulk') return '📈'
    if (value === 'cut') return '📉'
    return '🍽️'
  },

  location: (value: any) => {
    return value === 'gym' ? '🏋️' : '🏠'
  },
}

/**
 * Get emoji for a given answer key and value
 */
export function getAnswerEmoji(key: StepId | string, value: any): string {
  const emojiConfig = ANSWER_EMOJIS[key]

  if (typeof emojiConfig === 'function') {
    return emojiConfig(value)
  }

  return emojiConfig || ''
}

/**
 * Default label formatting when no translation is available
 */
export function formatDefaultLabel(key: string): string {
  return key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
}

/**
 * Common conjunction words used in answer formatting
 */
export const CONJUNCTIONS = {
  and: 'i',
  or: 'lub',
} as const

/**
 * Value formatting patterns
 */
export const VALUE_FORMATS = {
  age: '{value} lat',
  height: '{value} cm',
  weight: '{value} kg',
  bodyfat: '{value}%',
  frequency: '{value}x w tygodniu',
  fitness: '{value}/10',
  sleep: '{value} godz.',
  pushups: 'Umiem zrobić {value} pompek.',
  pullups: 'Umiem zrobić {value} podciągnięć.',
  duration: '{value} minut',
} as const

/**
 * Get formatted value for display
 */
export function formatValue(value: any, format: string): string {
  if (value === null || value === undefined || value === '') return ''
  return format.replace('{value}', String(value))
}