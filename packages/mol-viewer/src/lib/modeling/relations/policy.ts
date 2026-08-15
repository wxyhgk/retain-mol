interface NumericToleranceBand {
  readonly absolutePass: number
  readonly relativePass: number
  readonly absoluteReject: number
  readonly relativeReject: number
}

const coordinate = Object.freeze<NumericToleranceBand>({
  absolutePass: 1e-9,
  relativePass: 1e-12,
  absoluteReject: 1e-6,
  relativeReject: 1e-9,
})

const rotationCoordinate = Object.freeze<NumericToleranceBand>({
  absolutePass: 1e-9,
  relativePass: Number.EPSILON * 2,
  absoluteReject: 1e-6,
  relativeReject: Number.EPSILON * 32,
})

const distance = Object.freeze<NumericToleranceBand>({
  absolutePass: 1e-9,
  relativePass: 1e-12,
  absoluteReject: 1e-6,
  relativeReject: 1e-9,
})

const angleRadians = Object.freeze<NumericToleranceBand>({
  absolutePass: 1e-10,
  relativePass: 0,
  absoluteReject: 1e-7,
  relativeReject: 0,
})

/** Trusted internal policy. Public callers cannot supply or override these values. */
export const ROTATE_GROUP_RELATION_POLICY = Object.freeze({
  coordinate,
  rotationCoordinate,
  distance,
  angleRadians,
  degenerateAxisLength: 1e-10,
  certainAxisLength: 1e-7,
  degenerateRadialDistance: 1e-10,
  certainRadialDistance: 1e-7,
  maxAbsoluteAngleDegrees: 360,
  maxReliableCoordinateMagnitude: 2e12,
  maxBeforeAtoms: 316,
  maxBeforeBonds: 1_000,
  maxCandidateAtoms: 316,
  maxCandidateBonds: 1_000,
})

export type NumericAssessment = 'pass' | 'reject' | 'indeterminate'

export function assessNumericDeviation(
  deviation: number,
  scale: number,
  band: NumericToleranceBand,
): NumericAssessment {
  if (!Number.isFinite(deviation) || !Number.isFinite(scale)) return 'indeterminate'
  const normalizedScale = Math.max(1, Math.abs(scale))
  const passLimit = band.absolutePass + band.relativePass * normalizedScale
  const rejectLimit = band.absoluteReject + band.relativeReject * normalizedScale
  if (deviation <= passLimit) return 'pass'
  if (deviation > rejectLimit) return 'reject'
  return 'indeterminate'
}
