import type { Bond } from '../lib/molecule'
import { inferHybridization as inferBuilderHybridization } from '../lib/builder/analysis/hybridization'

/** Read-only public adapter over the builder's canonical hybridization inference. */
export function inferHybridization(
  bonds: readonly Bond[],
  atomId: string,
): 'sp' | 'sp2' | 'sp3' {
  return inferBuilderHybridization(bonds, atomId)
}
