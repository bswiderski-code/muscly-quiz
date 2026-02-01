// List of steps that should not count towards the progress bar but still exist in the funnel.
// Steps with 'nonselective' tag are considered ignored.
import type { StepId } from '@/lib/steps/stepIds.ts';
import { STEP_TAGS } from './stepIds';

const IGNORED_STEPS: StepId[] = (Object.keys(STEP_TAGS) as StepId[]).filter(
  (stepId) => STEP_TAGS[stepId] === 'nonselective'
);

export default IGNORED_STEPS;