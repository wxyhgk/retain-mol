import { z } from 'zod'

const finite = z.number().finite().nonnegative()
export const decisionRequestSchema = z.object({
  baseRevision: z.string().min(1).max(200),
  preference: z.enum(['spread', 'minimal']),
  instruction: z.string().max(2000),
  topology: z.object({ formula: z.string().max(40), atomCount: finite, bondCount: finite, fixedAtomCount: finite, rotatableBondId: z.string().max(200) }).strict(),
  geometry: z.object({ unit: z.literal('angstrom'), policyVersion: z.literal('ch-contact-v1') }).strict(),
  diagnostics: z.object({ hardClashCount: finite, crowdingScore: finite }).strict(),
  candidates: z.array(z.object({
    id: z.string().regex(/^torsion-(?:0|[1-9]\d{0,2})$/),
    angleDegrees: finite.max(345),
    hardClashCount: z.literal(0),
    metrics: z.object({ crowdingScore: finite, displacementRms: finite, spreadRadius: finite }).strict(),
  }).strict()).min(1).max(6),
}).strict().refine(v => new Set(v.candidates.map(c => c.id)).size === v.candidates.length, '候选 ID 重复')
export type DecisionRequest = z.infer<typeof decisionRequestSchema>
export interface DecisionResponse {
  readonly baseRevision: string
  readonly choice: string
  readonly confidence: number
  readonly probabilities: Readonly<Record<string, number>>
  readonly model: string
  readonly elapsedMs: number
}

export function parseDecisionResponse(value: unknown, request: DecisionRequest): DecisionResponse {
  const parsed = z.object({ baseRevision: z.literal(request.baseRevision), choice: z.string(),
    confidence: finite.max(1), probabilities: z.record(z.string(), finite.max(1)),
    model: z.string().min(1).max(120), elapsedMs: finite }).strict().parse(value)
  const ids = [...request.candidates.map(c => c.id), 'none']
  if (!ids.includes(parsed.choice) || Object.keys(parsed.probabilities).length !== ids.length ||
      ids.some(id => parsed.probabilities[id] === undefined) ||
      Math.abs(Object.values(parsed.probabilities).reduce((a, b) => a + b, 0) - 1) > 0.02) {
    throw new Error('Jev 返回的选择或概率不属于本次候选集合')
  }
  return parsed
}
