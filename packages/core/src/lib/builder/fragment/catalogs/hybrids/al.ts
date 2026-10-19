import { makeHybridStub } from './factory'

export const AL_FRAGMENTS = [
  { hyb: 'sp3' as const, attachOrder: 1 as const, hCount: 3, bondLen: 1.56 },
  { hyb: 'sp2' as const, attachOrder: 1 as const, hCount: 2, bondLen: 1.56 },
].map(spec => makeHybridStub('Al', spec))
