import { makeHybridStub } from './factory'

export const BE_FRAGMENTS = [
  { hyb: 'sp' as const, attachOrder: 1 as const, hCount: 1, bondLen: 1.34 },
].map(spec => makeHybridStub('Be', spec))
