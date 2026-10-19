import type { Molecule } from '../../../molecule'
import type { FragmentDef } from '../../fragmentLibrary'
import {
  isBetterPlacementScore,
  scoreMoleculePlacement,
} from '../../geometry/placementPlanner'
import {
  add,
  applyQuat,
  cross,
  dot,
  length,
  multiplyQuats,
  normalize,
  quatFromAxisAngle,
  quatFromUnitVectors,
  scale,
  sub,
  type Quat,
  type Vec3,
} from '../../math'
import { instantiate } from './instantiate'
import type { BridgePlacement, BridgeTarget, FragmentBridgeSlots } from './bridgeTypes'

const EPSILON = 1e-8
const ORIENTATION_SAMPLE_COUNT = 24
const ANGLE_TOLERANCE_RADIANS = 15 * Math.PI / 180

export function resolveFragmentBridgeSlots(fragment: FragmentDef): FragmentBridgeSlots | string {
  const bridge = fragment.bridgeAttachment
  if (!bridge) return '模板没有声明 bridgeAttachment 双锚点元数据'
  const center = fragment.atoms[bridge.centerIndex]
  if (!center || center.symbol === 'H') return '双锚点模板的连接中心无效'
  const [firstSite, secondSite] = bridge.sites
  const firstIndex = firstSite.leavingHydrogenIndex
  const secondIndex = secondSite.leavingHydrogenIndex
  const first = fragment.atoms[firstIndex]
  const second = fragment.atoms[secondIndex]
  if (first?.symbol !== 'H' || second?.symbol !== 'H') return '双锚点模板的离去位点必须是 H'

  const centerPosition: Vec3 = [center.x, center.y, center.z]
  const firstDirection = sub([first.x, first.y, first.z], centerPosition)
  const secondDirection = sub([second.x, second.y, second.z], centerPosition)
  if (length(firstDirection) < EPSILON || length(secondDirection) < EPSILON) {
    return '双锚点模板的离去方向无效'
  }
  return {
    centerIndex: bridge.centerIndex,
    center: centerPosition,
    leavingHydrogenIndices: [firstIndex, secondIndex],
    orders: [firstSite.order, secondSite.order],
    directions: [normalize(firstDirection), normalize(secondDirection)],
  }
}

function orthogonalUnit(axis: Vec3): Vec3 {
  const reference: Vec3 = Math.abs(axis[2]) < 0.8 ? [0, 0, 1] : [0, 1, 0]
  return normalize(cross(axis, reference))
}

function signedAngleAround(from: Vec3, to: Vec3, axis: Vec3): number {
  const fromPlane = sub(from, scale(axis, dot(from, axis)))
  const toPlane = sub(to, scale(axis, dot(to, axis)))
  if (length(fromPlane) < EPSILON || length(toPlane) < EPSILON) return 0
  const fromUnit = normalize(fromPlane)
  const toUnit = normalize(toPlane)
  return Math.atan2(dot(axis, cross(fromUnit, toUnit)), dot(fromUnit, toUnit))
}

function alignSiteDirections(
  source1: Vec3,
  source2: Vec3,
  target1: Vec3,
  target2: Vec3,
): Quat {
  const firstRotation = quatFromUnitVectors(source1, target1)
  const mappedSecond = applyQuat(source2, firstRotation)
  const roll = signedAngleAround(mappedSecond, target2, target1)
  return multiplyQuats(quatFromAxisAngle(target1, roll), firstRotation)
}

export function chooseBridgePlacement(
  molecule: Molecule,
  fragment: FragmentDef,
  slots: FragmentBridgeSlots,
  first: BridgeTarget,
  second: BridgeTarget,
  orientationDegrees?: number,
): BridgePlacement | string {
  const firstPoint: Vec3 = [first.host.x, first.host.y, first.host.z]
  const secondPoint: Vec3 = [second.host.x, second.host.y, second.host.z]
  const delta = sub(secondPoint, firstPoint)
  const targetDistance = length(delta)
  if (targetDistance < EPSILON) return '两个连接宿主的位置重合'
  if (
    targetDistance > first.bondLength + second.bondLength + EPSILON
    || targetDistance < Math.abs(first.bondLength - second.bondLength) - EPSILON
  ) {
    return `两个目标间距 ${targetDistance.toFixed(3)} Å 无法同时满足模板连接键长`
  }

  const axis = normalize(delta)
  const along = (
    first.bondLength * first.bondLength
    - second.bondLength * second.bondLength
    + targetDistance * targetDistance
  ) / (2 * targetDistance)
  const radius = Math.sqrt(Math.max(0, first.bondLength * first.bondLength - along * along))
  const circleOrigin = add(firstPoint, scale(axis, along))
  const sourceAngle = Math.acos(Math.max(-1, Math.min(1, dot(slots.directions[0], slots.directions[1]))))
  const sampleCenter = add(circleOrigin, scale(orthogonalUnit(axis), radius))
  const targetAngle = Math.acos(Math.max(-1, Math.min(1, dot(
    normalize(sub(firstPoint, sampleCenter)),
    normalize(sub(secondPoint, sampleCenter)),
  ))))
  if (Math.abs(sourceAngle - targetAngle) > ANGLE_TOLERANCE_RADIANS) {
    return `两个目标形成的夹角 ${(targetAngle * 180 / Math.PI).toFixed(1)}° 与模板位点夹角 ${(sourceAngle * 180 / Math.PI).toFixed(1)}° 不兼容`
  }

  const preferred = add(first.preferredDirection, second.preferredDirection)
  const preferredPlane = sub(preferred, scale(axis, dot(preferred, axis)))
  const basisU = length(preferredPlane) > EPSILON ? normalize(preferredPlane) : orthogonalUnit(axis)
  const basisV = normalize(cross(axis, basisU))
  const angles = orientationDegrees === undefined
    ? Array.from({ length: ORIENTATION_SAMPLE_COUNT }, (_, index) => 2 * Math.PI * index / ORIENTATION_SAMPLE_COUNT)
    : [orientationDegrees * Math.PI / 180]
  const excludedAtomIds = new Set([
    first.host.id,
    second.host.id,
    ...first.removeAtomIds,
    ...second.removeAtomIds,
  ])
  const skipIndices = new Set(slots.leavingHydrogenIndices)
  let best: BridgePlacement | null = null

  for (const angle of angles) {
    const radial = add(scale(basisU, Math.cos(angle)), scale(basisV, Math.sin(angle)))
    const center = add(circleOrigin, scale(radial, radius))
    const targetDirection1 = normalize(sub(firstPoint, center))
    const targetDirection2 = normalize(sub(secondPoint, center))
    const rotation = alignSiteDirections(
      slots.directions[0],
      slots.directions[1],
      targetDirection1,
      targetDirection2,
    )
    const { atoms } = instantiate(
      fragment,
      point => add(applyQuat(sub(point, slots.center), rotation), center),
      skipIndices,
    )
    const score = scoreMoleculePlacement(molecule.atoms, {
      name: `${fragment.name} bridge preview`,
      atoms,
      bonds: [],
    }, { excludeAtomIds: excludedAtomIds })
    const directionPenalty = (
      1 - dot(normalize(sub(center, firstPoint)), first.preferredDirection)
      + 1 - dot(normalize(sub(center, secondPoint)), second.preferredDirection)
    )
    const candidate = { center, rotation, score, directionPenalty }
    if (
      best === null
      || isBetterPlacementScore(candidate.score, best.score)
      || (
        !isBetterPlacementScore(best.score, candidate.score)
        && candidate.directionPenalty < best.directionPenalty - EPSILON
      )
    ) best = candidate
  }

  return best ?? '无法生成双锚点模板姿态'
}
