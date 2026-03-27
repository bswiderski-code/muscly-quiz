import type { StepId } from './stepIds'
import type { FunnelAnswers } from './store'

const MALE_BODYFAT_IMAGES = [
  '/bodyfats/male/5-9.png',
  '/bodyfats/male/10-14.png',
  '/bodyfats/male/15-19.png',
  '/bodyfats/male/20-24.png',
  '/bodyfats/male/25-29.png',
  '/bodyfats/male/30-34.png',
  '/bodyfats/male/35-39.png',
  '/bodyfats/male/gt40.png',
]

/** Same range filenames as male; assets in `public/bodyfats/female/`. */
const FEMALE_BODYFAT_IMAGES = [
  '/bodyfats/female/5-9.png',
  '/bodyfats/female/10-14.png',
  '/bodyfats/female/15-19.png',
  '/bodyfats/female/20-24.png',
  '/bodyfats/female/25-29.png',
  '/bodyfats/female/30-34.png',
  '/bodyfats/female/35-39.png',
  '/bodyfats/female/gt40.png',
]

/** Matches `PRIORITIES.male` in funnel-slides/priority/Slide.tsx */
export const MALE_PRIORITY_IMAGES_BY_PART: Record<string, string> = {
  shoulders: '/priorities/male/shoulders.png',
  chest: '/priorities/male/chest.png',
  triceps: '/priorities/male/triceps.png',
  biceps: '/priorities/male/biceps.png',
  back: '/priorities/male/back.png',
  legs: '/priorities/male/legs.png',
  abs: '/priorities/male/abs.png',
  forearms: '/priorities/male/forearms.png',
}

/** Matches `PRIORITIES.female` in funnel-slides/priority/Slide.tsx */
export const FEMALE_PRIORITY_IMAGES_BY_PART: Record<string, string> = {
  legs: '/priorities/female/legs.png',
  glutes: '/priorities/female/glutes.png',
  abs: '/priorities/female/abs.png',
  chest: '/priorities/female/chest.png',
  triceps: '/priorities/female/triceps.png',
  biceps: '/priorities/female/biceps.png',
  back: '/priorities/female/back.png',
  shoulders: '/priorities/female/shoulders.png',
}

const MALE_PRIORITY_IMAGE_URLS = Object.values(MALE_PRIORITY_IMAGES_BY_PART)
const FEMALE_PRIORITY_IMAGE_URLS = Object.values(FEMALE_PRIORITY_IMAGES_BY_PART)

/** Returns the image URLs that a given step will display, based on current answers. */
export function getStepImages(stepId: StepId, answers: Partial<FunnelAnswers>): string[] {
  switch (stepId) {
    case 'bodyfat':
    case 'dream_physique':
      return answers.gender === 'F' ? FEMALE_BODYFAT_IMAGES : MALE_BODYFAT_IMAGES
    case 'priority':
      return answers.gender === 'F' ? FEMALE_PRIORITY_IMAGE_URLS : MALE_PRIORITY_IMAGE_URLS
    default:
      return []
  }
}

/** All bodyfat reference images per gender (preload on bodyfat step). */
export { MALE_BODYFAT_IMAGES, FEMALE_BODYFAT_IMAGES }

let preloadedUrls: Set<string> | null = null

export type PreloadImagesOptions = {
  /** If set, failed preloads log with `console.warn(\`[context] …\`)`. */
  logContext?: string
}

/** Preload image URLs using browser Image objects. No-op on server. */
export function preloadImages(urls: string[], opts?: PreloadImagesOptions): void {
  if (typeof window === 'undefined' || urls.length === 0) return
  if (!preloadedUrls) preloadedUrls = new Set()
  const ctx = opts?.logContext
  for (const url of urls) {
    if (preloadedUrls.has(url)) continue
    preloadedUrls.add(url)
    const img = new window.Image()
    if (ctx) {
      img.onerror = () => {
        console.warn(`[${ctx}] Failed to preload image:`, url)
      }
    }
    img.src = url
  }
}
