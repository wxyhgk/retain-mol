/** Compatibility facade. Internal consumers use model, chemistry or presentation modules. */
import { ELEMENT_DATA, getElementData } from '../lib/model/elements'
import { getElementEditingDefaults, type Hybridization } from '../lib/chemistry/policies/elementDefaults'
import { getDefaultElementColor } from '../lib/presentation/elementColors'

export type { Hybridization } from '../lib/chemistry/policies/elementDefaults'
export { effectiveMaxBonds } from '../lib/chemistry/policies/elementDefaults'
export { COMMON_ELEMENT_SYMBOLS, PERIODIC_TABLE_LAYOUT } from '../lib/presentation/periodicTable'

export interface ElementConfig {
  symbol: string
  name: string
  atomicNumber: number
  atomicMass: number | null
  /** 共价半径 Å，用于计算键长 */
  covalentRadius: number
  /** CPK 空间填充半径 Å */
  cpkRadius: number
  /** 价电子数 */
  valenceElectrons: number
  /** 最大成键数 */
  maxBonds: number
  /** 自动补氢使用的默认价态；省略时等于有效最大成键数 */
  defaultValence?: number
  /** 默认杂化方式 */
  defaultHybridization: Hybridization
  /** CPK 颜色 hex */
  color: number
  /** 元素分类 */
  category: 'nonmetal' | 'noble-gas' | 'alkali' | 'alkaline-earth' | 'transition' | 'post-transition' | 'metalloid' | 'halogen' | 'lanthanide' | 'actinide'
}

function composeElementConfig(symbol: string): ElementConfig {
  return {
    ...getElementData(symbol),
    ...getElementEditingDefaults(symbol),
    color: getDefaultElementColor(symbol),
  }
}

// Compose once so known-symbol lookups retain their stable reference behavior.
export const ELEMENT_CONFIGS: Record<string, ElementConfig> = Object.fromEntries(
  Object.keys(ELEMENT_DATA).map(symbol => [symbol, composeElementConfig(symbol)]),
)

/** Strict lookup: undefined means no element definition is configured. */
export function findElementConfig(symbol: string): Readonly<ElementConfig> | undefined {
  return Object.hasOwn(ELEMENT_CONFIGS, symbol) ? ELEMENT_CONFIGS[symbol] : undefined
}

export function getElementConfig(symbol: string): ElementConfig {
  return (Object.hasOwn(ELEMENT_CONFIGS, symbol) ? ELEMENT_CONFIGS[symbol] : undefined) ?? composeElementConfig(symbol)
}
