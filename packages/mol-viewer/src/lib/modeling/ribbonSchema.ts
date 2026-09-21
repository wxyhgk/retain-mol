import { z } from 'zod'

const id = z.string().trim().min(1).max(128)

/** Explicit graph references; connectivity is checked by validateRibbonRegion. */
export const geometryRibbonRegionSchema = z.object({
  id,
  sections: z.array(z.object({ leftAtomId: id, rightAtomId: id }).strict()).min(3).max(500),
  closure: z.enum(['open', 'parallel', 'crossed']),
}).strict()

/** Procedural circular ribbon targets, not a chemical conformer specification. */
export const geometryRibbonGuideRequestSchema = z.object({
  sectionCount: z.number().int().min(3).max(500),
  radius: z.number().finite().gt(0),
  halfWidth: z.number().finite().gt(0),
  halfTwists: z.number().int(),
}).strict().superRefine((value, context) => {
  if (value.halfWidth >= value.radius || !Number.isFinite(value.radius + value.halfWidth)) {
    context.addIssue({ code: 'custom', path: ['halfWidth'], message: 'Half width must be smaller than the radius, with finite outer radius.' })
  }
  if (2 * Math.abs(value.halfTwists) >= value.sectionCount) {
    context.addIssue({ code: 'custom', path: ['halfTwists'], message: 'Use enough sections to keep each half-twist step below 90 degrees.' })
  }
})
