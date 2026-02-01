
export type MetadataConfig = {
    appTitle: string;
    home: { title: string; description: string };
    planForm: { title: string; description: string };
    ogImage: string;
    // Funnel-specific metadata can be expanded here if needed
    funnels?: Record<string, { title: string; description: string }>;
};

/**
 * Locale-specific metadata configuration.
 * Multi-domain logic is removed as we now operate under a single brand: Musclepals.
 */
export const localeMetadata: Record<string, MetadataConfig> = {
    pl: {
        appTitle: 'Musclepals',
        home: {
            title: 'Plan treningowy | Musclepals',
            description: 'Stwórz plan treningowy dopasowany do Ciebie. Krótka ankieta, wynik w kilka minut.',
        },
        planForm: {
            title: 'Formularz planu | Musclepals',
            description: 'Odpowiedz na pytania, aby dopasować plan do Twoich celów.',
        },
        ogImage: '/og-image-quiz-pl.png',
        funnels: {
            workout: {
                title: 'Profesjonalny plan treningowy - personalizowany dla Ciebie',
                description: 'Szukasz skutecznego planu ćwiczeń? Przygotuję dla Ciebie zestaw oparty o Twoje odpowiedzi.',
            },
        },
    },
    en: {
        appTitle: 'Musclepals',
        home: {
            title: 'Workout plan | Musclepals',
            description: 'Create a workout plan tailored to you. Quick survey, results in minutes.',
        },
        planForm: {
            title: 'Plan form | Musclepals',
            description: 'Answer a few questions so we can match the plan to your goals.',
        },
        ogImage: '/og-image-quiz-en.png',
        funnels: {
            workout: {
                title: 'Workout plan – survey | Musclepals',
                description: 'Fill out a short survey and generate your workout plan.',
            },
        },
    },
    fr: {
        appTitle: 'Musclepals',
        home: {
            title: 'Plan d\'entraînement | Musclepals',
            description: 'Crée un plan d\'entraînement adapté à toi. Questionnaire rapide, résultat en quelques minutes.',
        },
        planForm: {
            title: 'Formulaire du plan | Musclepals',
            description: 'Réponds à quelques questions pour adapter le plan à tes objectifs.',
        },
        ogImage: '/og-image-quiz-en.png',
        funnels: {
            workout: {
                title: 'Plan d\'entraînement – questionnaire | Musclepals',
                description: 'Réponds à un court questionnaire et génère ton plan d\'entraînement.',
            },
        },
    },
    de: {
        appTitle: 'Musclepals',
        home: {
            title: 'Trainingsplan | Musclepals',
            description: 'Erstelle einen Trainingsplan, der zu dir passt. Kurzer Fragebogen, Ergebnis in wenigen Minuten.',
        },
        planForm: {
            title: 'Plan-Formular | Musclepals',
            description: 'Beantworte ein paar Fragen, damit der Plan zu deinen Zielen passt.',
        },
        ogImage: '/og-image-quiz-en.png',
        funnels: {
            workout: {
                title: 'Trainingsplan – Fragebogen | Musclepals',
                description: 'Fülle einen kurzen Fragebogen aus und erstelle deinen Trainingsplan.',
            },
        },
    },
    ro: {
        appTitle: 'Musclepals',
        home: {
            title: 'Plan Antrenament | Musclepals',
            description: 'Creează un plan de antrenament personalizat pentru tine. Chestionar rapid, rezultate în câteva minute.',
        },
        planForm: {
            title: 'Formular Plan | Musclepals',
            description: 'Răspunde la întrebări pentru a personaliza planul în funcție de obiectivele tale.',
        },
        ogImage: '/og-image-quiz-en.png',
        funnels: {
            workout: {
                title: 'Plan de Antrenament Profesional - Personalizat pentru Tine',
                description: 'Cauți un program de exerciții eficiente? Voi crea un program bazat pe răspunsurile tale.',
            },
        },
    },
};
