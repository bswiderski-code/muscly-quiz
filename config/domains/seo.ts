export type DomainSeoConfig = {
  appTitle: string;
  home: { title: string; description: string };
  // Funnel-specific SEO - keyed by funnel key (e.g., 'workout')
  funnels?: Record<string, { title: string; description: string }>;
  // Legacy support for 'workout' key (deprecated, use funnels instead)
  workout?: { title: string; description: string };
  workoutForm?: { title: string; description: string };
};

/**
 * Locale-specific SEO configuration.
 * Since we have one domain now, we map by locale.
 */
export const localeSeoMap: Record<string, DomainSeoConfig> = {
  pl: {
    appTitle: 'Trener Strzykawa',
    home: {
      title: 'Plan treningowy | Trener Strzykawa',
      description: 'Stwórz plan treningowy dopasowany do Ciebie. Krótka ankieta, wynik w kilka minut.',
    },
    funnels: {
      workout: {
        title: 'Profesjonalny plan treningowy - personalizowany dla Ciebie',
        description: 'Szukasz skutecznego planu ćwiczeń? Przygotuję dla Ciebie zestaw oparty o Twoje odpowiedzi.',
      },
    },
    workout: {
      title: 'Profesjonalny plan treningowy - personalizowany dla Ciebie',
      description: 'Szukasz skutecznego planu ćwiczeń? Przygotuję dla Ciebie zestaw oparty o Twoje odpowiedzi.',
    },
    workoutForm: {
      title: 'Formularz planu | Trener Strzykawa',
      description: 'Odpowiedz na pytania, aby dopasować plan do Twoich celów.',
    },
  },
  en: {
    appTitle: 'Coach Plate',
    home: {
      title: 'Workout plan | Coach Plate',
      description: 'Create a workout plan tailored to you. Quick survey, results in minutes.',
    },
    workout: {
      title: 'Workout plan – survey | Coach Plate',
      description: 'Fill out a short survey and generate your workout plan.',
    },
    workoutForm: {
      title: 'Plan form | Coach Plate',
      description: 'Answer a few questions so we can match the plan to your goals.',
    },
  },
  fr: {
    appTitle: 'Coach Muscu',
    home: {
      title: 'Plan d\'entraînement | Coach Muscu',
      description: 'Crée un plan d\'entraînement adapté à toi. Questionnaire rapide, résultat en quelques minutes.',
    },
    workout: {
      title: 'Plan d\'entraînement – questionnaire | Coach Muscu',
      description: 'Réponds à un court questionnaire et génère ton plan d\'entraînement.',
    },
    workoutForm: {
      title: 'Formulaire du plan | Coach Muscu',
      description: 'Réponds à quelques questions pour adapter le plan à tes objectifs.',
    },
  },
  de: {
    appTitle: 'Coach Hantel',
    home: {
      title: 'Trainingsplan | Coach Hantel',
      description: 'Erstelle einen Trainingsplan, der zu dir passt. Kurzer Fragebogen, Ergebnis in wenigen Minuten.',
    },
    workout: {
      title: 'Trainingsplan – Fragebogen | Coach Hantel',
      description: 'Fülle einen kurzen Fragebogen aus und erstelle deinen Trainingsplan.',
    },
    workoutForm: {
      title: 'Plan-Formular | Coach Hantel',
      description: 'Beantworte ein paar Fragen, damit der Plan zu deinen Zielen passt.',
    },
  },
  ro: {
    appTitle: 'Antrenor Tănc',
    home: {
      title: 'Plan Antrenament | Antrenor Tănc',
      description: 'Creează un plan de antrenament personalizat pentru tine. Chestionar rapid, rezultate în câteva minute.',
    },
    workout: {
      title: 'Plan de Antrenament Profesional - Personalizat pentru Tine',
      description: 'Cauți un program de exerciții eficiente? Voi crea un program bazat pe răspunsurile tale.',
    },
    workoutForm: {
      title: 'Formular Plan | Antrenor Tănc',
      description: 'Răspunde la întrebări pentru a personaliza planul în funcție de obiectivele tale.',
    },
  },
};

// Deprecated: use localeSeoMap instead
export const domainSeoMap = localeSeoMap;
