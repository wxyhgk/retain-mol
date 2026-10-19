import type { Molecule } from '../model/types'
import { analyzeStericContacts, type StericReport } from '../builder/geometry/stericContacts'
import { SINGLE_BOND_TORSION_ANGLES } from '../builder/geometry/singleBondTorsion'
import { dryRunEditPlan } from './planExecutor'
import { computeMoleculeRevision } from './revision'
import type { EditPlan, ModelingContext } from './contracts'

export interface TorsionCandidateRequest {
  readonly targetObjectId: string
  readonly bondId: string
  /** Endpoint on the moving side; the other endpoint and core stay fixed. */
  readonly movingAtomId: string
  readonly fixedAtomIds: readonly string[]
}
export interface TorsionMetrics {
  readonly crowdingScore: number
  readonly displacementRms: number
  /** Unweighted all-atom radius of gyration in angstroms. */
  readonly spreadRadius: number
}
export interface TorsionCandidate {
  readonly id: string
  readonly angleDegrees: number
  readonly plan: EditPlan
  readonly molecule: Molecule
  readonly revision: string
  readonly report: StericReport
  readonly metrics: TorsionMetrics
}
export interface TorsionCandidateResult {
  readonly ok: boolean
  readonly baseRevision: string | null
  readonly issues: readonly string[]
  readonly sampledCount: number
  readonly acceptedCount: number
  readonly candidates: readonly TorsionCandidate[]
}

function sameGeometryInvariants(base: Molecule, next: Molecule, fixed: ReadonlySet<string>): boolean {
  if (base.atoms.length !== next.atoms.length || JSON.stringify(base.bonds) !== JSON.stringify(next.bonds)) return false
  const nextAtoms = new Map(next.atoms.map(a => [a.id, a]))
  for (const a of base.atoms) {
    const b = nextAtoms.get(a.id)
    if (!b || a.symbol !== b.symbol || a.chirality !== b.chirality) return false
    if (fixed.has(a.id) && Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z) > 1e-8) return false
  }
  const baseAtoms = new Map(base.atoms.map(a => [a.id, a]))
  for (const bond of base.bonds) {
    const a = baseAtoms.get(bond.atomId1)!, b = baseAtoms.get(bond.atomId2)!
    const c = nextAtoms.get(bond.atomId1)!, d = nextAtoms.get(bond.atomId2)!
    if (Math.abs(Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z) - Math.hypot(c.x - d.x, c.y - d.y, c.z - d.z)) > 1e-8) return false
  }
  return true
}

/** Deterministic bounded search around one caller-authorized, non-ring single bond. */
export function generateTorsionCandidates(context: ModelingContext, request: TorsionCandidateRequest): TorsionCandidateResult {
  const target = context.objects.find(o => o.objectId === request.targetObjectId)
  const fail = (message: string): TorsionCandidateResult => ({ ok: false, baseRevision: target?.revision ?? null,
    issues: [message], sampledCount: 0, acceptedCount: 0, candidates: [] })
  if (!target || target.locked || !target.editable) return fail('目标不存在或不可编辑')
  const base = target.molecule
  if (computeMoleculeRevision(base) !== target.revision) return fail('上下文版本与分子不匹配')
  const report = analyzeStericContacts(base)
  if (!report.supported || report.hydrogenCoverage !== 'complete') return fail('仅支持具有完整显式氢的中性 C/H 结构：' + report.issues.join('；'))
  const bond = base.bonds.find(b => b.id === request.bondId)
  if (!bond || bond.order !== 1 || bond.aromatic || ![bond.atomId1, bond.atomId2].includes(request.movingAtomId)) return fail('必须指定外围非芳香单键及移动侧端点')
  const stationaryId = bond.atomId1 === request.movingAtomId ? bond.atomId2 : bond.atomId1
  const moving = new Set([request.movingAtomId])
  const adjacency = new Map(base.atoms.map(a => [a.id, [] as string[]]))
  for (const b of base.bonds) if (b.id !== bond.id) {
    adjacency.get(b.atomId1)!.push(b.atomId2); adjacency.get(b.atomId2)!.push(b.atomId1)
  }
  const queue = [request.movingAtomId]
  for (let i = 0; i < queue.length; i++) for (const id of adjacency.get(queue[i]!)!) {
    if (!moving.has(id)) { moving.add(id); queue.push(id) }
  }
  if (moving.has(stationaryId)) return fail('该键属于环，不能独立旋转')
  const fixed = new Set(request.fixedAtomIds)
  const ids = new Set(base.atoms.map(a => a.id))
  if ([...fixed].some(id => !ids.has(id))) return fail('固定原子不存在')
  const movingIds = [...moving].filter(id => id !== request.movingAtomId).sort()
  if (!movingIds.length || movingIds.some(id => fixed.has(id))) return fail('移动侧已锁定或没有可移动原子')
  const accepted: TorsionCandidate[] = []
  const baseAtoms = new Map(base.atoms.map(a => [a.id, a]))
  for (const angleDegrees of SINGLE_BOND_TORSION_ANGLES) {
    const id = `torsion-${angleDegrees}`
    const plan: EditPlan = { schemaVersion: 1, planId: `${target.revision}:${request.bondId}:${id}`,
      source: 'system', targetObjectId: target.objectId, expectedRevision: target.revision,
      constraints: { fixedAtomPositions: [...fixed].sort(), protectedAtomIds: [...ids].sort() },
      commands: [{ commandId: id, kind: 'geometry.rotateGroup', atomIds: movingIds,
        axisAtomId1: stationaryId, axisAtomId2: request.movingAtomId, angleDegrees }] }
    const result = dryRunEditPlan(context, plan)
    if (!result.ok || !sameGeometryInvariants(base, result.molecule, fixed)) continue
    const nextReport = analyzeStericContacts(result.molecule)
    if (!nextReport.supported || nextReport.hardClashCount) continue
    const atoms = [...result.molecule.atoms].sort((a, b) => a.id.localeCompare(b.id))
    const center = atoms.reduce((v, a) => [v[0]! + a.x / atoms.length, v[1]! + a.y / atoms.length, v[2]! + a.z / atoms.length], [0, 0, 0])
    const displacementRms = Math.sqrt(atoms.reduce((sum, a) => {
      const b = baseAtoms.get(a.id)!
      return sum + (a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2
    }, 0) / atoms.length)
    const spreadRadius = Math.sqrt(atoms.reduce((sum, a) => sum + (a.x - center[0]!) ** 2 + (a.y - center[1]!) ** 2 + (a.z - center[2]!) ** 2, 0) / atoms.length)
    accepted.push({ id, angleDegrees, plan, molecule: result.molecule, revision: computeMoleculeRevision(result.molecule),
      report: nextReport, metrics: { crowdingScore: nextReport.crowdingScore, displacementRms, spreadRadius } })
  }
  const selected = new Map<string, TorsionCandidate>()
  for (const metric of ['spreadRadius', 'displacementRms', 'crowdingScore'] as const) {
    const best = [...accepted].sort((a, b) => (a.metrics[metric] - b.metrics[metric]) * (metric === 'spreadRadius' ? -1 : 1) || a.angleDegrees - b.angleDegrees)[0]
    if (best) selected.set(best.id, best)
  }
  for (const candidate of [...accepted].sort((a, b) => a.metrics.crowdingScore - b.metrics.crowdingScore || a.angleDegrees - b.angleDegrees)) {
    if (selected.size >= 6) break
    selected.set(candidate.id, candidate)
  }
  return { ok: true, baseRevision: target.revision, sampledCount: SINGLE_BOND_TORSION_ANGLES.length,
    acceptedCount: accepted.length, candidates: [...selected.values()].sort((a, b) => a.angleDegrees - b.angleDegrees),
    issues: accepted.length ? [] : ['当前单键的 24 个采样姿态中没有找到满足约束的候选'] }
}
