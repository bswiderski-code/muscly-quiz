
/**
 * Centralized image and asset paths.
 * Supports `{locale}` placeholder which is resolved at runtime.
 */
export const ASSET_PATHS = {
    logos: {
        long: "/vectors/logo.svg",
    },
    buttons: {
        createPlan: "/btns/{locale}/create-plan-btn.svg",
        getYourPlan: "/btns/{locale}/get-yours-btn.svg",
        onceAgain: "/btns/{locale}/fill-again-btn.svg",
        backToHome: "/btns/{locale}/back-to-home-btn.svg",
        next: "/btns/{locale}/next-btn.svg",
        answersSummary: "/btns/{locale}/answers-summary.svg",
        workoutBef: "/btns/{locale}/workout-btn.svg",
        bundleBef: "/btns/{locale}/bundle-btn.svg",
    },
    resultPage: {
        whyTrust: "/regional/{locale}/why-trust.svg",
        productDescription: "/regional/{locale}/product-description.svg",
        sampleGuy: "/regional/{locale}/sample-guy.svg",
        heroEagle: "/vectors/t_eagle.svg",
        inclineSmith: "/vectors/exercises/incline_smith.svg",
    },
    exampleTraining: {
        samplePlan: "/example_training/{locale}/plan/sample-{n}.png",
    },
    bmiImages: {
        male: {
            "5-9": "/vectors/m_bodyfat_1.svg",
            "10-14": "/vectors/m_bodyfat_2.svg",
            "15-19": "/vectors/m_bodyfat_3.svg",
            "20-24": "/vectors/m_bodyfat_4.svg",
            "25-29": "/vectors/m_bodyfat_5.svg",
            "30-34": "/vectors/m_bodyfat_6.svg",
            "35-39": "/vectors/m_bodyfat_7.svg",
            ">40": "/vectors/m_bodyfat_8.svg"
        },
        female: {
            "10-14": "/vectors/f_bodyfat_1.svg",
            "15-19": "/vectors/f_bodyfat_2.svg",
            "20-24": "/vectors/f_bodyfat_3.svg",
            "25-29": "/vectors/f_bodyfat_4.svg",
            "30-39": "/vectors/f_bodyfat_5.svg",
            ">40": "/vectors/f_bodyfat_6.svg"
        },
        final: {
            male: "/vectors/m_final.svg",
            female: "/vectors/f_final.svg"
        }
    }
} as const;
