import { makeHybridStub } from './factory'

export const RB_FRAGMENTS = [
  { hyb: 'sp' as const, attachOrder: 1 as const, hCount: 1, bondLen: 2.20 },
].map(spec => makeHybridStub('Rb', spec))
