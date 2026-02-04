import type { StepId } from '@/lib/steps/stepIds';

/**
 * Control which quiz steps are disabled.
 */
export const DISABLED_STEPS: StepId[] = [];

/**
 * Control which equipment options are disabled.
 */
export const DISABLED_EQUIPMENT: string[] = [
    'pullup_bar',
    'dip_bar',
];
