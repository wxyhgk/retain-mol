import type { FragmentDef } from '../model'
import { B_FRAGMENTS } from './hybrids/b'
import { C_FRAGMENTS } from './hybrids/c'
import { N_FRAGMENTS } from './hybrids/n'
import { O_FRAGMENTS } from './hybrids/o'
import { P_FRAGMENTS } from './hybrids/p'
import { SI_FRAGMENTS } from './hybrids/si'
import { S_FRAGMENTS } from './hybrids/s'

export const ORGANIC_STUB_FRAGMENTS: readonly FragmentDef[] = [
  ...C_FRAGMENTS,
  ...N_FRAGMENTS,
  ...O_FRAGMENTS,
  ...S_FRAGMENTS,
  ...B_FRAGMENTS,
  ...P_FRAGMENTS,
  ...SI_FRAGMENTS,
]

// 兼容旧聚合逻辑：如需新增元素，只需在 hybrids/ 下新建 <symbol>.ts 并在此聚合
export { makeHybridStub } from './hybrids/factory'
export type { HybridSpec, Hybridization } from './hybrids/factory'
