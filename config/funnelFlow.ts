import type { StepId } from '@/lib/steps/stepIds';

export type SkipRule = {
    trigger: {
        step: StepId;
        value: string;
    }[];
    skip: StepId[];
};

export const FUNNEL_STEPS_ORDER: readonly StepId[] = [
    'gender',
    'diet_goal',
    'height',
    'weight',
    'age',
    'bodyfat',
    'bmi',
    'activity',
    'location',
    'equipment',
    'pushups',
    'pullups',
    'difficulty',
    'cardio',
    'experience',
    'balance',
    'priority',
    'frequency',
    'duration',
    'fitness',
    'sleep',
    'physique_goal',
] as const;

export const FUNNEL_SKIP_RULES: SkipRule[] = [
    {
        trigger: [{ step: 'location', value: 'gym' }],
        skip: ['equipment', 'pushups', 'pullups']
    },
    {
        trigger: [{ step: 'location', value: 'house' }],
        skip: ['difficulty']
    },
    // balance logic: skip priority if NOT prioritized
    {
        trigger: [{ step: 'balance', value: 'balance' }],
        skip: ['priority']
    },
    {
        trigger: [{ step: 'balance', value: 'upper_only' }],
        skip: ['priority']
    },
    {
        trigger: [{ step: 'balance', value: 'lower_only' }],
        skip: ['priority']
    }
];
