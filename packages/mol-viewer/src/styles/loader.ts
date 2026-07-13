import { StylePresetSchema, type ResolvedStylePreset, type StylePreset } from './schema'

const modules = import.meta.glob('./presets/*.json', { eager: true }) as Record<string, { default: unknown }>

const BUILTINS: Record<string, unknown> = (() => {
  const out: Record<string, unknown> = {}
  for (const [path, mod] of Object.entries(modules)) {
    try {
      const preset = StylePresetSchema.parse(mod.default)
      if (out[preset.metadata.id]) {
        console.warn(`[style-presets] id 冲突: "${preset.metadata.id}" 同时出现在多个文件，已忽略 ${path}`)
        continue
      }
      out[preset.metadata.id] = mod.default
    } catch (e) {
      console.error(`[style-presets] 解析失败: ${path}`, e)
    }
  }
  return out
})()

const REGISTERED: Record<string, unknown> = {}

export interface StylePresetMetadata {
  id: string
  name: string
  description: string
  source: string
  author: string
  version: string
}

export function parseStylePreset(raw: unknown): StylePreset {
  return StylePresetSchema.parse(raw)
}

export function registerStylePreset(raw: unknown): StylePreset {
  const preset = parseStylePreset(raw)
  REGISTERED[preset.metadata.id] = raw
  return preset
}

function getStylePresetRaw(id: string): unknown {
  return REGISTERED[id] ?? BUILTINS[id]
}

function getStylePresetEntries(): [string, unknown][] {
  return Object.entries({ ...BUILTINS, ...REGISTERED })
}

function toStylePresetMetadata(preset: StylePreset): StylePresetMetadata {
  return {
    id: preset.metadata.id,
    name: preset.metadata.name,
    description: preset.metadata.description,
    source: preset.metadata.source ?? '',
    author: preset.metadata.author ?? '',
    version: preset.metadata.version,
  }
}

export function resolveStylePreset(id: string): ResolvedStylePreset {
  const chain: StylePreset[] = []
  let cur: string | undefined = id
  const seen = new Set<string>()
  while (cur) {
    if (seen.has(cur)) throw new Error(`style preset extends 存在循环: ${[...seen, cur].join(' -> ')}`)
    seen.add(cur)
    const raw = getStylePresetRaw(cur)
    if (!raw) throw new Error(`未找到 style preset: ${cur}`)
    const preset = parseStylePreset(raw)
    chain.unshift(preset)
    cur = preset.extends
  }

  const merged = chain.reduce<Partial<ResolvedStylePreset>>((acc, preset) => ({
    ...acc,
    metadata: preset.metadata,
    ...(preset.displayMode !== undefined ? { displayMode: preset.displayMode } : {}),
    ...(preset.themeId !== undefined ? { themeId: preset.themeId } : {}),
    ...(preset.renderStyle !== undefined ? { renderStyle: preset.renderStyle } : {}),
    ...(preset.showAtomLabels !== undefined ? { showAtomLabels: preset.showAtomLabels } : {}),
  }), {})

  if (!merged.metadata || !merged.displayMode || !merged.themeId || !merged.renderStyle) {
    throw new Error(`style preset 解析后缺少必需字段: ${id}`)
  }
  return {
    metadata: merged.metadata,
    displayMode: merged.displayMode,
    themeId: merged.themeId,
    renderStyle: merged.renderStyle,
    ...(merged.showAtomLabels !== undefined ? { showAtomLabels: merged.showAtomLabels } : {}),
  }
}

export function listStylePresets(): StylePresetMetadata[] {
  const preferred = ['retainmol-default', 'gaussview-default', 'iboview-default', 'pymol-default', 'publication-soft']
  return getStylePresetEntries().map(([, raw]) => {
    const preset = parseStylePreset(raw)
    return toStylePresetMetadata(preset)
  }).sort((a, b) => {
    const ai = preferred.indexOf(a.id)
    const bi = preferred.indexOf(b.id)
    if (ai !== -1 || bi !== -1) return (ai === -1 ? Number.MAX_SAFE_INTEGER : ai) - (bi === -1 ? Number.MAX_SAFE_INTEGER : bi)
    return a.name.localeCompare(b.name)
  })
}
