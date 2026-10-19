import { makeHybridStub } from './factory'

export const C_FRAGMENTS = [
  { hyb: 'sp3' as const, attachOrder: 1 as const, hCount: 3, bondLen: 1.09 },
  { hyb: 'sp2' as const, attachOrder: 2 as const, hCount: 2, bondLen: 1.09 },
  { hyb: 'sp' as const, attachOrder: 3 as const, hCount: 1, bondLen: 1.09 },
].map(spec => makeHybridStub('C', spec))
