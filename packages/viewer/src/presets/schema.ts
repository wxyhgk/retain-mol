import { z } from 'zod'

// ─── 通用片段 ───────────────────────────────────────────
const HexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/, '需 #rrggbb 格式')
const Metadata = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().default(''),
  source: z.string().optional(),
  author: z.string().optional(),
  version: z.string().default('1.0.0'),
})

// ─── Theme ──────────────────────────────────────────────
export const ElementStyleSchema = z.object({
  color: HexColor,
})

export const ThemeSchema = z.object({
  $schemaVersion: z.literal('1'),
  kind: z.literal('theme'),
  metadata: Metadata,
  /** 继承另一个 theme 的 id，运行时深合并 */
  extends: z.string().optional(),
  scene: z.object({
    backgroundColor: HexColor,
    highlightColor: HexColor,
    highlightOpacity: z.number().min(0).max(1),
  }).partial().optional(),
  render: z.object({
    /** 球棍球半径 = covalentRadius × ballScale */
    ballScale: z.number().positive(),
    /** stick / wireframe 模式的键半径（Å） */
    bondRadiusStick: z.number().positive(),
    /** 双键三键的并列偏移量 */
    bondGap: z.number().positive(),
    /** 空间填充模式半径 = vdwRadius × spacefillScale */
    spacefillScale: z.number().positive(),
  }).partial().optional(),
  bonds: z.object({
    /** 'inherit-from-atoms' | 具体颜色 */
    defaultColor: z.union([z.literal('inherit-from-atoms'), HexColor]),
  }).partial().optional(),
  /** 未在 elements 中显式定义的元素使用此颜色 */
  fallbackColor: HexColor.optional(),
  elements: z.record(z.string(), ElementStyleSchema).default({}),
})

export interface ElementStyle {
  color: string
}

export interface Theme {
  $schemaVersion: '1'
  kind: 'theme'
  metadata: {
    id: string
    name: string
    description: string
    source?: string | undefined
    author?: string | undefined
    version: string
  }
  extends?: string | undefined
  scene?: {
    backgroundColor?: string | undefined
    highlightColor?: string | undefined
    highlightOpacity?: number | undefined
  } | undefined
  render?: {
    ballScale?: number | undefined
    bondRadiusStick?: number | undefined
    bondGap?: number | undefined
    spacefillScale?: number | undefined
  } | undefined
  bonds?: {
    defaultColor?: 'inherit-from-atoms' | string | undefined
  } | undefined
  fallbackColor?: string | undefined
  elements: Record<string, ElementStyle>
}

// ─── 合并后的"解析态"主题（所有字段已填，读起来不用 ?.） ──
export interface ResolvedTheme {
  metadata: Theme['metadata']
  scene: {
    backgroundColor: string
    highlightColor: string
    highlightOpacity: number
  }
  render: {
    ballScale: number
    bondRadiusStick: number
    bondGap: number
    spacefillScale: number
  }
  bonds: {
    defaultColor: 'inherit-from-atoms' | string
  }
  elements: Record<string, ElementStyle>
  /** 未列入 elements 的元素使用此颜色 */
  fallbackColor: string
}
