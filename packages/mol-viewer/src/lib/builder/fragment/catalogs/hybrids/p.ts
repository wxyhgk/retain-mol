import { makeHybridStub } from './factory'

// 磷：sp3 四面体为主，sp2 平面用于 P=O/P=N
export const P_FRAGMENTS = [
  { hyb: 'sp3' as const, attachOrder: 1 as const, hCount: 3, bondLen: 1.42 },
  { hyb: 'sp2' as const, attachOrder: 2 as const, hCount: 2, bondLen: 1.42 },
].map(spec => makeHybridStub('P', spec))
