import { ThemeSchema, type Theme, type ResolvedTheme } from './schema'

/**
 * 自动加载 themes/ 下所有 .json 主题，无需手动注册。
 * 用 id 字段作为 key（不是文件名，允许文件名和 id 不一致）。
 * eager: true → 构建时打包进 bundle（和之前的 import 等价）。
 */
const modules = import.meta.glob('./themes/*.json', { eager: true }) as Record<string, { default: unknown }>

const BUILTINS: Record<string, unknown> = (() => {
  const out: Record<string, unknown> = {}
  for (const [path, mod] of Object.entries(modules)) {
    try {
      const theme = ThemeSchema.parse(mod.default)
      if (out[theme.metadata.id]) {
        console.warn(`[themes] id 冲突: "${theme.metadata.id}" 同时出现在多个文件，已忽略 ${path}`)
        continue
      }
      out[theme.metadata.id] = mod.default
    } catch (e) {
      console.error(`[themes] 解析失败: ${path}`, e)
    }
  }
  return out
})()

const REGISTERED: Record<string, unknown> = {}

export interface ThemeMetadata {
  id: string
  name: string
  description: string
  source: string
  author: string
  version: string
}

/** 校验 + 返回合法 Theme；失败抛出含可读信息的错误 */
export function parseTheme(raw: unknown): Theme {
  return ThemeSchema.parse(raw)
}

export function registerTheme(raw: unknown): Theme {
  const theme = parseTheme(raw)
  REGISTERED[theme.metadata.id] = raw
  return theme
}

function getThemeRaw(id: string): unknown {
  return REGISTERED[id] ?? BUILTINS[id]
}

function getThemeEntries(): [string, unknown][] {
  return Object.entries({ ...BUILTINS, ...REGISTERED })
}

function toThemeMetadata(theme: Theme): ThemeMetadata {
  return {
    id: theme.metadata.id,
    name: theme.metadata.name,
    description: theme.metadata.description,
    source: theme.metadata.source ?? '',
    author: theme.metadata.author ?? '',
    version: theme.metadata.version,
  }
}

/** 递归解析 extends 链，返回"解析态"主题（所有字段已填） */
export function resolveTheme(id: string): ResolvedTheme {
  const chain: Theme[] = []
  let cur: string | undefined = id
  const seen = new Set<string>()
  while (cur) {
    if (seen.has(cur)) throw new Error(`主题 extends 存在循环: ${[...seen, cur].join(' → ')}`)
    seen.add(cur)
    const raw = getThemeRaw(cur)
    if (!raw) throw new Error(`未找到主题: ${cur}`)
    const theme = parseTheme(raw)
    chain.unshift(theme) // base 在前
    cur = theme.extends
  }

  // 从 base 到 override 逐层 merge
  const requestedTheme = chain.at(-1)
  if (!requestedTheme) throw new Error(`未找到主题: ${id}`)
  const merged: ResolvedTheme = {
    metadata: requestedTheme.metadata,
    scene: { backgroundColor: '#ffffff', highlightColor: '#00d4ff', highlightOpacity: 0.35 },
    render: { ballScale: 0.4, bondRadiusStick: 0.08, bondGap: 0.18, spacefillScale: 0.8 },
    bonds: { defaultColor: 'inherit-from-atoms' },
    elements: {},
    fallbackColor: '#ff69b4',
  }
  for (const t of chain) {
    if (t.scene) Object.assign(merged.scene, t.scene)
    if (t.render) Object.assign(merged.render, t.render)
    if (t.bonds) Object.assign(merged.bonds, t.bonds)
    if (t.fallbackColor) merged.fallbackColor = t.fallbackColor
    for (const [sym, style] of Object.entries(t.elements)) {
      merged.elements[sym] = { ...merged.elements[sym], ...style }
    }
  }
  return merged
}

export function listThemes(): ThemeMetadata[] {
  const preferred = ['default', 'gaussview', 'iboview', 'pymol', 'paper-soft', 'paper-classic', 'paper-dark', 'dark', 'mono']
  return getThemeEntries().map(([, raw]) => {
    const t = parseTheme(raw)
    return toThemeMetadata(t)
  }).sort((a, b) => {
    const ai = preferred.indexOf(a.id)
    const bi = preferred.indexOf(b.id)
    if (ai !== -1 || bi !== -1) return (ai === -1 ? Number.MAX_SAFE_INTEGER : ai) - (bi === -1 ? Number.MAX_SAFE_INTEGER : bi)
    return a.name.localeCompare(b.name)
  })
}

/** 便捷：hex 字符串 → THREE 使用的 0xrrggbb 数值 */
export function hexToInt(hex: string): number {
  return parseInt(hex.replace('#', ''), 16)
}
