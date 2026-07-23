import type { BondPairGizmoValue } from '../bondPairGizmo'

export const BOND_PAIR_GIZMO_MIN_AXIS_ANGLE = 0.5
export const BOND_PAIR_GIZMO_MAX_AXIS_ANGLE = 179.5

export function normalizeDegrees(value: number): number {
  if (!Number.isFinite(value)) return 0
  const normalized = value % 360
  return normalized < 0 ? normalized + 360 : normalized
}

/** Continue an atan2-style angle across the ±180° seam without jumps. */
export function unwrapAngleDegrees(
  previousContinuousDegrees: number,
  nextWrappedDegrees: number,
): number {
  const previousWrapped = normalizeDegrees(previousContinuousDegrees)
  let delta = normalizeDegrees(nextWrappedDegrees) - previousWrapped
  if (delta > 180) delta -= 360
  if (delta < -180) delta += 360
  return previousContinuousDegrees + delta
}

export function applyGizmoAngleModifiers(
  rawDeltaDegrees: number,
  options: { readonly shiftKey: boolean; readonly altKey: boolean },
): number {
  const fineDelta = options.altKey ? rawDeltaDegrees * 0.2 : rawDeltaDegrees
  return options.shiftKey ? Math.round(fineDelta / 5) * 5 : fineDelta
}

export function clampAxisAngleDegrees(value: number): number {
  return Math.min(
    BOND_PAIR_GIZMO_MAX_AXIS_ANGLE,
    Math.max(BOND_PAIR_GIZMO_MIN_AXIS_ANGLE, value),
  )
}

export function applyBondPairGizmoDelta(
  start: BondPairGizmoValue,
  kind: 'azimuth' | 'axis-angle',
  deltaDegrees: number,
): BondPairGizmoValue {
  if (kind === 'azimuth') {
    return {
      ...start,
      azimuthDegrees: start.azimuthDegrees + deltaDegrees,
    }
  }
  return {
    ...start,
    axisAngleDegrees: clampAxisAngleDegrees(start.axisAngleDegrees + deltaDegrees),
  }
}
