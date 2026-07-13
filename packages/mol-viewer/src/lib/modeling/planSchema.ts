import { z } from 'zod'
import type { EditPlanParseResult } from './contracts'

const idSchema = z.string().trim().min(1).max(128)
const finiteNumberSchema = z.number().finite()
const elementSymbolSchema = z.string().regex(/^[A-Z][a-z]{0,2}$/).max(3)
const bondOrderSchema = z.number().int().min(1).max(3).transform(value => value as 1 | 2 | 3)
const positionSchema = z.object({
  x: finiteNumberSchema,
  y: finiteNumberSchema,
  z: finiteNumberSchema,
}).strict()
const scopeSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('molecule') }).strict(),
  z.object({
    kind: z.literal('selection'),
    atomIds: z.array(idSchema).max(10000),
    bondIds: z.array(idSchema).max(10000),
  }).strict(),
])
const anchorSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('atom'), atomId: idSchema }).strict(),
  z.object({ kind: z.literal('bond'), bondId: idSchema }).strict(),
  z.object({
    kind: z.literal('space'),
    position: positionSchema,
    normal: positionSchema.optional(),
  }).strict(),
])
const uniqueAtomIdsSchema = z.array(idSchema).max(10000).superRefine((atomIds, context) => {
  const seen = new Set<string>()
  atomIds.forEach((atomId, index) => {
    if (seen.has(atomId)) {
      context.addIssue({
        code: 'custom',
        message: `Duplicate atom id: ${atomId}`,
        path: [index],
      })
    }
    seen.add(atomId)
  })
})
export const modelingConstraintsSchema = z.object({
  fixedAtomPositions: uniqueAtomIdsSchema.optional(),
  protectedAtomIds: uniqueAtomIdsSchema.optional(),
}).strict()
const commandBase = {
  commandId: idSchema,
}

export const modelingCommandSchema = z.discriminatedUnion('kind', [
  z.object({
    ...commandBase,
    kind: z.literal('atom.add'),
    atomId: idSchema,
    symbol: elementSymbolSchema,
    position: positionSchema,
  }).strict(),
  z.object({
    ...commandBase,
    kind: z.literal('atom.replace'),
    atomId: idSchema,
    symbol: elementSymbolSchema,
  }).strict(),
  z.object({ ...commandBase, kind: z.literal('atom.remove'), atomId: idSchema }).strict(),
  z.object({
    ...commandBase,
    kind: z.literal('atom.move'),
    atomId: idSchema,
    position: positionSchema,
  }).strict(),
  z.object({
    ...commandBase,
    kind: z.literal('atom.setCharge'),
    atomId: idSchema,
    charge: z.number().int().min(-8).max(8),
  }).strict(),
  z.object({
    ...commandBase,
    kind: z.literal('atom.setRadical'),
    atomId: idSchema,
    radical: z.number().int().min(0).max(8),
  }).strict(),
  z.object({
    ...commandBase,
    kind: z.literal('atom.addHydrogen'),
    atomId: idSchema,
    hydrogenAtomId: idSchema,
  }).strict(),
  z.object({
    ...commandBase,
    kind: z.literal('bond.add'),
    bondId: idSchema,
    atomId1: idSchema,
    atomId2: idSchema,
    order: bondOrderSchema,
  }).strict(),
  z.object({ ...commandBase, kind: z.literal('bond.remove'), bondId: idSchema }).strict(),
  z.object({
    ...commandBase,
    kind: z.literal('bond.setOrder'),
    bondId: idSchema,
    order: bondOrderSchema,
  }).strict(),
  z.object({
    ...commandBase,
    kind: z.literal('fragment.attach'),
    atomId: idSchema,
    fragmentId: idSchema,
    torsionAngleDegrees: finiteNumberSchema.min(-360).max(360).optional(),
  }).strict(),
  z.object({
    ...commandBase,
    kind: z.literal('fragment.bridge'),
    atomId1: idSchema,
    atomId2: idSchema,
    fragmentId: idSchema,
    orientationDegrees: finiteNumberSchema.min(-360).max(360).optional(),
  }).strict(),
  z.object({
    ...commandBase,
    kind: z.literal('fragment.fuse'),
    bondId: idSchema,
    fragmentId: idSchema,
  }).strict(),
  z.object({
    ...commandBase,
    kind: z.literal('geometry.setBondLength'),
    atomId1: idSchema,
    atomId2: idSchema,
    length: finiteNumberSchema.gt(0.1).max(20),
  }).strict(),
  z.object({
    ...commandBase,
    kind: z.literal('geometry.setBondAngle'),
    atomId1: idSchema,
    atomId2: idSchema,
    atomId3: idSchema,
    angleDegrees: finiteNumberSchema.gt(0).lt(180),
  }).strict(),
  z.object({
    ...commandBase,
    kind: z.literal('geometry.setDihedral'),
    atomId1: idSchema,
    atomId2: idSchema,
    atomId3: idSchema,
    atomId4: idSchema,
    angleDegrees: finiteNumberSchema.min(-360).max(360),
  }).strict(),
  z.object({
    ...commandBase,
    kind: z.literal('geometry.rotateGroup'),
    atomIds: uniqueAtomIdsSchema.min(1),
    axisAtomId1: idSchema,
    axisAtomId2: idSchema,
    angleDegrees: finiteNumberSchema.min(-360).max(360),
  }).strict(),
])

export const editPlanSchema = z.object({
  schemaVersion: z.literal(1),
  planId: idSchema,
  source: z.enum(['ai', 'human', 'import', 'system']),
  description: z.string().max(2000).optional(),
  targetObjectId: idSchema,
  scope: scopeSchema.optional(),
  anchor: anchorSchema.optional(),
  expectedRevision: idSchema.optional(),
  constraints: modelingConstraintsSchema.optional(),
  commands: z.array(modelingCommandSchema).min(1).max(512),
}).strict()

export function parseEditPlan(input: unknown): EditPlanParseResult {
  const parsed = editPlanSchema.safeParse(input)
  // The runtime schema requires every command field. This cast compensates for
  // Zod's optional-property inference under the package's non-strict base tsconfig.
  if (parsed.success) return { ok: true, plan: parsed.data as unknown as import('./contracts').EditPlan }
  return {
    ok: false,
    issues: parsed.error.issues.map(issue => ({
      severity: 'error' as const,
      code: 'invalid-plan' as const,
      message: issue.message,
      path: issue.path.join('.'),
    })),
  }
}
