import { z } from 'zod'

const id = z.string().trim().min(1).max(128)
const finite = z.number().finite()
const nonnegative = finite.min(0)
const base = { id, strength: z.enum(['hard', 'soft']), weight: finite.gt(0).optional() }
const pair = z.tuple([id, id])
const position = z.object({ x: finite, y: finite, z: finite }).strict()

/** Serializable geometry requirements; units are Å and degrees. */
export const geometryConstraintSchema = z.discriminatedUnion('kind', [
  z.object({ ...base, kind: z.literal('distance'), atomIds: pair, target: nonnegative, tolerance: nonnegative }).strict(),
  z.object({ ...base, kind: z.literal('minimum-distance'), atomIds: pair, minimum: nonnegative, tolerance: nonnegative }).strict(),
  z.object({ ...base, kind: z.literal('angle'), atomIds: z.tuple([id, id, id]), targetDegrees: nonnegative.max(180), toleranceDegrees: nonnegative.max(180) }).strict(),
  z.object({ ...base, kind: z.literal('dihedral'), atomIds: z.tuple([id, id, id, id]), targetDegrees: finite, toleranceDegrees: nonnegative.max(180) }).strict(),
  z.object({ ...base, kind: z.literal('position'), atomId: id, target: position, tolerance: nonnegative }).strict(),
  z.object({ ...base, kind: z.literal('helicity'), atomIds: z.array(id).min(4).max(1000), handedness: z.enum(['right', 'left']), minTwistDegrees: finite.gt(0).max(90) }).strict(),
])

export const constrainedGeometryRequestSchema = z.object({
  constraints: z.array(geometryConstraintSchema).max(1000),
  movableAtomIds: z.array(id).max(1000),
  bondLengthTolerance: nonnegative.optional(),
  angleToleranceDegrees: nonnegative.max(180).optional(),
  nonbondedMinimumDistance: nonnegative.optional(),
  maxIterations: finite.int().min(0).max(2000).optional(),
}).strict()
