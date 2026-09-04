import { makeHybridStub } from './factory'

export const K_FRAGMENTS = [
  { hyb: 'sp' as const, attachOrder: 1 as const, hCount: 1, bondLen: 2.03 },
].map(spec => makeHybridStub('K', spec))
