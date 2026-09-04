import type { RightRailKey } from './RightRail'

export function rightTitle(key: RightRailKey): string {
  const map: Record<RightRailKey, string> = {
    elements: '元素',
    inspector: '属性',
    scene: '场景',
    display: '显示',
  }
  return map[key]
}

export function rightSubtitle(key: RightRailKey): string | undefined {
  if (key === 'elements') return '常用 · 杂化 · 周期表'
  return undefined
}
