import { makeHybridStub } from './factory'

export const S_FRAGMENTS = [
  { hyb: 'sp3' as const, attachOrder: 1 as const, hCount: 1, bondLen: 1.34 },
  { hyb: 'sp2' as const, attachOrder: 2 as const, hCount: 0, bondLen: 1.60 },
].map(spec => makeHybridStub('S', spec))
