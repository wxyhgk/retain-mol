import { makeHybridStub } from './factory'

export const SE_FRAGMENTS = [
  { hyb: 'sp3' as const, attachOrder: 1 as const, hCount: 2, bondLen: 1.48 },
  { hyb: 'sp2' as const, attachOrder: 1 as const, hCount: 1, bondLen: 1.48 },
].map(spec => makeHybridStub('Se', spec))
