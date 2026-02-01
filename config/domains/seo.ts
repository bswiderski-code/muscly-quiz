export type DomainSeoConfig = {
  appTitle: string;
  home: { title: string; description: string };
  // Funnel-specific SEO - keyed by funnel key (e.g., 'plan')
  funnels?: Record<string, { title: string; description: string }>;
  // Legacy support for 'plan' key (deprecated, use funnels instead)
  plan?: { title: string; description: string };
  planForm?: { title: string; description: string };
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
      kalistenika: {
        title: 'Plan Kalisteniki - Trener Żyła',
        description: 'Spersonalizowany program kalisteniki dopasowany do Twojego poziomu i sprzętu.',
      },
      plan: {
        title: 'Profesjonalny plan treningowy - personalizowany dla Ciebie',
        description: 'Szukasz skutecznego planu ćwiczeń? Przygotuję dla Ciebie zestaw oparty o Twoje odpowiedzi.',
      },
    },
    plan: {
      title: 'Profesjonalny plan treningowy - personalizowany dla Ciebie',
      description: 'Szukasz skutecznego planu ćwiczeń? Przygotuję dla Ciebie zestaw oparty o Twoje odpowiedzi.',
    },
    planForm: {
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
    plan: {
      title: 'Workout plan – survey | Coach Plate',
      description: 'Fill out a short survey and generate your workout plan.',
    },
    planForm: {
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
    plan: {
      title: 'Plan d\'entraînement – questionnaire | Coach Muscu',
      description: 'Réponds à un court questionnaire et génère ton plan d\'entraînement.',
    },
    planForm: {
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
    plan: {
      title: 'Trainingsplan – Fragebogen | Coach Hantel',
      description: 'Fülle einen kurzen Fragebogen aus und erstelle deinen Trainingsplan.',
    },
    planForm: {
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
    plan: {
      title: 'Plan de Antrenament Profesional - Personalizat pentru Tine',
      description: 'Cauți un program de exerciții eficiente? Voi crea un program bazat pe răspunsurile tale.',
    },
    planForm: {
      title: 'Formular Plan | Antrenor Tănc',
      description: 'Răspunde la întrebări pentru a personaliza planul în funcție de obiectivele tale.',
    },
  },
};

// Deprecated: use localeSeoMap instead
export const domainSeoMap = localeSeoMap;
