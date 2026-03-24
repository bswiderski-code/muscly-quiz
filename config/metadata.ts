
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
        ogImage: '',
        funnels: {
            workout: {
                title: 'Profesjonalny plan treningowy - personalizowany dla Ciebie',
                description: 'Szukasz skutecznego planu ćwiczeń? Przygotuję dla Ciebie zestaw oparty o Twoje odpowiedzi.',
            },
        },
    },
};
