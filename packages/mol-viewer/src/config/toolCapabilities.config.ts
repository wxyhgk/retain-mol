/**
 * toolCapabilities.config — 工具能力表（纯数据叶子）
 *
 * 把原本散落在各 hook/组件里的 `activeTool === 'select'` / `!== 'move-object'`
 * 字面量门禁收敛到一张能力表。消费点查表判断能力，而不是比较字符串。
 *
 * 纯数据 + 纯查表函数，禁止 import store / hooks / three.js。
 */

import type { Tool } from '../lib/presentation/types'

export interface ToolCapabilities {
  /** 可编辑分子（加/删原子、成键、生长、片段笔刷） */
  canEdit: boolean
  /** 可拖动原子 / 使用旋转 gizmo（select 态的原子平移手势） */
  canDrag: boolean
  /** 空白拖拽可框选 */
  canBoxSelect: boolean
  /** 本工具接管对象变换（move-object：平移/旋转整个片段，且禁用相机控制） */
  transformsObject: boolean
}

const CAPABILITIES: Record<Tool, ToolCapabilities> = {
  select: {
    canEdit: true,
    canDrag: true,
    canBoxSelect: true,
    transformsObject: false,
  },
  measure: {
    canEdit: false,
    canDrag: false,
    canBoxSelect: true,
    transformsObject: false,
  },
  'move-object': {
    canEdit: false,
    canDrag: false,
    canBoxSelect: false,
    transformsObject: true,
  },
}

/** 查表：某工具是否具备某项能力。工具未知时按无能力处理（保守）。 */
export function toolCan(tool: Tool | string, cap: keyof ToolCapabilities): boolean {
  const entry = CAPABILITIES[tool as Tool]
  return entry ? entry[cap] : false
}
