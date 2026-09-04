import { makeHybridStub } from './factory'

export const SI_FRAGMENTS = [
  { hyb: 'sp3' as const, attachOrder: 1 as const, hCount: 3, bondLen: 1.48 },
  { hyb: 'sp2' as const, attachOrder: 2 as const, hCount: 2, bondLen: 1.48 },
].map(spec => makeHybridStub('Si', spec))
