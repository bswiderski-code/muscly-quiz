import type { Locale } from '@/i18n/config'
import type { StepId } from './stepIds'

export type LocalizedStringMap = Partial<Record<Locale, string>>

export const STEP_SLUGS: Record<StepId, LocalizedStringMap> = {
  gender: { pl: 'start', en: 'start', fr: 'start', de: 'start', ro: 'start' },
  diet_goal: { pl: 'cel_diety', en: 'diet_goal', fr: 'diet_goal', de: 'diet_goal', ro: 'obiectiv_dieta' },
  bodyfat: { pl: 'bodyfat', en: 'bodyfat', fr: 'bodyfat', de: 'bodyfat', ro: 'grasime_corporala' },
  height: { pl: 'wzrost', en: 'height', fr: 'height', de: 'height', ro: 'inaltime' },
  weight: { pl: 'waga', en: 'weight', fr: 'weight', de: 'weight', ro: 'greutate' },
  age: { pl: 'wiek', en: 'age', fr: 'age', de: 'age', ro: 'varsta' },
  activity: { pl: 'aktywnosc', en: 'activity', fr: 'activity', de: 'activity', ro: 'activitate' },
  bmi: { pl: 'bmi', en: 'bmi', fr: 'bmi', de: 'bmi', ro: 'bmi' },
  location: { pl: 'lokalizacja_treningow', en: 'location', fr: 'location', de: 'location', ro: 'locatie_antrenament' },
  equipment: { pl: 'sprzet', en: 'equipment', fr: 'equipment', de: 'equipment', ro: 'echipament' },
  experience: { pl: 'doswiadczenie', en: 'experience', fr: 'experience', de: 'experience', ro: 'experienta' },
  difficulty: { pl: 'trudnosc', en: 'difficulty', fr: 'difficulty', de: 'difficulty', ro: 'dificultate' },
  priority: { pl: 'priorytet', en: 'priority', fr: 'priority', de: 'priority', ro: 'prioritate' },
  frequency: { pl: 'czestotliwosc', en: 'frequency', fr: 'frequency', de: 'frequency', ro: 'frecventa' },
  fitness: { pl: 'sprawnosc', en: 'fitness', fr: 'fitness', de: 'fitness', ro: 'fitness' },
  sleep: { pl: 'sen', en: 'sleep', fr: 'sleep', de: 'sleep', ro: 'somn' },
  pushups: { pl: 'pompki', en: 'pushups', fr: 'pompes', de: 'liegestuetze', ro: 'flotari' },
  pullups: { pl: 'podciagania', en: 'pullups', fr: 'tractions', de: 'klimmzuege', ro: 'tractiuni' },
  calistenic_experience: { pl: 'doswiadczenie_kalistenika', en: 'calisthenics_experience', fr: 'experience_calisthenie', de: 'kalisthenik_erfahrung', ro: 'experienta_calistenice' },
  duration: { pl: 'czas_trwania', en: 'duration', fr: 'duree', de: 'dauer', ro: 'durata' },
}
