import { makeHybridStub } from './factory'

export const O_FRAGMENTS = [
  { hyb: 'sp3' as const, attachOrder: 1 as const, hCount: 1, bondLen: 0.96 },
  { hyb: 'sp2' as const, attachOrder: 2 as const, hCount: 0, bondLen: 1.21 },
].map(spec => makeHybridStub('O', spec))
