import { makeHybridStub } from './factory'

export const LI_FRAGMENTS = [
  { hyb: 'sp' as const, attachOrder: 1 as const, hCount: 1, bondLen: 1.28 },
].map(spec => makeHybridStub('Li', spec))
