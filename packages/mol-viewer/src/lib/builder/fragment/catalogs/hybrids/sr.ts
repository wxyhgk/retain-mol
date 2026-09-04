import { makeHybridStub } from './factory'

export const SR_FRAGMENTS = [
  { hyb: 'sp3' as const, attachOrder: 1 as const, hCount: 2, bondLen: 1.95 },
  { hyb: 'sp' as const, attachOrder: 1 as const, hCount: 1, bondLen: 1.95 },
].map(spec => makeHybridStub('Sr', spec))
