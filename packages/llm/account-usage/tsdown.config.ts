import { clientBundle } from '../../client/tsdown.client.ts'

export default clientBundle(
  '@deepseek-ai/dsh-account-usage',
  ['lib/types/index.js'],
  { hostPhase: true },
)
