import { makeHybridStub } from './factory'

export const SB_FRAGMENTS = [
  { hyb: 'sp3' as const, attachOrder: 1 as const, hCount: 3, bondLen: 1.39 },
  { hyb: 'sp2' as const, attachOrder: 1 as const, hCount: 2, bondLen: 1.39 },
].map(spec => makeHybridStub('Sb', spec))
