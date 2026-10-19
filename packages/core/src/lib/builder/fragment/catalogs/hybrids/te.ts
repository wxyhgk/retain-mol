import { makeHybridStub } from './factory'

export const TE_FRAGMENTS = [
  { hyb: 'sp3' as const, attachOrder: 1 as const, hCount: 2, bondLen: 1.38 },
  { hyb: 'sp2' as const, attachOrder: 1 as const, hCount: 1, bondLen: 1.38 },
].map(spec => makeHybridStub('Te', spec))
