import type { StepId } from '@/lib/steps/stepIds';
import type { FunnelAnswers } from '@/lib/store';
import { FUNNEL_STEPS_ORDER, FUNNEL_SKIP_RULES } from '@/config/funnelFlow';

export function getSkippedSteps(answers: Partial<FunnelAnswers>): Set<StepId> {
    const skipped = new Set<StepId>();
    for (const rule of FUNNEL_SKIP_RULES) {
        const allTriggersMatch = rule.trigger.every(t => {
            const answer = answers[t.step as keyof FunnelAnswers];
            return answer !== undefined && String(answer) === t.value;
        });
        if (allTriggersMatch) {
            rule.skip.forEach(s => skipped.add(s));
        }
    }
    return skipped;
}

export function resolveNextStep(currentStepId: StepId, answers: Partial<FunnelAnswers>): StepId | null {
    const idx = FUNNEL_STEPS_ORDER.indexOf(currentStepId);
    if (idx === -1) return null;

    const skipped = getSkippedSteps(answers);

    let nextIdx = idx + 1;
    while (nextIdx < FUNNEL_STEPS_ORDER.length) {
        const candidate = FUNNEL_STEPS_ORDER[nextIdx];
        if (!skipped.has(candidate)) {
            return candidate;
        }
        nextIdx++;
    }

    return null;
}

export function resolvePrevStep(currentStepId: StepId, answers: Partial<FunnelAnswers>): StepId | null {
    const idx = FUNNEL_STEPS_ORDER.indexOf(currentStepId);
    if (idx === -1) return null;

    const skipped = getSkippedSteps(answers);

    let prevIdx = idx - 1;
    while (prevIdx >= 0) {
        const candidate = FUNNEL_STEPS_ORDER[prevIdx];
        if (!skipped.has(candidate)) {
            return candidate;
        }
        prevIdx--;
    }

    return null;
}
