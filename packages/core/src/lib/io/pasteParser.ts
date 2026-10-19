/**
 * 剪贴板文本自动识别 + 解析
 * 支持：MOL/SDF、XYZ、Gaussian .gjf、裸原子坐标
 */

import type { Atom, Molecule } from '../molecule'
import { parseXYZ, inferBonds } from '../molecule'
import { genId } from '../model/identity'
import { parseMol } from './molFormat'

export type PasteFormat = 'mol' | 'gjf' | 'xyz' | 'raw' | 'unknown'

// 工具：生成 atom
function makeAtom(symbol: string, x: number, y: number, z: number): Atom {
  return { id: genId(), symbol, x, y, z }
}

function lineAt(lines: readonly string[], index: number): string {
  return lines[index] ?? ''
}

// ─── 格式识别 ───────────────────────────────

export function detectPasteFormat(text: string): PasteFormat {
  const t = text.trim()
  if (!t) return 'unknown'
  const lines = t.split(/\r?\n/)

  // MOL：前 10 行含 V2000/V3000 标记
  for (let i = 0; i < Math.min(10, lines.length); i++) {
    if (/\bV[23]000\b/.test(lineAt(lines, i))) return 'mol'
  }

  // GJF：顶部有 % 指令，或前 10 行有 # 路由
  const hasPercent = lines.slice(0, 5).some(l => l.startsWith('%'))
  const hasRoute = lines.slice(0, 10).some(l => l.trim().startsWith('#'))
  if (hasPercent || hasRoute) return 'gjf'

  // XYZ：首行是纯整数
  const first = lineAt(lines, 0).trim()
  const n = parseInt(first, 10)
  if (!isNaN(n) && n > 0 && n < 100000 && String(n) === first) return 'xyz'

  // 裸坐标：每一非空行都匹配 "symbol x y z"
  const atomRe = /^\s*[A-Z][a-z]?\s+-?\d+\.?\d*(?:[eE][-+]?\d+)?\s+-?\d+\.?\d*(?:[eE][-+]?\d+)?\s+-?\d+\.?\d*(?:[eE][-+]?\d+)?\s*$/
  const nonEmpty = lines.filter(l => l.trim())
  if (nonEmpty.length >= 2 && nonEmpty.every(l => atomRe.test(l))) return 'raw'

  return 'unknown'
}

// ─── Gaussian .gjf 解析 ─────────────────────

export function parseGJF(text: string): Molecule {
  const lines = text.replace(/\r\n/g, '\n').split('\n')
  let i = 0

  // 跳过 % 指令
  while (i < lines.length && lineAt(lines, i).trim().startsWith('%')) i++

  // 路由段（以 # 开头，到空行结束，可跨多行）
  if (i >= lines.length || !lineAt(lines, i).trim().startsWith('#')) {
    throw new Error('GJF 缺少 # 路由行')
  }
  while (i < lines.length && lineAt(lines, i).trim() !== '') i++
  i++ // 空行

  // 标题（到下一空行）
  const titleLines: string[] = []
  while (i < lines.length && lineAt(lines, i).trim() !== '') {
    titleLines.push(lineAt(lines, i).trim())
    i++
  }
  i++ // 空行

  // 电荷/多重度行
  if (i >= lines.length) throw new Error('GJF 缺少电荷/多重度行')
  i++ // 跳过这行，我们不需要这两个值

  // 原子行
  const atoms: Atom[] = []
  while (i < lines.length && lineAt(lines, i).trim() !== '') {
    const parts = lineAt(lines, i).trim().split(/\s+/)
    // 可能格式：
    //   "C x y z"
    //   "C 0 x y z"  （0/-1/1 是 ONIOM 冻结标记）
    //   "C(Frag=1) x y z"  （片段标记）
    let symbol = (parts[0] ?? '').replace(/\(.*\)$/, '') // 去掉 (Frag=...) 之类
    let x: number, y: number, z: number
    if (parts.length >= 5 && /^-?[01]$/.test(parts[1] ?? '')) {
      x = Number(parts[2]); y = Number(parts[3]); z = Number(parts[4])
    } else if (parts.length >= 4) {
      x = Number(parts[1]); y = Number(parts[2]); z = Number(parts[3])
    } else { i++; continue }

    // 元素符号可能带原子序号（"C1" → "C"）
    const m = symbol.match(/^([A-Z][a-z]?)/)
    if (m?.[1]) symbol = m[1]

    if (!isNaN(x) && !isNaN(y) && !isNaN(z) && symbol) {
      atoms.push(makeAtom(symbol, x, y, z))
    }
    i++
  }

  if (atoms.length === 0) throw new Error('GJF 未解析到任何原子')
  return { atoms, bonds: inferBonds(atoms), name: titleLines.join(' ') || 'pasted' }
}

// ─── Gaussian .gjf 导出 ─────────────────────

export interface GJFOptions {
  /** 路由行（计算方法/基组），默认最小可跑的 HF/6-31G(d) */
  route?: string
  charge?: number
  multiplicity?: number
  title?: string
}

/**
 * 导出为 Gaussian 输入文件（.gjf/.com）。补齐 parseGJF 的反向，
 * 让「导入 Gaussian → 编辑 → 导回 Gaussian」的 round-trip 闭合。
 * 只写坐标（键不进 Gaussian 输入，Gaussian 自己按距离判键）。
 */
export function exportGJF(mol: Molecule, opts: GJFOptions = {}): string {
  const route = opts.route ?? '# hf/6-31g(d)'
  // 未显式指定时从分子推导：总电荷 = 形式电荷之和；多重度 = 未配对电子数 + 1（2S+1）
  const charge = opts.charge ?? mol.atoms.reduce((s, a) => s + (a.charge ?? 0), 0)
  const totalRadical = mol.atoms.reduce((s, a) => s + Math.abs(a.radical ?? 0), 0)
  const mult = opts.multiplicity ?? (totalRadical + 1)
  const title = (opts.title ?? mol.name ?? 'molecule').trim() || 'molecule'
  const coords = mol.atoms.map(a =>
    ` ${a.symbol.padEnd(2)}  ${a.x.toFixed(6).padStart(12)}  ${a.y.toFixed(6).padStart(12)}  ${a.z.toFixed(6).padStart(12)}`,
  )
  // 结尾必须留一个空行，否则 Gaussian 报 "End of file" 错误
  return [route, '', title, '', `${charge} ${mult}`, ...coords, '', ''].join('\n')
}

// ─── 裸坐标 ───────────────────────────────

export function parseRawCoords(text: string): Molecule {
  const atoms: Atom[] = []
  for (const line of text.split(/\r?\n/)) {
    const parts = line.trim().split(/\s+/)
    if (parts.length < 4) continue
    const [symbol, xToken, yToken, zToken] = parts
    if (symbol === undefined || xToken === undefined || yToken === undefined || zToken === undefined) continue
    const x = Number(xToken), y = Number(yToken), z = Number(zToken)
    if (/^[A-Z][a-z]?$/.test(symbol) && !isNaN(x) && !isNaN(y) && !isNaN(z)) {
      atoms.push(makeAtom(symbol, x, y, z))
    }
  }
  if (atoms.length === 0) throw new Error('未找到有效坐标行')
  return { atoms, bonds: inferBonds(atoms), name: 'pasted' }
}

// ─── 统一入口 ──────────────────────────────

export function parseClipboard(text: string): { format: PasteFormat; molecule: Molecule } {
  const format = detectPasteFormat(text)
  let molecule: Molecule
  switch (format) {
    case 'mol': molecule = parseMol(text); break
    case 'gjf': molecule = parseGJF(text); break
    case 'xyz': molecule = parseXYZ(text); break
    case 'raw': molecule = parseRawCoords(text); break
    default: throw new Error('无法识别的格式（支持：MOL、XYZ、Gaussian GJF、裸坐标）')
  }
  return { format, molecule }
}
