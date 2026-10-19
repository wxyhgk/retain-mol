import type { ReactionHighlightKind } from '../lib/reactionHighlights'

export interface ReactionHighlightStyle {
  readonly color: string
  readonly radius: number
  readonly dashed: boolean
  readonly opacity: number
}

export const REACTION_HIGHLIGHT_STYLES: Readonly<
  Record<ReactionHighlightKind, ReactionHighlightStyle>
> = {
  breaking: {
    color: '#ef4444',
    radius: 0.075,
    dashed: true,
    opacity: 0.95,
  },
  forming: {
    color: '#22c55e',
    radius: 0.075,
    dashed: true,
    opacity: 0.95,
  },
  coordination: {
    color: '#3b82f6',
    radius: 0.045,
    dashed: true,
    opacity: 0.9,
  },
}

export const REACTION_HIGHLIGHT_GEOMETRY = {
  dashCount: 9,
  dashFillRatio: 0.58,
  radialSegments: 12,
  endpointScale: 2.4,
  endpointOpacityScale: 0.32,
  labelWidth: 256,
  labelHeight: 64,
  labelWorldWidth: 1.2,
} as const
