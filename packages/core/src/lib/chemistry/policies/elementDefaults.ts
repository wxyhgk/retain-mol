import { getElementData, type ConfiguredElementSymbol } from '../../model/elements'

/** Default orbital geometry used by the editor. */
export type Hybridization = 'sp' | 'sp2' | 'sp3' | 'sp3d' | 'sp3d2' | 'none'

/** Editor defaults, not universal bonding limits or atom-specific state. */
export interface ElementEditingDefaults {
  readonly valenceElectrons: number
  readonly maxBonds: number
  readonly defaultValence?: number
  readonly defaultHybridization: Hybridization
}

export const ELEMENT_EDITING_DEFAULTS: Readonly<Record<ConfiguredElementSymbol, ElementEditingDefaults>> = {
  H: { valenceElectrons: 1, maxBonds: 1, defaultHybridization: 'sp3' },
  He: { valenceElectrons: 2, maxBonds: 0, defaultHybridization: 'none' },
  Li: { valenceElectrons: 1, maxBonds: 1, defaultHybridization: 'sp3' },
  Be: { valenceElectrons: 2, maxBonds: 2, defaultHybridization: 'sp' },
  B: { valenceElectrons: 3, maxBonds: 3, defaultHybridization: 'sp2' },
  C: { valenceElectrons: 4, maxBonds: 4, defaultHybridization: 'sp3' },
  N: { valenceElectrons: 5, maxBonds: 3, defaultHybridization: 'sp3' },
  O: { valenceElectrons: 6, maxBonds: 2, defaultHybridization: 'sp3' },
  F: { valenceElectrons: 7, maxBonds: 1, defaultHybridization: 'sp3' },
  Ne: { valenceElectrons: 8, maxBonds: 0, defaultHybridization: 'none' },
  Na: { valenceElectrons: 1, maxBonds: 1, defaultHybridization: 'sp3' },
  Mg: { valenceElectrons: 2, maxBonds: 2, defaultHybridization: 'sp3' },
  Al: { valenceElectrons: 3, maxBonds: 3, defaultHybridization: 'sp3' },
  Si: { valenceElectrons: 4, maxBonds: 4, defaultHybridization: 'sp3' },
  P: { valenceElectrons: 5, maxBonds: 5, defaultValence: 3, defaultHybridization: 'sp3' },
  S: { valenceElectrons: 6, maxBonds: 6, defaultValence: 2, defaultHybridization: 'sp3' },
  Cl: { valenceElectrons: 7, maxBonds: 1, defaultHybridization: 'sp3' },
  Ar: { valenceElectrons: 8, maxBonds: 0, defaultHybridization: 'none' },
  K: { valenceElectrons: 1, maxBonds: 1, defaultHybridization: 'sp3' },
  Ca: { valenceElectrons: 2, maxBonds: 2, defaultHybridization: 'sp3' },
  Sc: { valenceElectrons: 3, maxBonds: 12, defaultValence: 0, defaultHybridization: 'sp3d2' },
  Ti: { valenceElectrons: 4, maxBonds: 12, defaultValence: 0, defaultHybridization: 'sp3d2' },
  V: { valenceElectrons: 5, maxBonds: 12, defaultValence: 0, defaultHybridization: 'sp3d2' },
  Cr: { valenceElectrons: 6, maxBonds: 12, defaultValence: 0, defaultHybridization: 'sp3d2' },
  Mn: { valenceElectrons: 7, maxBonds: 12, defaultValence: 0, defaultHybridization: 'sp3d2' },
  Fe: { valenceElectrons: 8, maxBonds: 12, defaultValence: 0, defaultHybridization: 'sp3d2' },
  Co: { valenceElectrons: 9, maxBonds: 12, defaultValence: 0, defaultHybridization: 'sp3d2' },
  Ni: { valenceElectrons: 10, maxBonds: 12, defaultValence: 0, defaultHybridization: 'sp3d2' },
  Cu: { valenceElectrons: 11, maxBonds: 12, defaultValence: 0, defaultHybridization: 'sp3d2' },
  Zn: { valenceElectrons: 12, maxBonds: 12, defaultValence: 0, defaultHybridization: 'sp3d2' },
  Y: { valenceElectrons: 3, maxBonds: 12, defaultValence: 0, defaultHybridization: 'sp3d2' },
  Zr: { valenceElectrons: 4, maxBonds: 12, defaultValence: 0, defaultHybridization: 'sp3d2' },
  Nb: { valenceElectrons: 5, maxBonds: 12, defaultValence: 0, defaultHybridization: 'sp3d2' },
  Mo: { valenceElectrons: 6, maxBonds: 12, defaultValence: 0, defaultHybridization: 'sp3d2' },
  Tc: { valenceElectrons: 7, maxBonds: 12, defaultValence: 0, defaultHybridization: 'sp3d2' },
  Ru: { valenceElectrons: 8, maxBonds: 12, defaultValence: 0, defaultHybridization: 'sp3d2' },
  Rh: { valenceElectrons: 9, maxBonds: 12, defaultValence: 0, defaultHybridization: 'sp3d2' },
  Pd: { valenceElectrons: 10, maxBonds: 12, defaultValence: 0, defaultHybridization: 'sp3d2' },
  Ag: { valenceElectrons: 11, maxBonds: 12, defaultValence: 0, defaultHybridization: 'sp3d2' },
  Cd: { valenceElectrons: 12, maxBonds: 12, defaultValence: 0, defaultHybridization: 'sp3d2' },
  Hf: { valenceElectrons: 4, maxBonds: 12, defaultValence: 0, defaultHybridization: 'sp3d2' },
  Ta: { valenceElectrons: 5, maxBonds: 12, defaultValence: 0, defaultHybridization: 'sp3d2' },
  W: { valenceElectrons: 6, maxBonds: 12, defaultValence: 0, defaultHybridization: 'sp3d2' },
  Re: { valenceElectrons: 7, maxBonds: 12, defaultValence: 0, defaultHybridization: 'sp3d2' },
  Os: { valenceElectrons: 8, maxBonds: 12, defaultValence: 0, defaultHybridization: 'sp3d2' },
  Ir: { valenceElectrons: 9, maxBonds: 12, defaultValence: 0, defaultHybridization: 'sp3d2' },
  Pt: { valenceElectrons: 10, maxBonds: 12, defaultValence: 0, defaultHybridization: 'sp3d2' },
  Au: { valenceElectrons: 11, maxBonds: 12, defaultValence: 0, defaultHybridization: 'sp3d2' },
  Hg: { valenceElectrons: 12, maxBonds: 12, defaultValence: 0, defaultHybridization: 'sp3d2' },
  Rf: { valenceElectrons: 4, maxBonds: 12, defaultValence: 0, defaultHybridization: 'sp3d2' },
  Db: { valenceElectrons: 5, maxBonds: 12, defaultValence: 0, defaultHybridization: 'sp3d2' },
  Sg: { valenceElectrons: 6, maxBonds: 12, defaultValence: 0, defaultHybridization: 'sp3d2' },
  Bh: { valenceElectrons: 7, maxBonds: 12, defaultValence: 0, defaultHybridization: 'sp3d2' },
  Hs: { valenceElectrons: 8, maxBonds: 12, defaultValence: 0, defaultHybridization: 'sp3d2' },
  Mt: { valenceElectrons: 9, maxBonds: 12, defaultValence: 0, defaultHybridization: 'sp3d2' },
  Ds: { valenceElectrons: 10, maxBonds: 12, defaultValence: 0, defaultHybridization: 'sp3d2' },
  Rg: { valenceElectrons: 11, maxBonds: 12, defaultValence: 0, defaultHybridization: 'sp3d2' },
  Cn: { valenceElectrons: 12, maxBonds: 12, defaultValence: 0, defaultHybridization: 'sp3d2' },
  Br: { valenceElectrons: 7, maxBonds: 1, defaultHybridization: 'sp3' },
  I: { valenceElectrons: 7, maxBonds: 1, defaultHybridization: 'sp3' },
}

export function getElementEditingDefaults(symbol: string): Readonly<ElementEditingDefaults> {
  return (Object.hasOwn(ELEMENT_EDITING_DEFAULTS, symbol)
    ? ELEMENT_EDITING_DEFAULTS[symbol as ConfiguredElementSymbol] : undefined) ?? {
    valenceElectrons: 4, maxBonds: 4, defaultHybridization: 'sp3',
  }
}

/**
 * 有效成键数：电荷/自由基对价态的修正。中性且无自由基时严格 == maxBonds
 * （不改变任何已有分子的行为）。
 *
 * 规则：
 *  - 有孤对电子的元素（价电子 > maxBonds，如 N/O/卤素）：正电荷 +q（用一对孤对
 *    成键，NH₃→NH₄⁺）、负电荷 −|q|（多一对孤对，H₂O→OH⁻）
 *  - 缺电子/无余电子元素（价电子 <= maxBonds，如 B/Al/C/Si/H）：
 *    · 阳离子：每失一个电子少一个成键位（CH₄ 设 +1 → CH₃⁺）
 *    · 阴离子（仅主族 maxBonds <= 4 的元素走此支）：按轨道占据算——每得一个
 *      电子先填一个空轨道【增加】一个成键位（B⁻→4，BH₄⁻/硼酸酯），轨道半满
 *      （电子数 == 杂化轨道数 4，H/He 为 1）后再得的电子成孤对【减少】成键位
 *      （C⁻→3，CH₃⁻）；即 min(电子数, 2×轨道数 − 电子数)，天然封顶于轨道数
 *    · 超价/过渡金属（maxBonds > 4）阴离子不套轨道模型，维持 −|q| 旧语义
 *  - 每个未配对电子（自由基）占一个价位
 */
export function effectiveMaxBonds(symbol: string, charge = 0, radical = 0): number {
  const el = getElementEditingDefaults(symbol)
  const hasLonePair = el.valenceElectrons > el.maxBonds
  let bonds: number
  if (hasLonePair) {
    bonds = el.maxBonds + charge
  } else if (charge < 0 && el.maxBonds <= 4) {
    const { atomicNumber } = getElementData(symbol)
    const orbitals = atomicNumber >= 1 && atomicNumber <= 2 ? 1 : 4
    const electrons = el.valenceElectrons - charge
    bonds = Math.min(electrons, 2 * orbitals - electrons)
  } else {
    bonds = el.maxBonds - Math.abs(charge)
  }
  return Math.max(0, bonds - Math.abs(radical))
}
