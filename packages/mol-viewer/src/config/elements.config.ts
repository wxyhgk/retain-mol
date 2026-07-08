/**
 * 元素化学属性配置
 * 包含：共价半径、价电子数、最大键数、杂化偏好、CPK颜色、标准原子量
 */

export type Hybridization = 'sp' | 'sp2' | 'sp3' | 'sp3d' | 'sp3d2' | 'none'

export interface ElementConfig {
  symbol: string
  name: string
  atomicNumber: number
  atomicMass: number
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

const E: Record<string, ElementConfig> = {
  H:  { symbol:'H',  name:'氢',  atomicNumber:1,  atomicMass:1.008,   covalentRadius:0.31, cpkRadius:1.20, valenceElectrons:1,  maxBonds:1, defaultHybridization:'sp3', color:0x888888, category:'nonmetal' },
  He: { symbol:'He', name:'氦',  atomicNumber:2,  atomicMass:4.003,   covalentRadius:0.28, cpkRadius:1.40, valenceElectrons:2,  maxBonds:0, defaultHybridization:'none', color:0x60c8c8, category:'noble-gas' },
  Li: { symbol:'Li', name:'锂',  atomicNumber:3,  atomicMass:6.941,   covalentRadius:1.28, cpkRadius:1.82, valenceElectrons:1,  maxBonds:1, defaultHybridization:'sp3', color:0xcc80ff, category:'alkali' },
  Be: { symbol:'Be', name:'铍',  atomicNumber:4,  atomicMass:9.012,   covalentRadius:0.96, cpkRadius:1.53, valenceElectrons:2,  maxBonds:2, defaultHybridization:'sp',  color:0xc2ff00, category:'alkaline-earth' },
  B:  { symbol:'B',  name:'硼',  atomicNumber:5,  atomicMass:10.811,  covalentRadius:0.84, cpkRadius:1.92, valenceElectrons:3,  maxBonds:3, defaultHybridization:'sp2', color:0xffb5b5, category:'metalloid' },
  C:  { symbol:'C',  name:'碳',  atomicNumber:6,  atomicMass:12.011,  covalentRadius:0.77, cpkRadius:1.70, valenceElectrons:4,  maxBonds:4, defaultHybridization:'sp3', color:0x404040, category:'nonmetal' },
  N:  { symbol:'N',  name:'氮',  atomicNumber:7,  atomicMass:14.007,  covalentRadius:0.75, cpkRadius:1.55, valenceElectrons:5,  maxBonds:3, defaultHybridization:'sp3', color:0x3050f8, category:'nonmetal' },
  O:  { symbol:'O',  name:'氧',  atomicNumber:8,  atomicMass:15.999,  covalentRadius:0.73, cpkRadius:1.52, valenceElectrons:6,  maxBonds:2, defaultHybridization:'sp3', color:0xff2020, category:'nonmetal' },
  F:  { symbol:'F',  name:'氟',  atomicNumber:9,  atomicMass:18.998,  covalentRadius:0.71, cpkRadius:1.47, valenceElectrons:7,  maxBonds:1, defaultHybridization:'sp3', color:0x90e050, category:'halogen' },
  Ne: { symbol:'Ne', name:'氖',  atomicNumber:10, atomicMass:20.180,  covalentRadius:0.69, cpkRadius:1.54, valenceElectrons:8,  maxBonds:0, defaultHybridization:'none', color:0x80c8e0, category:'noble-gas' },
  Na: { symbol:'Na', name:'钠',  atomicNumber:11, atomicMass:22.990,  covalentRadius:1.66, cpkRadius:2.27, valenceElectrons:1,  maxBonds:1, defaultHybridization:'sp3', color:0xab5cf2, category:'alkali' },
  Mg: { symbol:'Mg', name:'镁',  atomicNumber:12, atomicMass:24.305,  covalentRadius:1.41, cpkRadius:1.73, valenceElectrons:2,  maxBonds:2, defaultHybridization:'sp3', color:0x8aff00, category:'alkaline-earth' },
  Al: { symbol:'Al', name:'铝',  atomicNumber:13, atomicMass:26.982,  covalentRadius:1.21, cpkRadius:1.84, valenceElectrons:3,  maxBonds:3, defaultHybridization:'sp3', color:0xbfa6a6, category:'post-transition' },
  Si: { symbol:'Si', name:'硅',  atomicNumber:14, atomicMass:28.086,  covalentRadius:1.11, cpkRadius:2.10, valenceElectrons:4,  maxBonds:4, defaultHybridization:'sp3', color:0xf0c8a0, category:'metalloid' },
  P:  { symbol:'P',  name:'磷',  atomicNumber:15, atomicMass:30.974,  covalentRadius:1.07, cpkRadius:1.80, valenceElectrons:5,  maxBonds:5, defaultValence:3, defaultHybridization:'sp3', color:0xff8000, category:'nonmetal' },
  S:  { symbol:'S',  name:'硫',  atomicNumber:16, atomicMass:32.065,  covalentRadius:1.05, cpkRadius:1.80, valenceElectrons:6,  maxBonds:6, defaultValence:2, defaultHybridization:'sp3', color:0xd0d000, category:'nonmetal' },
  Cl: { symbol:'Cl', name:'氯',  atomicNumber:17, atomicMass:35.453,  covalentRadius:1.02, cpkRadius:1.75, valenceElectrons:7,  maxBonds:1, defaultHybridization:'sp3', color:0x1ff01f, category:'halogen' },
  Ar: { symbol:'Ar', name:'氩',  atomicNumber:18, atomicMass:39.948,  covalentRadius:0.97, cpkRadius:1.88, valenceElectrons:8,  maxBonds:0, defaultHybridization:'none', color:0x80d1e3, category:'noble-gas' },
  K:  { symbol:'K',  name:'钾',  atomicNumber:19, atomicMass:39.098,  covalentRadius:2.03, cpkRadius:2.75, valenceElectrons:1,  maxBonds:1, defaultHybridization:'sp3', color:0x8f40d4, category:'alkali' },
  Ca: { symbol:'Ca', name:'钙',  atomicNumber:20, atomicMass:40.078,  covalentRadius:1.76, cpkRadius:2.31, valenceElectrons:2,  maxBonds:2, defaultHybridization:'sp3', color:0x3dff00, category:'alkaline-earth' },
  Fe: { symbol:'Fe', name:'铁',  atomicNumber:26, atomicMass:55.845,  covalentRadius:1.52, cpkRadius:2.00, valenceElectrons:8,  maxBonds:6, defaultHybridization:'sp3d2', color:0xe06633, category:'transition' },
  Co: { symbol:'Co', name:'钴',  atomicNumber:27, atomicMass:58.933,  covalentRadius:1.50, cpkRadius:2.00, valenceElectrons:9,  maxBonds:6, defaultHybridization:'sp3d2', color:0xf090a0, category:'transition' },
  Ni: { symbol:'Ni', name:'镍',  atomicNumber:28, atomicMass:58.693,  covalentRadius:1.24, cpkRadius:1.63, valenceElectrons:10, maxBonds:6, defaultHybridization:'sp3d2', color:0x50d050, category:'transition' },
  Cu: { symbol:'Cu', name:'铜',  atomicNumber:29, atomicMass:63.546,  covalentRadius:1.32, cpkRadius:1.40, valenceElectrons:11, maxBonds:4, defaultHybridization:'sp3', color:0xc88033, category:'transition' },
  Zn: { symbol:'Zn', name:'锌',  atomicNumber:30, atomicMass:65.380,  covalentRadius:1.22, cpkRadius:1.39, valenceElectrons:12, maxBonds:4, defaultHybridization:'sp3', color:0x7d80b0, category:'transition' },
  Br: { symbol:'Br', name:'溴',  atomicNumber:35, atomicMass:79.904,  covalentRadius:1.14, cpkRadius:1.85, valenceElectrons:7,  maxBonds:1, defaultHybridization:'sp3', color:0xa62929, category:'halogen' },
  I:  { symbol:'I',  name:'碘',  atomicNumber:53, atomicMass:126.904, covalentRadius:1.33, cpkRadius:1.98, valenceElectrons:7,  maxBonds:1, defaultHybridization:'sp3', color:0x940094, category:'halogen' },
}

export const ELEMENT_CONFIGS = E

export function getElementConfig(symbol: string): ElementConfig {
  return E[symbol] ?? {
    symbol, name: symbol, atomicNumber: 0, atomicMass: 0,
    covalentRadius: 0.9, cpkRadius: 1.5,
    valenceElectrons: 4, maxBonds: 4,
    defaultHybridization: 'sp3', color: 0xff69b4, category: 'nonmetal',
  }
}

/**
 * 有效成键数：电荷/自由基对价态的修正。中性且无自由基时严格 == maxBonds
 * （不改变任何已有分子的行为）。
 *
 * 规则：
 *  - 有孤对电子的元素（价电子 > maxBonds，如 N/O/S/P）：正电荷 +q（用一对孤对
 *    成键，NH₃→NH₄⁺）、负电荷 −|q|（多一对孤对，H₂O→OH⁻）
 *  - 缺电子/无余电子元素（价电子 == maxBonds，如 C/B/H/Si）：±电荷都占用一个
 *    价位，−|q|（碳正/碳负离子都是 3 键）
 *  - 每个未配对电子（自由基）占一个价位
 * 注：硼负离子（BH₄⁻ 应为 4 键）等电子缺陷体系此启发式偏保守，非常见手搭场景。
 */
export function effectiveMaxBonds(symbol: string, charge = 0, radical = 0): number {
  const el = getElementConfig(symbol)
  const hasLonePair = el.valenceElectrons > el.maxBonds
  const chargeShift = hasLonePair ? charge : -Math.abs(charge)
  return Math.max(0, el.maxBonds + chargeShift - Math.abs(radical))
}

export const COMMON_ELEMENT_SYMBOLS = ['H', 'C', 'N', 'O', 'F', 'P', 'S', 'Cl', 'Br', 'I', 'Si', 'B', 'Fe', 'Na', 'Ca']

export const PERIODIC_TABLE_LAYOUT: string[][] = [
  ['H', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'He'],
  ['Li','Be','','','','','','','','','','','B', 'C', 'N', 'O', 'F', 'Ne'],
  ['Na','Mg','','','','','','','','','','','Al','Si','P', 'S', 'Cl','Ar'],
  ['K', 'Ca','Sc','Ti','V', 'Cr','Mn','Fe','Co','Ni','Cu','Zn','Ga','Ge','As','Se','Br','Kr'],
  ['Rb','Sr','Y', 'Zr','Nb','Mo','Tc','Ru','Rh','Pd','Ag','Cd','In','Sn','Sb','Te','I', 'Xe'],
  ['Cs','Ba','*', 'Hf','Ta','W', 'Re','Os','Ir','Pt','Au','Hg','Tl','Pb','Bi','Po','At','Rn'],
]
