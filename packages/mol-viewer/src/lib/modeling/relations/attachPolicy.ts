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

const distance = Object.freeze<NumericToleranceBand>({
  absolutePass: 1e-9,
  relativePass: 1e-12,
  absoluteReject: 1e-6,
  relativeReject: 1e-9,
})

export const FRAGMENT_ATTACH_RELATION_POLICY = Object.freeze({
  coordinate,
  distance,
  degenerateAxisLength: 1e-10,
  certainAxisLength: 1e-7,
  degenerateOrientationDistance: 1e-10,
  certainOrientationDistance: 1e-7,
  chiralityVolume: 1e-10,
  maxAbsoluteTorsionDegrees: 360,
  maxReliableCoordinateMagnitude: 2e12,
  maxBeforeAtoms: 316,
  maxBeforeBonds: 1_000,
  maxCandidateAtoms: 316,
  maxCandidateBonds: 1_000,
  maxTemplateAtoms: 64,
  maxTemplateBonds: 256,
})

export type FragmentAttachNumericAssessment = 'pass' | 'reject' | 'indeterminate'

export function assessFragmentAttachDeviation(
  deviation: number,
  scale: number,
  band: NumericToleranceBand,
): FragmentAttachNumericAssessment {
  if (!Number.isFinite(deviation) || !Number.isFinite(scale)) return 'indeterminate'
  const normalizedScale = Math.max(1, Math.abs(scale))
  const passLimit = band.absolutePass + band.relativePass * normalizedScale
  const rejectLimit = band.absoluteReject + band.relativeReject * normalizedScale
  if (deviation <= passLimit) return 'pass'
  if (deviation > rejectLimit) return 'reject'
  return 'indeterminate'
}
