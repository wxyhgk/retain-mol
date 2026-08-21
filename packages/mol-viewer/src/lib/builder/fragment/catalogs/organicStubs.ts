import type { FragmentDef } from '../model'
import { AL_FRAGMENTS } from './hybrids/al'
import { AS_FRAGMENTS } from './hybrids/as'
import { B_FRAGMENTS } from './hybrids/b'
import { BE_FRAGMENTS } from './hybrids/be'
import { CA_FRAGMENTS } from './hybrids/ca'
import { C_FRAGMENTS } from './hybrids/c'
import { GA_FRAGMENTS } from './hybrids/ga'
import { GE_FRAGMENTS } from './hybrids/ge'
import { IN_FRAGMENTS } from './hybrids/in'
import { LI_FRAGMENTS } from './hybrids/li'
import { MG_FRAGMENTS } from './hybrids/mg'
import { NA_FRAGMENTS } from './hybrids/na'
import { N_FRAGMENTS } from './hybrids/n'
import { O_FRAGMENTS } from './hybrids/o'
import { P_FRAGMENTS } from './hybrids/p'
import { SB_FRAGMENTS } from './hybrids/sb'
import { SE_FRAGMENTS } from './hybrids/se'
import { SI_FRAGMENTS } from './hybrids/si'
import { SN_FRAGMENTS } from './hybrids/sn'
import { S_FRAGMENTS } from './hybrids/s'
import { K_FRAGMENTS } from './hybrids/k'
import { RB_FRAGMENTS } from './hybrids/rb'
import { TE_FRAGMENTS } from './hybrids/te'
import { TL_FRAGMENTS } from './hybrids/tl'

export const ORGANIC_STUB_FRAGMENTS: readonly FragmentDef[] = [
  ...C_FRAGMENTS,
  ...N_FRAGMENTS,
  ...O_FRAGMENTS,
  ...S_FRAGMENTS,
  ...B_FRAGMENTS,
  ...P_FRAGMENTS,
  ...SI_FRAGMENTS,
  ...AL_FRAGMENTS,
  ...GE_FRAGMENTS,
  ...BE_FRAGMENTS,
  ...AS_FRAGMENTS,
  ...SE_FRAGMENTS,
  ...GA_FRAGMENTS,
  ...IN_FRAGMENTS,
  ...TL_FRAGMENTS,
  ...TE_FRAGMENTS,
  ...SB_FRAGMENTS,
  ...SN_FRAGMENTS,
  ...LI_FRAGMENTS,
  ...NA_FRAGMENTS,
  ...K_FRAGMENTS,
  ...RB_FRAGMENTS,
  ...MG_FRAGMENTS,
  ...CA_FRAGMENTS,
]

// 兼容旧聚合逻辑：如需新增元素，只需在 hybrids/ 下新建 <symbol>.ts 并在此聚合
export { makeHybridStub } from './hybrids/factory'
export type { HybridSpec, Hybridization } from './hybrids/factory'
