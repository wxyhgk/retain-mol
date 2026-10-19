import { makeHybridStub } from './factory'

export const MG_FRAGMENTS = [
  { hyb: 'sp3' as const, attachOrder: 1 as const, hCount: 2, bondLen: 1.41 },
  { hyb: 'sp' as const, attachOrder: 1 as const, hCount: 1, bondLen: 1.41 },
].map(spec => makeHybridStub('Mg', spec))
