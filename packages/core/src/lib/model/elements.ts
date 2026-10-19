/** Element reference data. Values are retained from the existing RetainMol table. */
export interface ElementData {
  readonly symbol: string
  readonly name: string
  readonly atomicNumber: number
  readonly atomicMass: number | null
  /** Reference covalent radius in angstroms; not the rendered sphere size. */
  readonly covalentRadius: number
  /** Reference radius used by space-fill display, before visual scaling. */
  readonly cpkRadius: number
  readonly category: 'nonmetal' | 'noble-gas' | 'alkali' | 'alkaline-earth' | 'transition' | 'post-transition' | 'metalloid' | 'halogen' | 'lanthanide' | 'actinide'
}

export const ELEMENT_DATA = {
  H: { symbol: 'H', name: '氢', atomicNumber: 1, atomicMass: 1.008, covalentRadius: 0.31, cpkRadius: 1.20, category: 'nonmetal' },
  He: { symbol: 'He', name: '氦', atomicNumber: 2, atomicMass: 4.003, covalentRadius: 0.28, cpkRadius: 1.40, category: 'noble-gas' },
  Li: { symbol: 'Li', name: '锂', atomicNumber: 3, atomicMass: 6.941, covalentRadius: 1.28, cpkRadius: 1.82, category: 'alkali' },
  Be: { symbol: 'Be', name: '铍', atomicNumber: 4, atomicMass: 9.012, covalentRadius: 0.96, cpkRadius: 1.53, category: 'alkaline-earth' },
  B: { symbol: 'B', name: '硼', atomicNumber: 5, atomicMass: 10.811, covalentRadius: 0.84, cpkRadius: 1.92, category: 'metalloid' },
  C: { symbol: 'C', name: '碳', atomicNumber: 6, atomicMass: 12.011, covalentRadius: 0.77, cpkRadius: 1.70, category: 'nonmetal' },
  N: { symbol: 'N', name: '氮', atomicNumber: 7, atomicMass: 14.007, covalentRadius: 0.75, cpkRadius: 1.55, category: 'nonmetal' },
  O: { symbol: 'O', name: '氧', atomicNumber: 8, atomicMass: 15.999, covalentRadius: 0.73, cpkRadius: 1.52, category: 'nonmetal' },
  F: { symbol: 'F', name: '氟', atomicNumber: 9, atomicMass: 18.998, covalentRadius: 0.71, cpkRadius: 1.47, category: 'halogen' },
  Ne: { symbol: 'Ne', name: '氖', atomicNumber: 10, atomicMass: 20.180, covalentRadius: 0.69, cpkRadius: 1.54, category: 'noble-gas' },
  Na: { symbol: 'Na', name: '钠', atomicNumber: 11, atomicMass: 22.990, covalentRadius: 1.66, cpkRadius: 2.27, category: 'alkali' },
  Mg: { symbol: 'Mg', name: '镁', atomicNumber: 12, atomicMass: 24.305, covalentRadius: 1.41, cpkRadius: 1.73, category: 'alkaline-earth' },
  Al: { symbol: 'Al', name: '铝', atomicNumber: 13, atomicMass: 26.982, covalentRadius: 1.21, cpkRadius: 1.84, category: 'post-transition' },
  Si: { symbol: 'Si', name: '硅', atomicNumber: 14, atomicMass: 28.086, covalentRadius: 1.11, cpkRadius: 2.10, category: 'metalloid' },
  P: { symbol: 'P', name: '磷', atomicNumber: 15, atomicMass: 30.974, covalentRadius: 1.07, cpkRadius: 1.80, category: 'nonmetal' },
  S: { symbol: 'S', name: '硫', atomicNumber: 16, atomicMass: 32.065, covalentRadius: 1.05, cpkRadius: 1.80, category: 'nonmetal' },
  Cl: { symbol: 'Cl', name: '氯', atomicNumber: 17, atomicMass: 35.453, covalentRadius: 1.02, cpkRadius: 1.75, category: 'halogen' },
  Ar: { symbol: 'Ar', name: '氩', atomicNumber: 18, atomicMass: 39.948, covalentRadius: 0.97, cpkRadius: 1.88, category: 'noble-gas' },
  K: { symbol: 'K', name: '钾', atomicNumber: 19, atomicMass: 39.098, covalentRadius: 2.03, cpkRadius: 2.75, category: 'alkali' },
  Ca: { symbol: 'Ca', name: '钙', atomicNumber: 20, atomicMass: 40.078, covalentRadius: 1.76, cpkRadius: 2.31, category: 'alkaline-earth' },
  Sc: { symbol: 'Sc', name: '钪', atomicNumber: 21, atomicMass: 44.956, covalentRadius: 1.70, cpkRadius: 2.30, category: 'transition' },
  Ti: { symbol: 'Ti', name: '钛', atomicNumber: 22, atomicMass: 47.867, covalentRadius: 1.60, cpkRadius: 2.15, category: 'transition' },
  V: { symbol: 'V', name: '钒', atomicNumber: 23, atomicMass: 50.942, covalentRadius: 1.53, cpkRadius: 2.05, category: 'transition' },
  Cr: { symbol: 'Cr', name: '铬', atomicNumber: 24, atomicMass: 51.996, covalentRadius: 1.39, cpkRadius: 2.05, category: 'transition' },
  Mn: { symbol: 'Mn', name: '锰', atomicNumber: 25, atomicMass: 54.938, covalentRadius: 1.39, cpkRadius: 2.05, category: 'transition' },
  Fe: { symbol: 'Fe', name: '铁', atomicNumber: 26, atomicMass: 55.845, covalentRadius: 1.52, cpkRadius: 2.00, category: 'transition' },
  Co: { symbol: 'Co', name: '钴', atomicNumber: 27, atomicMass: 58.933, covalentRadius: 1.50, cpkRadius: 2.00, category: 'transition' },
  Ni: { symbol: 'Ni', name: '镍', atomicNumber: 28, atomicMass: 58.693, covalentRadius: 1.24, cpkRadius: 1.63, category: 'transition' },
  Cu: { symbol: 'Cu', name: '铜', atomicNumber: 29, atomicMass: 63.546, covalentRadius: 1.32, cpkRadius: 1.40, category: 'transition' },
  Zn: { symbol: 'Zn', name: '锌', atomicNumber: 30, atomicMass: 65.380, covalentRadius: 1.22, cpkRadius: 1.39, category: 'transition' },
  Y: { symbol: 'Y', name: '钇', atomicNumber: 39, atomicMass: 88.906, covalentRadius: 1.90, cpkRadius: 2.40, category: 'transition' },
  Zr: { symbol: 'Zr', name: '锆', atomicNumber: 40, atomicMass: 91.224, covalentRadius: 1.75, cpkRadius: 2.30, category: 'transition' },
  Nb: { symbol: 'Nb', name: '铌', atomicNumber: 41, atomicMass: 92.906, covalentRadius: 1.64, cpkRadius: 2.15, category: 'transition' },
  Mo: { symbol: 'Mo', name: '钼', atomicNumber: 42, atomicMass: 95.95, covalentRadius: 1.54, cpkRadius: 2.10, category: 'transition' },
  Tc: { symbol: 'Tc', name: '锝', atomicNumber: 43, atomicMass: 98, covalentRadius: 1.47, cpkRadius: 2.05, category: 'transition' },
  Ru: { symbol: 'Ru', name: '钌', atomicNumber: 44, atomicMass: 101.07, covalentRadius: 1.46, cpkRadius: 2.05, category: 'transition' },
  Rh: { symbol: 'Rh', name: '铑', atomicNumber: 45, atomicMass: 102.906, covalentRadius: 1.42, cpkRadius: 2.00, category: 'transition' },
  Pd: { symbol: 'Pd', name: '钯', atomicNumber: 46, atomicMass: 106.42, covalentRadius: 1.39, cpkRadius: 2.05, category: 'transition' },
  Ag: { symbol: 'Ag', name: '银', atomicNumber: 47, atomicMass: 107.868, covalentRadius: 1.45, cpkRadius: 2.10, category: 'transition' },
  Cd: { symbol: 'Cd', name: '镉', atomicNumber: 48, atomicMass: 112.414, covalentRadius: 1.44, cpkRadius: 2.20, category: 'transition' },
  Hf: { symbol: 'Hf', name: '铪', atomicNumber: 72, atomicMass: 178.49, covalentRadius: 1.75, cpkRadius: 2.25, category: 'transition' },
  Ta: { symbol: 'Ta', name: '钽', atomicNumber: 73, atomicMass: 180.948, covalentRadius: 1.70, cpkRadius: 2.20, category: 'transition' },
  W: { symbol: 'W', name: '钨', atomicNumber: 74, atomicMass: 183.84, covalentRadius: 1.62, cpkRadius: 2.10, category: 'transition' },
  Re: { symbol: 'Re', name: '铼', atomicNumber: 75, atomicMass: 186.207, covalentRadius: 1.51, cpkRadius: 2.05, category: 'transition' },
  Os: { symbol: 'Os', name: '锇', atomicNumber: 76, atomicMass: 190.23, covalentRadius: 1.44, cpkRadius: 2.00, category: 'transition' },
  Ir: { symbol: 'Ir', name: '铱', atomicNumber: 77, atomicMass: 192.217, covalentRadius: 1.41, cpkRadius: 2.00, category: 'transition' },
  Pt: { symbol: 'Pt', name: '铂', atomicNumber: 78, atomicMass: 195.084, covalentRadius: 1.36, cpkRadius: 2.05, category: 'transition' },
  Au: { symbol: 'Au', name: '金', atomicNumber: 79, atomicMass: 196.967, covalentRadius: 1.36, cpkRadius: 2.10, category: 'transition' },
  Hg: { symbol: 'Hg', name: '汞', atomicNumber: 80, atomicMass: 200.592, covalentRadius: 1.32, cpkRadius: 2.05, category: 'transition' },
  Rf: { symbol: 'Rf', name: '𬬻', atomicNumber: 104, atomicMass: 267, covalentRadius: 1.57, cpkRadius: 2.30, category: 'transition' },
  Db: { symbol: 'Db', name: '𬭊', atomicNumber: 105, atomicMass: 268, covalentRadius: 1.49, cpkRadius: 2.20, category: 'transition' },
  Sg: { symbol: 'Sg', name: '𬭳', atomicNumber: 106, atomicMass: 269, covalentRadius: 1.43, cpkRadius: 2.10, category: 'transition' },
  Bh: { symbol: 'Bh', name: '𬭛', atomicNumber: 107, atomicMass: 270, covalentRadius: 1.41, cpkRadius: 2.05, category: 'transition' },
  Hs: { symbol: 'Hs', name: '𬭶', atomicNumber: 108, atomicMass: 269, covalentRadius: 1.34, cpkRadius: 2.00, category: 'transition' },
  Mt: { symbol: 'Mt', name: '鿏', atomicNumber: 109, atomicMass: 278, covalentRadius: 1.29, cpkRadius: 2.00, category: 'transition' },
  Ds: { symbol: 'Ds', name: '𫟼', atomicNumber: 110, atomicMass: 281, covalentRadius: 1.28, cpkRadius: 2.00, category: 'transition' },
  Rg: { symbol: 'Rg', name: '𬬭', atomicNumber: 111, atomicMass: 282, covalentRadius: 1.21, cpkRadius: 2.00, category: 'transition' },
  Cn: { symbol: 'Cn', name: '鿔', atomicNumber: 112, atomicMass: 285, covalentRadius: 1.22, cpkRadius: 2.00, category: 'transition' },
  Br: { symbol: 'Br', name: '溴', atomicNumber: 35, atomicMass: 79.904, covalentRadius: 1.14, cpkRadius: 1.85, category: 'halogen' },
  I: { symbol: 'I', name: '碘', atomicNumber: 53, atomicMass: 126.904, covalentRadius: 1.33, cpkRadius: 1.98, category: 'halogen' },
} as const satisfies Readonly<Record<string, ElementData>>

export type ConfiguredElementSymbol = keyof typeof ELEMENT_DATA

/** Unknown symbols must remain distinguishable from configured elements. */
export function findElementData(symbol: string): Readonly<ElementData> | undefined {
  return Object.hasOwn(ELEMENT_DATA, symbol) ? ELEMENT_DATA[symbol as ConfiguredElementSymbol] : undefined
}

/** Legacy numeric fallback for geometric/display callers; not an element validator. */
export function getElementData(symbol: string): Readonly<ElementData> {
  return findElementData(symbol) ?? {
    symbol, name: symbol, atomicNumber: 0, atomicMass: null,
    covalentRadius: 0.9, cpkRadius: 1.5, category: 'nonmetal',
  }
}
