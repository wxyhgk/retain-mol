/**
 * 元素化学属性配置
 * 包含：共价半径、价电子数、最大键数、杂化偏好、CPK颜色、标准原子量
 */

export type Hybridization = 'sp' | 'sp2' | 'sp3' | 'sp3d' | 'sp3d2' | 'none'

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
  Sc: { symbol:'Sc', name:'钪', atomicNumber:21, atomicMass:44.956, covalentRadius:1.70, cpkRadius:2.30, valenceElectrons:3, maxBonds:12, defaultValence:0, defaultHybridization:'sp3d2', color:0xe6e6e6, category:'transition' },
  Ti: { symbol:'Ti', name:'钛', atomicNumber:22, atomicMass:47.867, covalentRadius:1.60, cpkRadius:2.15, valenceElectrons:4, maxBonds:12, defaultValence:0, defaultHybridization:'sp3d2', color:0xbfc2c7, category:'transition' },
  V:  { symbol:'V',  name:'钒', atomicNumber:23, atomicMass:50.942, covalentRadius:1.53, cpkRadius:2.05, valenceElectrons:5, maxBonds:12, defaultValence:0, defaultHybridization:'sp3d2', color:0xa6a6ab, category:'transition' },
  Cr: { symbol:'Cr', name:'铬', atomicNumber:24, atomicMass:51.996, covalentRadius:1.39, cpkRadius:2.05, valenceElectrons:6, maxBonds:12, defaultValence:0, defaultHybridization:'sp3d2', color:0x8a99c7, category:'transition' },
  Mn: { symbol:'Mn', name:'锰', atomicNumber:25, atomicMass:54.938, covalentRadius:1.39, cpkRadius:2.05, valenceElectrons:7, maxBonds:12, defaultValence:0, defaultHybridization:'sp3d2', color:0x9c7ac7, category:'transition' },
  Fe: { symbol:'Fe', name:'铁', atomicNumber:26, atomicMass:55.845, covalentRadius:1.52, cpkRadius:2.00, valenceElectrons:8, maxBonds:12, defaultValence:0, defaultHybridization:'sp3d2', color:0xe06633, category:'transition' },
  Co: { symbol:'Co', name:'钴', atomicNumber:27, atomicMass:58.933, covalentRadius:1.50, cpkRadius:2.00, valenceElectrons:9, maxBonds:12, defaultValence:0, defaultHybridization:'sp3d2', color:0xf090a0, category:'transition' },
  Ni: { symbol:'Ni', name:'镍', atomicNumber:28, atomicMass:58.693, covalentRadius:1.24, cpkRadius:1.63, valenceElectrons:10, maxBonds:12, defaultValence:0, defaultHybridization:'sp3d2', color:0x50d050, category:'transition' },
  Cu: { symbol:'Cu', name:'铜', atomicNumber:29, atomicMass:63.546, covalentRadius:1.32, cpkRadius:1.40, valenceElectrons:11, maxBonds:12, defaultValence:0, defaultHybridization:'sp3d2', color:0xc88033, category:'transition' },
  Zn: { symbol:'Zn', name:'锌', atomicNumber:30, atomicMass:65.380, covalentRadius:1.22, cpkRadius:1.39, valenceElectrons:12, maxBonds:12, defaultValence:0, defaultHybridization:'sp3d2', color:0x7d80b0, category:'transition' },
  Y:  { symbol:'Y',  name:'钇', atomicNumber:39, atomicMass:88.906, covalentRadius:1.90, cpkRadius:2.40, valenceElectrons:3, maxBonds:12, defaultValence:0, defaultHybridization:'sp3d2', color:0x94ffff, category:'transition' },
  Zr: { symbol:'Zr', name:'锆', atomicNumber:40, atomicMass:91.224, covalentRadius:1.75, cpkRadius:2.30, valenceElectrons:4, maxBonds:12, defaultValence:0, defaultHybridization:'sp3d2', color:0x94e0e0, category:'transition' },
  Nb: { symbol:'Nb', name:'铌', atomicNumber:41, atomicMass:92.906, covalentRadius:1.64, cpkRadius:2.15, valenceElectrons:5, maxBonds:12, defaultValence:0, defaultHybridization:'sp3d2', color:0x73c2c9, category:'transition' },
  Mo: { symbol:'Mo', name:'钼', atomicNumber:42, atomicMass:95.95, covalentRadius:1.54, cpkRadius:2.10, valenceElectrons:6, maxBonds:12, defaultValence:0, defaultHybridization:'sp3d2', color:0x54b5b5, category:'transition' },
  Tc: { symbol:'Tc', name:'锝', atomicNumber:43, atomicMass:98, covalentRadius:1.47, cpkRadius:2.05, valenceElectrons:7, maxBonds:12, defaultValence:0, defaultHybridization:'sp3d2', color:0x3b9e9e, category:'transition' },
  Ru: { symbol:'Ru', name:'钌', atomicNumber:44, atomicMass:101.07, covalentRadius:1.46, cpkRadius:2.05, valenceElectrons:8, maxBonds:12, defaultValence:0, defaultHybridization:'sp3d2', color:0x248f8f, category:'transition' },
  Rh: { symbol:'Rh', name:'铑', atomicNumber:45, atomicMass:102.906, covalentRadius:1.42, cpkRadius:2.00, valenceElectrons:9, maxBonds:12, defaultValence:0, defaultHybridization:'sp3d2', color:0x0a7d8c, category:'transition' },
  Pd: { symbol:'Pd', name:'钯', atomicNumber:46, atomicMass:106.42, covalentRadius:1.39, cpkRadius:2.05, valenceElectrons:10, maxBonds:12, defaultValence:0, defaultHybridization:'sp3d2', color:0x006985, category:'transition' },
  Ag: { symbol:'Ag', name:'银', atomicNumber:47, atomicMass:107.868, covalentRadius:1.45, cpkRadius:2.10, valenceElectrons:11, maxBonds:12, defaultValence:0, defaultHybridization:'sp3d2', color:0xc0c0c0, category:'transition' },
  Cd: { symbol:'Cd', name:'镉', atomicNumber:48, atomicMass:112.414, covalentRadius:1.44, cpkRadius:2.20, valenceElectrons:12, maxBonds:12, defaultValence:0, defaultHybridization:'sp3d2', color:0xffd98f, category:'transition' },
  Hf: { symbol:'Hf', name:'铪', atomicNumber:72, atomicMass:178.49, covalentRadius:1.75, cpkRadius:2.25, valenceElectrons:4, maxBonds:12, defaultValence:0, defaultHybridization:'sp3d2', color:0x4dc2ff, category:'transition' },
  Ta: { symbol:'Ta', name:'钽', atomicNumber:73, atomicMass:180.948, covalentRadius:1.70, cpkRadius:2.20, valenceElectrons:5, maxBonds:12, defaultValence:0, defaultHybridization:'sp3d2', color:0x4da6ff, category:'transition' },
  W:  { symbol:'W',  name:'钨', atomicNumber:74, atomicMass:183.84, covalentRadius:1.62, cpkRadius:2.10, valenceElectrons:6, maxBonds:12, defaultValence:0, defaultHybridization:'sp3d2', color:0x2194d6, category:'transition' },
  Re: { symbol:'Re', name:'铼', atomicNumber:75, atomicMass:186.207, covalentRadius:1.51, cpkRadius:2.05, valenceElectrons:7, maxBonds:12, defaultValence:0, defaultHybridization:'sp3d2', color:0x267dab, category:'transition' },
  Os: { symbol:'Os', name:'锇', atomicNumber:76, atomicMass:190.23, covalentRadius:1.44, cpkRadius:2.00, valenceElectrons:8, maxBonds:12, defaultValence:0, defaultHybridization:'sp3d2', color:0x266696, category:'transition' },
  Ir: { symbol:'Ir', name:'铱', atomicNumber:77, atomicMass:192.217, covalentRadius:1.41, cpkRadius:2.00, valenceElectrons:9, maxBonds:12, defaultValence:0, defaultHybridization:'sp3d2', color:0x175487, category:'transition' },
  Pt: { symbol:'Pt', name:'铂', atomicNumber:78, atomicMass:195.084, covalentRadius:1.36, cpkRadius:2.05, valenceElectrons:10, maxBonds:12, defaultValence:0, defaultHybridization:'sp3d2', color:0xd0d0e0, category:'transition' },
  Au: { symbol:'Au', name:'金', atomicNumber:79, atomicMass:196.967, covalentRadius:1.36, cpkRadius:2.10, valenceElectrons:11, maxBonds:12, defaultValence:0, defaultHybridization:'sp3d2', color:0xffd123, category:'transition' },
  Hg: { symbol:'Hg', name:'汞', atomicNumber:80, atomicMass:200.592, covalentRadius:1.32, cpkRadius:2.05, valenceElectrons:12, maxBonds:12, defaultValence:0, defaultHybridization:'sp3d2', color:0xb8b8d0, category:'transition' },
  Rf: { symbol:'Rf', name:'𬬻', atomicNumber:104, atomicMass:267, covalentRadius:1.57, cpkRadius:2.30, valenceElectrons:4, maxBonds:12, defaultValence:0, defaultHybridization:'sp3d2', color:0xcc0059, category:'transition' },
  Db: { symbol:'Db', name:'𬭊', atomicNumber:105, atomicMass:268, covalentRadius:1.49, cpkRadius:2.20, valenceElectrons:5, maxBonds:12, defaultValence:0, defaultHybridization:'sp3d2', color:0xd1004f, category:'transition' },
  Sg: { symbol:'Sg', name:'𬭳', atomicNumber:106, atomicMass:269, covalentRadius:1.43, cpkRadius:2.10, valenceElectrons:6, maxBonds:12, defaultValence:0, defaultHybridization:'sp3d2', color:0xd90045, category:'transition' },
  Bh: { symbol:'Bh', name:'𬭛', atomicNumber:107, atomicMass:270, covalentRadius:1.41, cpkRadius:2.05, valenceElectrons:7, maxBonds:12, defaultValence:0, defaultHybridization:'sp3d2', color:0xe00038, category:'transition' },
  Hs: { symbol:'Hs', name:'𬭶', atomicNumber:108, atomicMass:269, covalentRadius:1.34, cpkRadius:2.00, valenceElectrons:8, maxBonds:12, defaultValence:0, defaultHybridization:'sp3d2', color:0xe6002e, category:'transition' },
  Mt: { symbol:'Mt', name:'鿏', atomicNumber:109, atomicMass:278, covalentRadius:1.29, cpkRadius:2.00, valenceElectrons:9, maxBonds:12, defaultValence:0, defaultHybridization:'sp3d2', color:0xeb0026, category:'transition' },
  Ds: { symbol:'Ds', name:'𫟼', atomicNumber:110, atomicMass:281, covalentRadius:1.28, cpkRadius:2.00, valenceElectrons:10, maxBonds:12, defaultValence:0, defaultHybridization:'sp3d2', color:0xf0001c, category:'transition' },
  Rg: { symbol:'Rg', name:'𬬭', atomicNumber:111, atomicMass:282, covalentRadius:1.21, cpkRadius:2.00, valenceElectrons:11, maxBonds:12, defaultValence:0, defaultHybridization:'sp3d2', color:0xf50012, category:'transition' },
  Cn: { symbol:'Cn', name:'鿔', atomicNumber:112, atomicMass:285, covalentRadius:1.22, cpkRadius:2.00, valenceElectrons:12, maxBonds:12, defaultValence:0, defaultHybridization:'sp3d2', color:0xfa0008, category:'transition' },
  Br: { symbol:'Br', name:'溴',  atomicNumber:35, atomicMass:79.904,  covalentRadius:1.14, cpkRadius:1.85, valenceElectrons:7,  maxBonds:1, defaultHybridization:'sp3', color:0xa62929, category:'halogen' },
  I:  { symbol:'I',  name:'碘',  atomicNumber:53, atomicMass:126.904, covalentRadius:1.33, cpkRadius:1.98, valenceElectrons:7,  maxBonds:1, defaultHybridization:'sp3', color:0x940094, category:'halogen' },
}

export const ELEMENT_CONFIGS = E

export function getElementConfig(symbol: string): ElementConfig {
  return E[symbol] ?? {
    symbol, name: symbol, atomicNumber: 0, atomicMass: null,
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
