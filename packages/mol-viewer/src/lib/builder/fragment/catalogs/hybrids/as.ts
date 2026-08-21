import { makeHybridStub } from './factory'

export const AS_FRAGMENTS = [
  { hyb: 'sp3' as const, attachOrder: 1 as const, hCount: 3, bondLen: 1.52 },
  { hyb: 'sp2' as const, attachOrder: 1 as const, hCount: 2, bondLen: 1.52 },
].map(spec => makeHybridStub('As', spec))
