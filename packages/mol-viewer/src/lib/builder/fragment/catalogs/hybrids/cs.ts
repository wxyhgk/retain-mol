import { makeHybridStub } from './factory'

export const CS_FRAGMENTS = [
  { hyb: 'sp' as const, attachOrder: 1 as const, hCount: 1, bondLen: 2.35 },
].map(spec => makeHybridStub('Cs', spec))
