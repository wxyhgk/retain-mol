export interface GesturePoint2 {
  readonly x: number
  readonly y: number
}

export interface GesturePoint3 {
  readonly x: number
  readonly y: number
  readonly z: number
}

export type InteractionGestureState =
  | { readonly kind: 'idle' }
  | {
      readonly kind: 'atom-press'
      readonly atomId: string
      readonly down: GesturePoint2
    }
  | {
      readonly kind: 'atom-drag'
      readonly atomId: string
      readonly down: GesturePoint2
    }
  | {
      readonly kind: 'bond-press'
      readonly sourceId: string
      readonly down: GesturePoint2
    }
  | {
      readonly kind: 'bond-drag'
      readonly sourceId: string
      readonly down: GesturePoint2
      readonly targetId: string | null
      readonly dropPosition: GesturePoint3 | null
    }
  | {
      readonly kind: 'fragment-press'
      readonly targetId: string
      readonly down: GesturePoint2
    }
  | {
      readonly kind: 'fragment-torsion'
      readonly targetId: string
      readonly down: GesturePoint2
      readonly angleDegrees: number
    }

export const idleInteractionGesture = (): InteractionGestureState => ({ kind: 'idle' })

export function beginAtomPress(atomId: string, down: GesturePoint2): InteractionGestureState {
  return { kind: 'atom-press', atomId, down: { ...down } }
}

export function beginBondPress(sourceId: string, down: GesturePoint2): InteractionGestureState {
  return { kind: 'bond-press', sourceId, down: { ...down } }
}

export function beginFragmentPress(targetId: string, down: GesturePoint2): InteractionGestureState {
  return { kind: 'fragment-press', targetId, down: { ...down } }
}

export function advanceInteractionGesture(
  state: InteractionGestureState,
  point: GesturePoint2,
  dragStartThreshold: number,
): InteractionGestureState {
  if (state.kind !== 'atom-press' && state.kind !== 'bond-press' && state.kind !== 'fragment-press') return state
  if (distance2(state.down, point) < dragStartThreshold) return state
  if (state.kind === 'fragment-press') {
    return { kind: 'fragment-torsion', targetId: state.targetId, down: state.down, angleDegrees: 0 }
  }
  return state.kind === 'atom-press'
    ? { kind: 'atom-drag', atomId: state.atomId, down: state.down }
    : {
        kind: 'bond-drag',
        sourceId: state.sourceId,
        down: state.down,
        targetId: null,
        dropPosition: null,
      }
}

export function updateFragmentTorsionAngle(
  state: InteractionGestureState,
  angleDegrees: number,
): InteractionGestureState {
  return state.kind === 'fragment-torsion' ? { ...state, angleDegrees } : state
}

export function updateBondDragTarget(
  state: InteractionGestureState,
  targetId: string | null,
  dropPosition: GesturePoint3 | null,
): InteractionGestureState {
  if (state.kind !== 'bond-drag') return state
  return {
    ...state,
    targetId,
    dropPosition: dropPosition ? { ...dropPosition } : null,
  }
}

export function isAtomGesture(
  state: InteractionGestureState,
): state is Extract<InteractionGestureState, { kind: 'atom-press' | 'atom-drag' }> {
  return state.kind === 'atom-press' || state.kind === 'atom-drag'
}

export function isBondGesture(
  state: InteractionGestureState,
): state is Extract<InteractionGestureState, { kind: 'bond-press' | 'bond-drag' }> {
  return state.kind === 'bond-press' || state.kind === 'bond-drag'
}

export function isFragmentGesture(
  state: InteractionGestureState,
): state is Extract<InteractionGestureState, { kind: 'fragment-press' | 'fragment-torsion' }> {
  return state.kind === 'fragment-press' || state.kind === 'fragment-torsion'
}

export function activeAtomDragId(state: InteractionGestureState): string | null {
  return state.kind === 'atom-drag' ? state.atomId : null
}

function distance2(a: GesturePoint2, b: GesturePoint2): number {
  return Math.hypot(b.x - a.x, b.y - a.y)
}
