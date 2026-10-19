import { makeHybridStub } from './factory'

export const N_FRAGMENTS = [
  { hyb: 'sp3' as const, attachOrder: 1 as const, hCount: 2, bondLen: 1.01 },
  { hyb: 'sp2' as const, attachOrder: 2 as const, hCount: 1, bondLen: 1.01 },
  { hyb: 'sp' as const, attachOrder: 3 as const, hCount: 0, bondLen: 1.01 },
].map(spec => makeHybridStub('N', spec))
