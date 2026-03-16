import type { StepId } from './stepIds'
import { STEP_TAGS } from './stepIds'

// Steps that don't count towards progress (tagged 'nonselective')
const IGNORED_STEPS: StepId[] = (Object.keys(STEP_TAGS) as StepId[]).filter(
  (stepId) => STEP_TAGS[stepId] === 'nonselective'
)

export default IGNORED_STEPS
