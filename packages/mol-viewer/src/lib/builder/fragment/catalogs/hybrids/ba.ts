import { makeHybridStub } from './factory'

export const BA_FRAGMENTS = [
  { hyb: 'sp3' as const, attachOrder: 1 as const, hCount: 2, bondLen: 2.15 },
  { hyb: 'sp' as const, attachOrder: 1 as const, hCount: 1, bondLen: 2.15 },
].map(spec => makeHybridStub('Ba', spec))
