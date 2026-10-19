import { makeHybridStub } from './factory'

export const PB_FRAGMENTS = [
  { hyb: 'sp3' as const, attachOrder: 1 as const, hCount: 3, bondLen: 1.46 },
  { hyb: 'sp2' as const, attachOrder: 1 as const, hCount: 2, bondLen: 1.46 },
].map(s => makeHybridStub('Pb', s))
