import { z } from 'zod'
import type { DisplayMode } from '../lib/types'

const Metadata = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().default(''),
  source: z.string().optional(),
  author: z.string().optional(),
  version: z.string().default('1.0.0'),
})

export const RenderStyleSchema = z.union([
  z.literal('realistic'),
  z.literal('publication'),
  z.literal('iboview'),
]).or(z.string().min(1))

export type RenderStyle = z.infer<typeof RenderStyleSchema>

export const StylePresetSchema = z.object({
  $schemaVersion: z.literal('1'),
  kind: z.literal('molecular-style-preset'),
  metadata: Metadata,
  extends: z.string().optional(),
  displayMode: z.enum(['ball-stick', 'spacefill', 'stick', 'wireframe', 'tube', 'mtube']).optional(),
  themeId: z.string().min(1).optional(),
  renderStyle: RenderStyleSchema.optional(),
  showAtomLabels: z.boolean().optional(),
}).superRefine((preset, ctx) => {
  if (preset.extends) return
  for (const key of ['displayMode', 'themeId', 'renderStyle'] as const) {
    if (preset[key] === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: [key],
        message: `${key} is required unless the style preset extends another preset`,
      })
    }
  }
})

export type StylePreset = z.infer<typeof StylePresetSchema>

export interface ResolvedStylePreset {
  metadata: StylePreset['metadata']
  displayMode: DisplayMode
  themeId: string
  renderStyle: RenderStyle
  showAtomLabels?: boolean
}
