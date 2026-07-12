/**
 * MOL / SDF 格式解析与导出
 * 底层使用 OpenChemLib，自动处理 V2000 / V3000、各种非标准输出
 */

import * as OCL from 'openchemlib'
import type { Atom, Bond, Molecule } from '../molecule'
import { newAtom, newBond } from '../molecule'
import { splitConnectedComponents } from '../builder/analysis/fragments'
import { RELAX } from '../../config/relax.config'

// OCL 返回的 Molecule 对象类型
type OCLMol = ReturnType<typeof OCL.Molecule.fromMolfile>

// ─── OCL ↔ 我们的 Molecule 互转 ──────────────────────────

function oclToMolecule(oclMol: OCLMol, fallbackName = 'Imported'): Molecule {
  const atoms: Atom[] = []
  const na = oclMol.getAllAtoms()
  for (let i = 0; i < na; i++) {
    // OCL 内部对 y 和 z 取反（toMolfile 写 -y/-z，fromMolfile 读时再次取反）。
    // 用 -getAtomY / -getAtomZ 还原为 SDF 文件中的原始坐标。
    atoms.push(newAtom(
      oclMol.getAtomLabel(i),
       oclMol.getAtomX(i),
      -oclMol.getAtomY(i),
      -oclMol.getAtomZ(i),
    ))
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
    bonds.push({ ...newBond(atoms[a1].id, atoms[a2].id, order), ...(aromatic ? { aromatic: true } : {}) })
  }

  // OCL 在部分版本里可能有 getName()，没有则用首行兜底
  const oclName = (oclMol as unknown as { getName?: () => string }).getName?.()
  return { atoms, bonds, name: oclName || fallbackName }
}

function moleculeToOCL(mol: Molecule): OCLMol {
  const oclMol = new OCL.Molecule(mol.atoms.length || 16, mol.bonds.length || 16)
  const idxMap = new Map<string, number>()
  const getAtomicNo = (OCL.Molecule as unknown as { getAtomicNoFromLabel(s: string): number }).getAtomicNoFromLabel

  for (const a of mol.atoms) {
    const atomicNo = getAtomicNo(a.symbol) || 6  // 未识别时退化为碳
    const idx = oclMol.addAtom(atomicNo)
    oclMol.setAtomX(idx, a.x)
    oclMol.setAtomY(idx, -a.y)   // OCL 导出时再次取反，补偿以写出正确值
    oclMol.setAtomZ(idx, -a.z)
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
    addOrChangeBond.call(oclMol, a1, a2, BOND_TYPE[b.order])
  }
  const setName = (oclMol as unknown as { setName?: (n: string) => void }).setName
  if (mol.name && setName) setName.call(oclMol, mol.name)
  return oclMol
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
    if (/\bV[23]000\b/i.test(lines[i])) { countsIdx = i; break }
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
    return oclToMolecule(oclMol, firstLine || 'Imported')
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
  return moleculeToOCL(mol).toMolfile()
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
    optimized[origIdx] = {
      id: frag.atoms[origIdx].id,
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
 * 2D → 3D：从平面结构（2D SDF/SMILES）生成合理的三维构象。
 * 只负责 ConformerGenerator 按连接关系用距离几何嵌入 3D 坐标。
 * 力场优化属于显式用户操作，不能在导入时隐式改变构象。
 * 返回全新分子（新 id、含氢）——调用方整体替换原 2D 结构。
 */
export function generate3D(mol: Molecule): OptimizeResult {
  if (mol.atoms.length < 2 || mol.bonds.length === 0) return { molecule: mol, ok: true }
  try {
    const oclMol = moleculeToOCL(mol)
    const CG = (OCL as unknown as {
      ConformerGenerator: new (seed: number) => {
        getOneConformerAsMolecule: (m: OCLMol) => OCLMol | null
      }
    }).ConformerGenerator
    // 固定种子 → 同一结构每次得到相同 3D（可复现）
    const mol3d = new CG(RELAX.seed).getOneConformerAsMolecule(oclMol)
    if (!mol3d) return { molecule: mol, ok: false, reason: '无法生成 3D 构象（结构可能过于复杂或含不支持的原子）' }

    // 距离几何结果就是最终结果；MMFF/UFF 由调用方通过独立命令触发。
    const initial = oclToMolecule(mol3d, mol.name ?? '3D structure')
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
