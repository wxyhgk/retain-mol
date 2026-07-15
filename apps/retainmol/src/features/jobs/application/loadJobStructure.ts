import type { Molecule } from '@retainmol/mol-viewer/core'
import type { JobArtifact, JobDetail } from '../domain/jobTypes'

type OptimizedAtom = { id: string; symbol: string; x: number; y: number; z: number }
type OptimizedStructure = { name?: string; atoms: OptimizedAtom[] }

export type LoadJobStructureResult =
  | { ok: true; molecule: Molecule; restoredSnapshot: boolean }
  | { ok: false; message: string }

/** New jobs restore their saved graph; old jobs only update matching coordinates. */
export function resolveOptimizedJobStructure(
  artifact: JobArtifact,
  job: JobDetail,
  activeMolecule: Molecule,
): LoadJobStructureResult {
  const structure = artifact.metadata?.structure
  if (!isOptimizedStructure(structure)) {
    return { ok: false, message: '该 artifact 不包含可加载的优化坐标' }
  }

  const snapshot = artifact.metadata?.molecule ?? job.request?.molecule
  if (isMoleculeSnapshot(snapshot)) {
    return { ok: true, molecule: withOptimizedPositions(snapshot, structure), restoredSnapshot: true }
  }

  const positions = new Map(structure.atoms.map(atom => [atom.id, atom]))
  if (positions.size !== activeMolecule.atoms.length || activeMolecule.atoms.some(atom => {
    const position = positions.get(atom.id)
    return !position || position.symbol !== atom.symbol
  })) {
    return { ok: false, message: '旧任务未保存分子拓扑，且当前结构与任务输入不一致，无法载入' }
  }
  return { ok: true, molecule: withOptimizedPositions(activeMolecule, structure), restoredSnapshot: false }
}

function withOptimizedPositions(molecule: Molecule, structure: OptimizedStructure): Molecule {
  const positions = new Map(structure.atoms.map(atom => [atom.id, atom]))
  return {
    ...molecule,
    name: structure.name ?? molecule.name,
    atoms: molecule.atoms.map(atom => {
      const position = positions.get(atom.id)
      return position ? { ...atom, x: position.x, y: position.y, z: position.z } : atom
    }),
  }
}

function isOptimizedStructure(value: unknown): value is OptimizedStructure {
  if (!value || typeof value !== 'object' || !Array.isArray((value as { atoms?: unknown }).atoms)) return false
  return (value as { atoms: unknown[] }).atoms.every(atom => (
    Boolean(atom) && typeof atom === 'object'
    && typeof (atom as { id?: unknown }).id === 'string'
    && typeof (atom as { symbol?: unknown }).symbol === 'string'
    && ['x', 'y', 'z'].every(key => Number.isFinite((atom as Record<string, unknown>)[key]))
  ))
}

function isMoleculeSnapshot(value: unknown): value is Molecule {
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
