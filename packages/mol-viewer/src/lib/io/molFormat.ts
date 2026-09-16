/**
 * MOL / SDF 格式解析与导出
 * 底层使用 OpenChemLib，自动处理 V2000 / V3000、各种非标准输出
 */

import * as OCL from 'openchemlib'
import type { Atom, Bond, Molecule } from '../molecule'
import { newAtom, newBond } from '../molecule'
import { splitConnectedComponents } from '../builder/analysis/fragments'
import { kekulizeAromaticBonds } from './kekulize'
import { RELAX } from '../../config/relax.config'

// OCL 返回的 Molecule 对象类型
type OCLMol = ReturnType<typeof OCL.Molecule.fromMolfile>
/** OCL 立体化学读写。OCL 版本间 API 名有差异，统一走具名断言 + 可选调用。 */
interface OCLStereoAccess {
  ensureHelperArrays?: (mask: number) => void
  getAtomParity?: (index: number) => number
  getAtomCIPParity?: (index: number) => number
  getBondCIPParity?: (index: number) => number
  setAtomParity?: (index: number, parity: number) => void
}

/**
 * OCL parity+CIP 双读 → R/S。parity 非零且 CIP 明确才认，
 * 其余一切（双楔打架/unknown/either/非立体中心）归 undefined，绝不蒙。
 * R/S↔parity 位映射由 L-乳酸锚点单测锁死（S↔parity2）。
 */
function readAtomChirality(access: OCLStereoAccess, index: number): 'R' | 'S' | undefined {
  const parity = access.getAtomParity?.(index) ?? OCL.Molecule.cAtomParityNone
  const specified =
    parity === OCL.Molecule.cAtomParity1 || parity === OCL.Molecule.cAtomParity2
  if (!specified) return undefined
  const cip = access.getAtomCIPParity?.(index) ?? OCL.Molecule.cAtomCIPParityNone
  if (cip === OCL.Molecule.cAtomCIPParityRorM) return 'R'
  if (cip === OCL.Molecule.cAtomCIPParitySorP) return 'S'
  return undefined
}

/** 双键 CIP 读 E/Z；读不到或非 E/Z 归 undefined。本期只读不写。 */
function readBondEz(access: OCLStereoAccess, index: number): 'E' | 'Z' | undefined {
  const cip = access.getBondCIPParity?.(index) ?? OCL.Molecule.cBondCIPParityNone
  if (cip === OCL.Molecule.cBondCIPParityEorP) return 'E'
  if (cip === OCL.Molecule.cBondCIPParityZorM) return 'Z'
  return undefined
}

/**
 * OCL 键向位 → wedge。OCL 无公开常量名：Up 位 256 / Down 位 128，
 * 窄端在 bond atom0（moleculeToOCL 按序写，往返测试锁死端点序）。
 * 只在端点确为立体中心时采信——单键上的 Up/Down 也可能是 E/Z 方向描述。
 */
const OCL_BOND_UP_BIT = 256
const OCL_BOND_DOWN_BIT = 128

function readBondWedge(bondType: number, hasParity: readonly boolean[], a1: number, a2: number): 'up' | 'down' | undefined {
  if (!hasParity[a1] && !hasParity[a2]) return undefined
  const up = (bondType & OCL_BOND_UP_BIT) !== 0
  const down = (bondType & OCL_BOND_DOWN_BIT) !== 0
  if (up === down) return undefined
  return up ? 'up' : 'down'
}
// ─── OCL ↔ 我们的 Molecule 互转 ──────────────────────────

function oclToMolecule(oclMol: OCLMol, fallbackName = 'Imported'): Molecule {
  // 手性与芳香都是 OCL 惰性辅助数组：先 ensure 再读，否则读到过期/空值
  const stereoAccess: OCLStereoAccess = oclMol as unknown as OCLStereoAccess
  stereoAccess.ensureHelperArrays?.(OCL.Molecule.cHelperParities)
  const atoms: Atom[] = []
  const hasParity: boolean[] = []
  const na = oclMol.getAllAtoms()
  for (let i = 0; i < na; i++) {
    // OCL 内部对 y 和 z 取反（toMolfile 写 -y/-z，fromMolfile 读时再次取反）。
    // 用 -getAtomY / -getAtomZ 还原为 SDF 文件中的原始坐标。
    const base = newAtom(
      oclMol.getAtomLabel(i),
       oclMol.getAtomX(i),
      -oclMol.getAtomY(i),
      -oclMol.getAtomZ(i),
    )
    const parity = stereoAccess.getAtomParity?.(i) ?? OCL.Molecule.cAtomParityNone
    hasParity.push(parity === OCL.Molecule.cAtomParity1 || parity === OCL.Molecule.cAtomParity2)
    const chirality = readAtomChirality(stereoAccess, i)
    atoms.push(chirality === undefined ? base : { ...base, chirality })
  }
  const bonds: Bond[] = []
  const nb = oclMol.getAllBonds()
  const isAromaticBondFn = (oclMol as unknown as { isAromaticBond?: (i: number) => boolean }).isAromaticBond?.bind(oclMol)
  for (let i = 0; i < nb; i++) {
    const a1 = oclMol.getBondAtom(0, i)
    const a2 = oclMol.getBondAtom(1, i)
    const bo = oclMol.getBondOrder(i)
    const order: 1 | 2 | 3 = bo === 2 ? 2 : bo === 3 ? 3 : 1
    const aromatic = isAromaticBondFn?.(i) === true || undefined
    const atom1 = atoms[a1]
    const atom2 = atoms[a2]
    if (atom1 === undefined || atom2 === undefined) continue
    // 键向位只在端点确为立体中心时才采信为 wedge——否则可能是 E/Z 方向描述。
    // 烯丙位手性中心兼 E/Z 描述的歧义个案暂不区分（见 readBondWedge 注释）。
    const ez = order === 2 ? readBondEz(stereoAccess, i) : undefined
    const wedge = order === 1 ? readBondWedge(oclMol.getBondType(i), hasParity, a1, a2) : undefined
    bonds.push({
      ...newBond(atom1.id, atom2.id, order, {
        ...(aromatic ? { aromatic: true } : {}),
        ...(ez === undefined ? {} : { ez }),
        ...(wedge === undefined ? {} : { wedge }),
      }),
    })
  }

  // OCL 在部分版本里可能有 getName()，没有则用首行兜底
  const oclName = (oclMol as unknown as { getName?: () => string }).getName?.()
  return { atoms, bonds, name: oclName || fallbackName }
}

export function moleculeToOCL(mol: Molecule): OCLMol {
  const oclMol = new OCL.Molecule(mol.atoms.length || 16, mol.bonds.length || 16)
  const idxMap = new Map<string, number>()
  const getAtomicNo = (OCL.Molecule as unknown as { getAtomicNoFromLabel(s: string): number }).getAtomicNoFromLabel
  const stereoAccess: OCLStereoAccess = oclMol as unknown as OCLStereoAccess
  for (const a of mol.atoms) {
    const atomicNo = getAtomicNo(a.symbol) || 6  // 未识别时退化为碳
    const idx = oclMol.addAtom(atomicNo)
    oclMol.setAtomX(idx, a.x)
    oclMol.setAtomY(idx, -a.y)   // OCL 导出时再次取反，补偿以写出正确值
    oclMol.setAtomZ(idx, -a.z)
    if (a.chirality === 'R' || a.chirality === 'S') {
      // R/S→parity 位与读端互逆（L-乳酸锚点单测锁死）；有 wedge 时 OCL 优先写存下的键向
      stereoAccess.setAtomParity?.(idx, a.chirality === 'R' ? OCL.Molecule.cAtomParity1 : OCL.Molecule.cAtomParity2)
    }
    idxMap.set(a.id, idx)
  }
  const BOND_TYPE: Record<1 | 2 | 3, number> = {
    1: OCL.Molecule.cBondTypeSingle,
    2: OCL.Molecule.cBondTypeDouble,
    3: OCL.Molecule.cBondTypeTriple,
  }
  // OCL 的 addBond 第三个参数会被忽略，要用 addOrChangeBond 才能设键级
  const addOrChangeBond = (oclMol as unknown as { addOrChangeBond(a: number, b: number, t: number): number }).addOrChangeBond
  for (const b of mol.bonds) {
    const a1 = idxMap.get(b.atomId1)
    const a2 = idxMap.get(b.atomId2)
    if (a1 === undefined || a2 === undefined) continue
    let bondType = BOND_TYPE[b.order]
    if (b.order === 1 && (b.wedge === 'up' || b.wedge === 'down')) {
      // 窄端在 atomId1（addOrChangeBond 保持端点序，往返测试锁死）
      bondType =
        OCL.Molecule.cBondTypeSingle |
        (b.wedge === 'up' ? OCL_BOND_UP_BIT : OCL_BOND_DOWN_BIT)
    }
    if (bondType === undefined) continue
    addOrChangeBond.call(oclMol, a1, a2, bondType)
  }
  const setName = (oclMol as unknown as { setName?: (n: string) => void }).setName
  if (mol.name && setName) setName.call(oclMol, mol.name)
  return oclMol
}

function formatV2000Coordinate(value: number): string {
  if (!Number.isFinite(value)) throw new Error('MOL 导出失败：坐标必须为有限数值')
  const formatted = value.toFixed(4)
  if (formatted.length > 10) throw new Error(`MOL V2000 坐标超出范围：${value}`)
  return formatted.padStart(10, ' ')
}

/**
 * OpenChemLib's V2000 writer normalizes short average bond lengths to its
 * preferred drawing scale. That is useful for 2D depictions but corrupts 3D
 * modeling coordinates and fixed-atom contracts. Keep OCL's atom/bond
 * serialization, then restore the authored coordinates in the atom block.
 */
function restoreV2000Coordinates(molfile: string, mol: Molecule): string {
  const lines = molfile.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n')
  const countsIndex = lines.findIndex(line => /\bV2000\b/i.test(line))
  if (countsIndex < 0) return molfile
  const atomCount = Number.parseInt(lines[countsIndex]?.slice(0, 3).trim() ?? '', 10)
  if (atomCount !== mol.atoms.length) {
    throw new Error(`MOL 导出失败：原子数不一致（${atomCount} != ${mol.atoms.length}）`)
  }
  for (let index = 0; index < atomCount; index += 1) {
    const lineIndex = countsIndex + 1 + index
    const line = lines[lineIndex]
    const atom = mol.atoms[index]
    if (line === undefined || atom === undefined || line.length < 30) {
      throw new Error(`MOL 导出失败：原子坐标行缺失（${index + 1}）`)
    }
    lines[lineIndex] =
      formatV2000Coordinate(atom.x) +
      formatV2000Coordinate(atom.y) +
      formatV2000Coordinate(atom.z) +
      line.slice(30)
  }
  return lines.join('\n')
}

// ─── 外部 API（保持与之前一致）─────────────────────────

/**
 * 规范化 MOL 文本：确保 counts 行（含 V2000/V3000 标记）位于第 4 行（index 3）。
 * 这样可以兼容：
 *  - OpenBabel 只输出 2 行头的非标准格式
 *  - SDF 分块后块首多余空行（$$$$\n 残留）
 */
function normalizeMolHeader(text: string): string {
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n')
  let countsIdx = -1
  for (let i = 0; i < Math.min(lines.length, 20); i++) {
    if (/\bV[23]000\b/i.test(lines[i] ?? '')) { countsIdx = i; break }
  }
  if (countsIdx < 0 || countsIdx === 3) return lines.join('\n')

  // 重建成标准 3 行头：从 counts 之前的非空行里依次取名称/程序信息/注释
  const headerLines = lines.slice(0, countsIdx).filter(l => l.trim().length > 0)
  const name    = headerLines[0] ?? ''
  const program = headerLines[1] ?? '  RetainMol'
  const comment = headerLines[2] ?? ''
  return [name, program, comment, ...lines.slice(countsIdx)].join('\n')
}

/** 解析 MOL 文件（自动识别 V2000 / V3000） */
export function parseMol(text: string): Molecule {
  try {
    const normalized = normalizeMolHeader(text)
    const oclMol = OCL.Molecule.fromMolfile(normalized)
    const firstLine = normalized.split('\n')[0]?.trim() || ''
    const molecule = oclToMolecule(oclMol, firstLine || 'Imported')
    if (molecule.atoms.length === 0) throw new Error('未解析到任何原子')
    return molecule
  } catch (e) {
    throw new Error(`MOL 解析失败：${(e as Error).message}`)
  }
}

/** 解析 SDF（多分子），返回所有合法分子 */
export function parseSdf(text: string): Molecule[] {
  return text
    .split(/\$\$\$\$/)
    .filter(b => b.trim().length > 10)
    .flatMap(b => { try { return [parseMol(b)] } catch { return [] } })
}

/** 导出为 MOL V2000 */
export function exportMol(mol: Molecule): string {
  return restoreV2000Coordinates(moleculeToOCL(mol).toMolfile(), mol)
}

/** 导出为 SDF（末尾附 $$$$） */
export function exportSdf(mol: Molecule): string {
  return exportMol(mol) + '\n$$$$\n'
}

// ─── 几何清理（力场最小化，用 OpenChemLib 的 MMFF94）───────────────────────────
// 不自己造力场：MMFF94 是小分子力场金标准，OCL 已内置。只动坐标，不改拓扑。

const OCLResources = (OCL as unknown as {
  Resources: { registerFromUrl: (url?: string) => Promise<void> }
}).Resources

let ffResourcePromise: Promise<void> | null = null

/**
 * 注册 MMFF94 参数表（浏览器：从 URL 拉 resources.json）。幂等——重复调用返回
 * 同一个 promise。app 层在启动时后台调用一次；未就绪时 minimizeGeometry 原样返回。
 */
export function registerForceFieldFromUrl(url: string): Promise<void> {
  if (!ffResourcePromise) {
    ffResourcePromise = OCLResources.registerFromUrl(url).then(() => { ffReady = true })
  }
  return ffResourcePromise
}

let ffReady = false
/** 测试/Node 环境直接标记就绪（配合 Resources.registerFromNodejs） */
export function markForceFieldReady(): void { ffReady = true }

export interface OptimizeResult {
  molecule: Molecule
  ok: boolean
  reason?: string
  energyBefore?: number
  energyAfter?: number
  /** 优化前的初始结构（原子集与 molecule 相同）——供 UI 做 初始→最终 morph 动画 */
  initial?: Molecule
}

interface XYZ { x: number; y: number; z: number }

/** 单个连通片段的 MMFF94 最小化，返回 id→新坐标 + 能量；失败返回 null */
function minimizeConnected(frag: Molecule): { coords: Map<string, XYZ>; eBefore: number; eAfter: number } | null {
  if (frag.atoms.length < 2 || frag.bonds.length === 0) return null
  const oclMol = moleculeToOCL(frag) as OCLMol & {
    setAtomCustomLabel: (i: number, s: string) => void
    getAtomCustomLabel: (i: number) => string | null
  }
  // MMFF94 构造时会把原子重排成规范序（重原子提前）——点击搭建的交错顺序
  // 若按 index 读回坐标就会张冠李戴、把结构搅乱。给每个 OCL 原子打上原始
  // 序号标签，FF 后按标签而非 index 读回，对任何重排都正确。
  for (let i = 0; i < frag.atoms.length; i++) oclMol.setAtomCustomLabel(i, String(i))

  const FF = (OCL as unknown as {
    ForceFieldMMFF94: new (m: OCLMol, table: string, opts: object) => {
      getTotalEnergy: () => number; minimise: () => void
    }
  }).ForceFieldMMFF94
  const ff = new FF(oclMol, 'MMFF94s', {})
  const eBefore = ff.getTotalEnergy()
  ff.minimise()
  const eAfter = ff.getTotalEnergy()

  // 按自定义标签映射回原始原子；moleculeToOCL 写入 -y/-z，读回取反还原
  const optimized = frag.atoms.map(a => ({ id: a.id, x: NaN, y: NaN, z: NaN }))
  for (let k = 0; k < frag.atoms.length; k++) {
    const label = oclMol.getAtomCustomLabel(k)
    const origIdx = label === null ? k : parseInt(label, 10)
    if (origIdx < 0 || origIdx >= optimized.length) return null
    const originalAtom = frag.atoms[origIdx]
    if (originalAtom === undefined) return null
    optimized[origIdx] = {
      id: originalAtom.id,
      x: oclMol.getAtomX(k), y: -oclMol.getAtomY(k), z: -oclMol.getAtomZ(k),
    }
  }
  if (optimized.some(a => !isFinite(a.x) || !isFinite(a.y) || !isFinite(a.z))) return null

  // 重定心到原片段质心：MMFF 可能整体平移/旋转片段，多片段场景下要各归各位，
  // 否则不同片段会在世界坐标里漂移甚至叠到一起
  const centroid = (pts: readonly XYZ[]): XYZ => {
    const c = { x: 0, y: 0, z: 0 }
    for (const p of pts) { c.x += p.x; c.y += p.y; c.z += p.z }
    return { x: c.x / pts.length, y: c.y / pts.length, z: c.z / pts.length }
  }
  const c0 = centroid(frag.atoms)
  const c1 = centroid(optimized)
  const dx = c0.x - c1.x, dy = c0.y - c1.y, dz = c0.z - c1.z
  const coords = new Map<string, XYZ>()
  for (const a of optimized) coords.set(a.id, { x: a.x + dx, y: a.y + dy, z: a.z + dz })
  return { coords, eBefore, eAfter }
}
/**
 * generate3D 专用：CG 输出只继承输入原子的 chirality/ez/wedge。
 * CG 会给未指定手性中心凭空指派对映体——输入没有的标记一律剥掉，
 * 新增 H 一律无标记。对应关系按序（moleculeToOCL 按序写，CG 按序追加 H），
 * 元素符号对不上就整批剥离（退回全未指定，绝不张冠李戴）。
 */
function inheritInputStereochemistry(input: Molecule, output: Molecule): Molecule {
  let aligned = output.atoms.length >= input.atoms.length
  if (aligned) {
    for (let i = 0; i < input.atoms.length; i += 1) {
      if (output.atoms[i]?.symbol !== input.atoms[i]?.symbol) {
        aligned = false
        break
      }
    }
  }
  const atoms = output.atoms.map((a, i) => {
    const chirality = aligned ? input.atoms[i]?.chirality : undefined
    if (a.chirality === chirality) return a
    const { chirality: _omitChirality, ...rest } = a
    return chirality === undefined ? rest : { ...rest, chirality }
  })
  const bonds = output.bonds.map((b, i) => {
    const src = aligned ? input.bonds[i] : undefined
    const ez = src?.order === 2 && b.order === 2 ? src.ez : undefined
    const wedge = src?.order === 1 && b.order === 1 ? src.wedge : undefined
    if (b.ez === ez && b.wedge === wedge) return b
    const { ez: _omitEz, wedge: _omitWedge, ...rest } = b
    return { ...rest, ...(ez === undefined ? {} : { ez }), ...(wedge === undefined ? {} : { wedge }) }
  })
  return { ...output, atoms, bonds }
}

/**
 * 2D → 3D：从平面结构（2D SDF/SMILES）生成合理的三维构象。
 * 只负责 ConformerGenerator 按连接关系用距离几何嵌入 3D 坐标。
 * 力场优化属于显式用户操作，不能在导入时隐式改变构象。
 * 返回全新分子（新 id、含氢）——调用方整体替换原 2D 结构。
 */
export function generate3D(mol: Molecule): OptimizeResult {
  if (mol.atoms.length < 2 || mol.bonds.length === 0) return { molecule: mol, ok: true }
  try {
    // OCL 只认凯库勒式：芳香标记键先排成单双交替再交给距离几何
    const kekule = kekulizeAromaticBonds(mol)
    const ingest: Molecule = kekule.size === 0 ? mol : {
      ...mol,
      bonds: mol.bonds.map(b => {
        const order = kekule.get(b.id)
        return order === undefined ? b : { ...b, order }
      }),
    }
    const oclMol = moleculeToOCL(ingest)
    const CG = (OCL as unknown as {
      ConformerGenerator: new (seed: number) => {
        getOneConformerAsMolecule: (m: OCLMol) => OCLMol | null
      }
    }).ConformerGenerator
    // 固定种子 → 同一结构每次得到相同 3D（可复现）
    const mol3d = new CG(RELAX.seed).getOneConformerAsMolecule(oclMol)
    if (!mol3d) return { molecule: mol, ok: false, reason: '无法生成 3D 构象（结构可能过于复杂或含不支持的原子）' }

    // 距离几何结果就是最终结果；MMFF/UFF 由调用方通过独立命令触发。
    // 手性只继承输入：CG 蒙出来的对映体在此剥掉，绝不存回。
    const initial = inheritInputStereochemistry(mol, oclToMolecule(mol3d, mol.name ?? '3D structure'))
    return { molecule: initial, ok: true }
  } catch (e) {
    return { molecule: mol, ok: false, reason: `3D 生成失败：${(e as Error).message}` }
  }
}

/**
 * 几何清理：MMFF94 力场最小化，只更新坐标（保留 id/键/电荷/自由基）。
 * **按连通片段分别优化**——多个不相连片段若一起丢给 MMFF，片段间只有弱 vdW、
 * 无键约束，会被吸引坍缩到一起造成穿插重叠。逐片段独立优化并重定心避免此问题。
 * 力场资源未注册、或所有片段都太小/MMFF 无法处理时，原样返回并带 reason。
 */
export function minimizeGeometry(mol: Molecule): OptimizeResult {
  if (mol.atoms.length < 2 || mol.bonds.length === 0) return { molecule: mol, ok: true }
  if (!ffReady) return { molecule: mol, ok: false, reason: '力场资源加载中，请稍候' }
  try {
    const components = splitConnectedComponents(mol)
    const newCoords = new Map<string, XYZ>()
    let eBefore = 0, eAfter = 0, anyOptimized = false
    for (const comp of components) {
      const res = minimizeConnected(comp)
      if (res) {
        anyOptimized = true
        eBefore += res.eBefore; eAfter += res.eAfter
        for (const [id, xyz] of res.coords) newCoords.set(id, xyz)
      }
      // 优化失败/过小的片段保留原坐标（不动）
    }
    if (!anyOptimized) return { molecule: mol, ok: false, reason: '没有可优化的片段（原子过少）' }
    const atoms = mol.atoms.map(a => {
      const c = newCoords.get(a.id)
      return c ? { ...a, x: c.x, y: c.y, z: c.z } : a
    })
    return { molecule: { ...mol, atoms }, ok: true, energyBefore: eBefore, energyAfter: eAfter, initial: mol }
  } catch (e) {
    return { molecule: mol, ok: false, reason: `MMFF94 无法处理该结构：${(e as Error).message}` }
  }
}

/** 判断分子是否为 2D（所有 z 坐标接近 0） */
export function is2D(mol: Molecule, eps = 1e-3): boolean {
  return mol.atoms.every(a => Math.abs(a.z) < eps)
}
