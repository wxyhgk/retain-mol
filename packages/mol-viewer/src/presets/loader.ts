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

/** 校验 + 返回合法 Theme；失败抛出含可读信息的错误 */
export function parseTheme(raw: unknown): Theme {
  return ThemeSchema.parse(raw)
}

/** 递归解析 extends 链，返回"解析态"主题（所有字段已填） */
export function resolveTheme(id: string): ResolvedTheme {
  const chain: Theme[] = []
  let cur: string | undefined = id
  const seen = new Set<string>()
  while (cur) {
    if (seen.has(cur)) throw new Error(`主题 extends 存在循环: ${[...seen, cur].join(' → ')}`)
    seen.add(cur)
    const raw = BUILTINS[cur]
    if (!raw) throw new Error(`未找到主题: ${cur}`)
    const theme = parseTheme(raw)
    chain.unshift(theme) // base 在前
    cur = theme.extends
  }

  // 从 base 到 override 逐层 merge
  const merged: ResolvedTheme = {
    metadata: chain[chain.length - 1].metadata,
    scene: { backgroundColor: '#f0f4f8', highlightColor: '#00d4ff', highlightOpacity: 0.35 },
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

export function listThemes(): { id: string; name: string }[] {
  return Object.entries(BUILTINS).map(([id, raw]) => {
    const t = parseTheme(raw)
    return { id, name: t.metadata.name }
  })
}

/** 便捷：hex 字符串 → THREE 使用的 0xrrggbb 数值 */
export function hexToInt(hex: string): number {
  return parseInt(hex.replace('#', ''), 16)
}
