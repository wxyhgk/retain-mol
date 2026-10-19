import { makeHybridStub } from './factory'

export const GA_FRAGMENTS = [
  { hyb: 'sp3' as const, attachOrder: 1 as const, hCount: 3, bondLen: 1.22 },
  { hyb: 'sp2' as const, attachOrder: 1 as const, hCount: 2, bondLen: 1.22 },
].map(spec => makeHybridStub('Ga', spec))
