export type ReactionHighlightKind = 'breaking' | 'forming' | 'coordination'

export interface ReactionHighlight {
  readonly id: string
  readonly atomId1: string
  readonly atomId2: string
  readonly kind: ReactionHighlightKind
  readonly label?: string
  readonly color?: string
  readonly radius?: number
  readonly dashed?: boolean
  readonly opacity?: number
}
