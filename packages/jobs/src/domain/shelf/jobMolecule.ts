import { inferBonds } from '@retainmol/mol-viewer/core'
import type { Molecule } from '@retainmol/mol-viewer/core'
import type { JobDetail } from '../jobTypes'

/** 超过该原子数的分子不在展柜内渲染（overlay 显示原子数提示）。 */
export const SHELF_MAX_ATOMS = 300

export type ShelfMoleculeSource =
  | { kind: 'inline'; molecule: Molecule }
  | { kind: 'revision'; revisionId: string }
  | { kind: 'derived'; molecule: Molecule }
  | { kind: 'none' }

export type ShelfMoleculeEntry =
  | { state: 'loading' }
  | { state: 'unavailable' }
  | { state: 'oversized'; atomCount: number }
  | { state: 'ready'; molecule: Molecule }

export function isMoleculeSnapshot(value: unknown): value is Molecule {
  if (!value || typeof value !== 'object') return false
  const candidate = value as { atoms?: unknown; bonds?: unknown }
  if (!Array.isArray(candidate.atoms) || !Array.isArray(candidate.bonds)) return false
  return candidate.atoms.every(atom => (
    Boolean(atom) && typeof atom === 'object'
    && typeof (atom as { id?: unknown }).id === 'string'
    && typeof (atom as { symbol?: unknown }).symbol === 'string'
    && ['x', 'y', 'z'].every(key => Number.isFinite((atom as Record<string, unknown>)[key]))
  )) && candidate.bonds.every(bond => (
    Boolean(bond) && typeof bond === 'object'
    && typeof (bond as { id?: unknown }).id === 'string'
    && typeof (bond as { atomId1?: unknown }).atomId1 === 'string'
    && typeof (bond as { atomId2?: unknown }).atomId2 === 'string'
    && [1, 2, 3].includes((bond as { order?: unknown }).order as number)
  ))
}

/**
 * derived 源的键推断有计算量；react-query 结构共享保证内容不变时 JobDetail
 * 引用稳定，用 WeakMap 缓存到 detail 上。
 */
const sourceCache = new WeakMap<JobDetail, ShelfMoleculeSource>()

export function resolveShelfMoleculeSource(detail: JobDetail): ShelfMoleculeSource {
  const cached = sourceCache.get(detail)
  if (cached) return cached
  const source = computeSource(detail)
  sourceCache.set(detail, source)
  return source
}

function computeSource(detail: JobDetail): ShelfMoleculeSource {
  const request = detail.request
  if (!request) return { kind: 'none' }
  if ('molecule' in request && isMoleculeSnapshot(request.molecule)) {
    return { kind: 'inline', molecule: request.molecule }
  }
  if ('moleculeRevisionId' in request && typeof request.moleculeRevisionId === 'string') {
    return { kind: 'revision', revisionId: request.moleculeRevisionId }
  }
  if ('structure' in request && request.structure && request.structure.atoms.length > 0) {
    const atoms = request.structure.atoms
    return {
      kind: 'derived',
      molecule: {
        ...(request.structure.name !== undefined ? { name: request.structure.name } : {}),
        atoms,
        bonds: inferBonds(atoms),
      },
    }
  }
  return { kind: 'none' }
}

function gateBySize(molecule: Molecule): ShelfMoleculeEntry {
  return molecule.atoms.length > SHELF_MAX_ATOMS
    ? { state: 'oversized', atomCount: molecule.atoms.length }
    : { state: 'ready', molecule }
}

export function deriveShelfEntry(
  detail: JobDetail | undefined,
  detailPending: boolean,
  revision: { molecule: Molecule } | undefined,
  revisionPending: boolean,
): ShelfMoleculeEntry {
  if (!detail) return detailPending ? { state: 'loading' } : { state: 'unavailable' }
  const source = resolveShelfMoleculeSource(detail)
  if (source.kind === 'inline' || source.kind === 'derived') return gateBySize(source.molecule)
  if (source.kind === 'revision') {
    if (revision) return gateBySize(revision.molecule)
    return revisionPending ? { state: 'loading' } : { state: 'unavailable' }
  }
  return { state: 'unavailable' }
}
