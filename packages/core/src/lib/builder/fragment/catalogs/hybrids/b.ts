import { makeHybridStub } from './factory'

// 硼：缺电子，常见 sp2 平面三角，sp 直线型为缺电子补充
export const B_FRAGMENTS = [
  { hyb: 'sp2' as const, attachOrder: 1 as const, hCount: 2, bondLen: 1.19 },
  { hyb: 'sp' as const, attachOrder: 1 as const, hCount: 1, bondLen: 1.19 },
].map(spec => makeHybridStub('B', spec))
