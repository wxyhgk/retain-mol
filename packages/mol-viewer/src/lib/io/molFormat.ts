/**
 * MOL / SDF 格式解析与导出
 * 底层使用 OpenChemLib，自动处理 V2000 / V3000、各种非标准输出
 */

import * as OCL from 'openchemlib'
import type { Atom, Bond, Molecule } from '../molecule'
import { newAtom, newBond } from '../molecule'

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
}

/**
 * 几何清理：MMFF94 力场最小化当前分子，只更新坐标（保留 id/键/电荷/自由基）。
 * 力场资源未注册、分子过小、或 MMFF 无法处理该结构（异种元素/怪价态）时，
 * 原样返回并带 reason。同步函数——资源需先由 registerForceFieldFromUrl 注册。
 */
export function minimizeGeometry(mol: Molecule): OptimizeResult {
  if (mol.atoms.length < 2 || mol.bonds.length === 0) {
    return { molecule: mol, ok: true }
  }
  if (!ffReady) return { molecule: mol, ok: false, reason: '力场资源加载中，请稍候' }
  try {
    const oclMol = moleculeToOCL(mol)
    const FF = (OCL as unknown as {
      ForceFieldMMFF94: new (m: OCLMol, table: string, opts: object) => {
        getTotalEnergy: () => number; minimise: () => void
      }
    }).ForceFieldMMFF94
    const ff = new FF(oclMol, 'MMFF94s', {})
    const energyBefore = ff.getTotalEnergy()
    ff.minimise()
    const energyAfter = ff.getTotalEnergy()
    // moleculeToOCL 写入 -y/-z，读回同样取反还原到本项目坐标系
    const atoms = mol.atoms.map((a, i) => ({
      ...a, x: oclMol.getAtomX(i), y: -oclMol.getAtomY(i), z: -oclMol.getAtomZ(i),
    }))
    if (atoms.some(a => !isFinite(a.x) || !isFinite(a.y) || !isFinite(a.z))) {
      return { molecule: mol, ok: false, reason: '优化产生非法坐标，已保留原结构' }
    }
    return { molecule: { ...mol, atoms }, ok: true, energyBefore, energyAfter }
  } catch (e) {
    return { molecule: mol, ok: false, reason: `MMFF94 无法处理该结构：${(e as Error).message}` }
  }
}

/** 判断分子是否为 2D（所有 z 坐标接近 0） */
export function is2D(mol: Molecule, eps = 1e-3): boolean {
  return mol.atoms.every(a => Math.abs(a.z) < eps)
}
