import type { Molecule } from '../model/types'
import { genId } from '../model/identity'
import { solveConstrainedGeometry } from '../geometry/constrained/solver'
import type { ConstrainedGeometryRequest, GeometryConstraintReport } from '../geometry/constrained/contracts'
import type { GeometryMotionReport } from '../geometry/motion/contracts'
import type { EditPlan, ModelingContext, ModelingIssue } from './contracts'
import { constrainedGeometryRequestSchema } from './geometryConstraintSchema'
import { computeMoleculeRevision } from './revision'
import { dryRunEditPlan } from './planExecutor'

export interface ConstrainedGeometryPreviewRequest {
  readonly targetObjectId: string
  readonly request: ConstrainedGeometryRequest
}

export type ConstrainedGeometryPreview =
  | {
      readonly ok: true
      readonly plan: EditPlan
      readonly molecule: Molecule
      readonly report: GeometryConstraintReport
      readonly baseRevision: string
      readonly nextRevision: string
      readonly iterations: number
      readonly movedAtomIds: readonly string[]
      readonly motionReport?: GeometryMotionReport
    }
  | { readonly ok: false; readonly issues: readonly ModelingIssue[]; readonly report?: GeometryConstraintReport; readonly motionReport?: GeometryMotionReport }

/** Pure preview. The returned plan re-solves and revalidates against its exact baseline at commit. */
export function previewConstrainedGeometry(context: ModelingContext, input: ConstrainedGeometryPreviewRequest): ConstrainedGeometryPreview {
  const fail = (code: ModelingIssue['code'], message: string): ConstrainedGeometryPreview => ({ ok: false, issues: [{ severity: 'error', code, message }] })
  const target = context.objects.find(o => o.objectId === input.targetObjectId)
  if (!target) return fail('target-not-found', '约束求解的目标不存在')
  if (context.activeObjectId !== target.objectId) return fail('target-not-active', '请先激活目标对象')
  if (target.locked || !target.editable) return fail('object-not-editable', '目标已锁定或不可编辑')
  if (target.revision !== computeMoleculeRevision(target.molecule)) return fail('stale-context', '上下文版本与分子不匹配')
  if (!context.capabilities.includes('geometry.solveConstraints')) return fail('unsupported-command', '执行器不支持几何约束求解')
  const parsed = constrainedGeometryRequestSchema.safeParse(input.request)
  if (!parsed.success) return fail('invalid-plan', '几何约束请求格式无效：' + parsed.error.issues.map(i => i.path.join('.') + ': ' + i.message).join('；'))
  const request = parsed.data as ConstrainedGeometryRequest
  const solution = solveConstrainedGeometry(target.molecule, request)
  const motion = solution.motionReport ? { motionReport: solution.motionReport } : {}
  if (!solution.ok) return { ok: false, issues: [{ severity: 'error', code: 'constraint-violation', message: solution.reason ?? '未找到满足约束的几何结果' }], report: solution.report, ...motion }
  const movable = new Set(request.movableAtomIds)
  const plan: EditPlan = {
    schemaVersion: 1, planId: genId(), source: 'human', targetObjectId: target.objectId,
    expectedRevision: target.revision,
    constraints: {
      fixedAtomPositions: target.molecule.atoms.filter(a => !movable.has(a.id)).map(a => a.id),
      protectedAtomIds: target.molecule.atoms.map(a => a.id),
    },
    commands: [{ commandId: 'solve-geometry', kind: 'geometry.solveConstraints', request }],
  }
  const checked = dryRunEditPlan(context, plan)
  if (!checked.ok) return { ok: false, issues: checked.issues, report: solution.report, ...motion }
  return { ok: true, plan, molecule: checked.molecule, report: solution.report,
    baseRevision: target.revision, nextRevision: checked.nextRevision,
    iterations: solution.iterations, movedAtomIds: solution.movedAtomIds, ...motion }
}
