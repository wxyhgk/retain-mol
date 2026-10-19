import { makeHybridStub } from './factory'

export const NA_FRAGMENTS = [
  { hyb: 'sp' as const, attachOrder: 1 as const, hCount: 1, bondLen: 1.66 },
].map(spec => makeHybridStub('Na', spec))
