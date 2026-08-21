import { makeHybridStub } from './factory'

export const TL_FRAGMENTS = [
  { hyb: 'sp3' as const, attachOrder: 1 as const, hCount: 3, bondLen: 1.45 },
  { hyb: 'sp2' as const, attachOrder: 1 as const, hCount: 2, bondLen: 1.45 },
].map(spec => makeHybridStub('Tl', spec))
