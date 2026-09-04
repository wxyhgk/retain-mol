import type { LeftRailKey } from './LeftRail'

export function leftTitle(key: LeftRailKey): string {
  const map: Record<LeftRailKey, string> = {
    select: '选择',
    draw: '绘制',
    ketcher: '2D 草图',
    template: '模板',
    move: '移动',
    measure: '测量',
    erase: '擦除',
  }
  return map[key]
}

export function leftSubtitle(key: LeftRailKey): string | undefined {
  if (key === 'draw') return '杂化 · 键级（元素在右侧）'
  if (key === 'template') return '片段库'
  if (key === 'ketcher') return 'Ketcher · 同步到 3D'
  return undefined
}
