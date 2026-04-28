import type { Molecule } from '@/lib/molecule'

// ── 表单字段 schema ────────────────────────────────────────────────────────────
export type FieldSchema =
  | { kind: 'select'; key: string; label: string; options: { value: string; label: string }[] }
  | { kind: 'number'; key: string; label: string; min?: number; max?: number; step?: number }
  | { kind: 'toggle'; key: string; label: string }

// ── 后端实现（具体软件：xTB / Gaussian / ORCA / ...）─────────────────────────
export interface BackendImpl {
  id: string
  label: string
  available: boolean                   // 当前环境是否可用
  extraFields?: FieldSchema[]          // 该后端特有的参数字段
  defaultInput?: Record<string, unknown>
  run: (mol: Molecule, input: Record<string, unknown>, jobId: string) => Promise<void>
}

// ── 计算类型（"做什么"，与软件无关）─────────────────────────────────────────
export type CalcCategory = 'structure' | 'energy' | 'spectrum' | 'property'

export const CATEGORY_LABEL: Record<CalcCategory, string> = {
  structure: '结构',
  energy:    '能量',
  spectrum:  '光谱',
  property:  '性质',
}

export interface CalcTypeConfig {
  id: string
  label: string
  category: CalcCategory
  description?: string
  resultType: string                   // 决定用哪个 Visualizer
  commonFields: FieldSchema[]          // 所有后端共用的字段（电荷等）
  backends: BackendImpl[]
}
