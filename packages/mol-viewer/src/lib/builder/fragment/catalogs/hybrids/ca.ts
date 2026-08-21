import { makeHybridStub } from './factory'

export const CA_FRAGMENTS = [
  { hyb: 'sp3' as const, attachOrder: 1 as const, hCount: 2, bondLen: 1.76 },
  { hyb: 'sp' as const, attachOrder: 1 as const, hCount: 1, bondLen: 1.76 },
].map(spec => makeHybridStub('Ca', spec))
