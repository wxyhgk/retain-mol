import { makeHybridStub } from './factory'

export const PO_FRAGMENTS = [
  { hyb: 'sp3' as const, attachOrder: 1 as const, hCount: 2, bondLen: 1.40 },
  { hyb: 'sp' as const, attachOrder: 1 as const, hCount: 1, bondLen: 1.40 },
].map(spec => makeHybridStub('Po', spec))
