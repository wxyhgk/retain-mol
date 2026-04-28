import type { CalcTypeConfig, CalcCategory } from '../types'

const REGISTRY = new Map<string, CalcTypeConfig>()

export function registerCalcType(cfg: CalcTypeConfig) {
  REGISTRY.set(cfg.id, cfg)
}

export function getCalcType(id: string): CalcTypeConfig | undefined {
  return REGISTRY.get(id)
}

export function allCalcTypes(): CalcTypeConfig[] {
  return [...REGISTRY.values()]
}

export function calcTypesByCategory(): Map<CalcCategory, CalcTypeConfig[]> {
  const result = new Map<CalcCategory, CalcTypeConfig[]>()
  for (const cfg of REGISTRY.values()) {
    if (!result.has(cfg.category)) result.set(cfg.category, [])
    result.get(cfg.category)!.push(cfg)
  }
  return result
}
