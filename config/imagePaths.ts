
/**
 * Centralized image and asset paths.
 * Supports `{locale}` placeholder which is resolved at runtime.
 */
export const ASSET_PATHS = {
    logos: {
        long: "/{locale}/needle/logo-long.svg",
    },
    buttons: {
        createPlan: "/btns/{locale}/create_plan_btn.svg",
        getYourPlan: "/btns/{locale}/get_your.svg",
        onceAgain: "/btns/{locale}/once_again.svg",
        backToHome: "/btns/{locale}/backtohomepage.svg",
        next: "/btns/{locale}/next.svg",
        answersSummary: "/btns/{locale}/answers_summary.svg",
        workoutBef: "/btns/{locale}/workout_bef.svg",
        bundleBef: "/btns/{locale}/bundle_bef.svg",
    },
    resultPage: {
        whyTrust: "/{locale}/needle/why-trust.svg",
        productDescription: "/{locale}/needle/product-description.svg",
        sampleGuy: "/{locale}/needle/sample_guy.svg",
        heroEagle: "/vectors/t_eagle.svg",
        inclineSmith: "/vectors/exercises/incline_smith.svg",
    },
    exampleTraining: {
        samplePlan: "/example_training/{locale}/plan/sample-{n}.png",
    },
    bmiImages: {
        male: {
            "5-9": "/bodyfat_variants/needle/m_bodyfat_1.svg",
            "10-14": "/bodyfat_variants/needle/m_bodyfat_2.svg",
            "15-19": "/bodyfat_variants/needle/m_bodyfat_3.svg",
            "20-24": "/bodyfat_variants/needle/m_bodyfat_4.svg",
            "25-29": "/bodyfat_variants/needle/m_bodyfat_5.svg",
            "30-34": "/bodyfat_variants/needle/m_bodyfat_6.svg",
            "35-39": "/bodyfat_variants/needle/m_bodyfat_7.svg",
            ">40": "/bodyfat_variants/needle/m_bodyfat_8.svg"
        },
        female: {
            "10-14": "/bodyfat_variants/needle/f_bodyfat_1.svg",
            "15-19": "/bodyfat_variants/needle/f_bodyfat_2.svg",
            "20-24": "/bodyfat_variants/needle/f_bodyfat_3.svg",
            "25-29": "/bodyfat_variants/needle/f_bodyfat_4.svg",
            "30-39": "/bodyfat_variants/needle/f_bodyfat_5.svg",
            ">40": "/bodyfat_variants/needle/f_bodyfat_6.svg"
        },
        final: {
            male: "/bodyfat_variants/needle/m_final.svg",
            female: "/bodyfat_variants/needle/f_final.svg"
        }
    }
} as const;
