import type { Molecule, Vector3Data } from '../../model/types'
import type { GeometryConstraint } from '../constrained/contracts'
import { validateRibbonRegion } from './region'
import type {
  GeometryRibbonGuide, GeometryRibbonGuideConstraintOptions, GeometryRibbonGuideConstraintsResult,
  GeometryRibbonGuideRequest, GeometryRibbonGuideResult, GeometryRibbonGuideSection,
  GeometryRibbonIssue, GeometryRibbonRegion,
} from './contracts'

function invalid(message: string): GeometryRibbonIssue {
  return { code: 'invalid-guide', message, atomIds: [] }
}

/** Generate an analytic circular ribbon guide, never a chemical molecule or a stored-coordinate lookup. */
export function createRibbonGuide(request: GeometryRibbonGuideRequest): GeometryRibbonGuideResult {
  if (!request || typeof request !== 'object') return { ok: false, issues: [invalid('Ribbon guide requires a parameter object.')] }
  const { sectionCount, radius, halfWidth, halfTwists } = request
  if (!Number.isInteger(sectionCount) || sectionCount < 3 || sectionCount > 500) {
    return { ok: false, issues: [invalid('Section count must be an integer from 3 through 500.')] }
  }
  if (!Number.isFinite(radius) || !Number.isFinite(halfWidth) || halfWidth <= 0 || radius <= halfWidth
    || !Number.isFinite(radius + halfWidth)) {
    return { ok: false, issues: [invalid('Radius and half width must be finite and positive, with half width smaller than radius.')] }
  }
  if (!Number.isInteger(halfTwists) || 2 * Math.abs(halfTwists) >= sectionCount) {
    return { ok: false, issues: [invalid('Half twists must be an integer with fewer than 90 degrees of intended twist per sampled interval.')] }
  }
  const sections: GeometryRibbonGuideSection[] = Array.from({ length: sectionCount }, (_, index) => {
    const theta = 2 * Math.PI * index / sectionCount
    const twist = halfTwists * theta / 2
    const radialX = Math.cos(theta)
    const radialY = Math.sin(theta)
    const center = { x: radius * radialX, y: radius * radialY, z: 0 }
    // For a forward tangent (-sin(theta), cos(theta), 0), its right-hand
    // rotation carries the radial direction towards negative z.
    const offset = { x: halfWidth * Math.cos(twist) * radialX, y: halfWidth * Math.cos(twist) * radialY, z: -halfWidth * Math.sin(twist) }
    return {
      center,
      left: { x: center.x + offset.x, y: center.y + offset.y, z: offset.z },
      right: { x: center.x - offset.x, y: center.y - offset.y, z: -offset.z },
    }
  })
  if (sections.some(section => [section.center, section.left, section.right].some(point => ![point.x, point.y, point.z].every(Number.isFinite)))) {
    return { ok: false, issues: [invalid('Ribbon parameters do not produce finite coordinates.')] }
  }
  if (sections.some((section, index) => {
    const next = sections[(index + 1) % sectionCount]!
    return Math.hypot(section.left.x - section.right.x, section.left.y - section.right.y, section.left.z - section.right.z) === 0
      || Math.hypot(section.center.x - next.center.x, section.center.y - next.center.y, section.center.z - next.center.z) === 0
  })) return { ok: false, issues: [invalid('Ribbon dimensions are too small to represent distinct section points.')] }
  return {
    ok: true,
    guide: { kind: 'circular-ribbon-guide', unit: 'angstrom', sectionCount, radius, halfWidth, halfTwists,
      closure: Math.abs(halfTwists) % 2 === 1 ? 'crossed' : 'parallel', sections },
  }
}

function samePoint(actual: Vector3Data, expected: Vector3Data): boolean {
  return actual !== null && typeof actual === 'object' && (['x', 'y', 'z'] as const).every(axis =>
    Number.isFinite(actual[axis]) && Math.abs(actual[axis] - expected[axis]) <= 1e-12 * Math.max(1, Math.abs(expected[axis])))
}

/** Recompute the declared analytic guide so inconsistent serialized payloads cannot supply hidden targets. */
function checkGuide(guide: GeometryRibbonGuide): readonly GeometryRibbonIssue[] {
  const expected = createRibbonGuide(guide)
  if (expected.ok === false) return expected.issues
  if (guide.kind !== expected.guide.kind || guide.unit !== 'angstrom' || guide.closure !== expected.guide.closure
    || !Array.isArray(guide.sections) || guide.sections.length !== expected.guide.sections.length) {
    return [invalid('Guide kind, unit, closure, or section count does not match its declared parameters.')]
  }
  for (let index = 0; index < guide.sections.length; index += 1) {
    const actual = guide.sections[index]
    const intended = expected.guide.sections[index]!
    if (!actual || !samePoint(actual.center, intended.center) || !samePoint(actual.left, intended.left) || !samePoint(actual.right, intended.right)) {
      return [{ ...invalid('Guide coordinates do not match the declared analytic circular ribbon.'), sectionIndex: index }]
    }
  }
  return []
}

/**
 * Map ordered guide targets to explicit region atom IDs as existing soft
 * position constraints. Does not change coordinates or authorize a commit.
 * A closed region must agree with the guide's seam; an open region has no seam.
 */
export function compileRibbonGuideConstraints(
  molecule: Molecule,
  region: GeometryRibbonRegion,
  guide: GeometryRibbonGuide,
  options: GeometryRibbonGuideConstraintOptions,
): GeometryRibbonGuideConstraintsResult {
  const validation = validateRibbonRegion(molecule, region)
  if (!validation.ok) return { ok: false, issues: validation.issues }
  const guideIssues = checkGuide(guide)
  if (guideIssues.length > 0) return { ok: false, issues: guideIssues }
  if (guide.sections.length !== region.sections.length || (region.closure !== 'open' && region.closure !== guide.closure)) {
    return { ok: false, issues: [invalid('Guide section count and closed seam must match the supplied region.')] }
  }
  if (!options || !Number.isFinite(options.tolerance) || options.tolerance < 0
    || (options.weight !== undefined && (!Number.isFinite(options.weight) || options.weight <= 0))) {
    return { ok: false, issues: [invalid('Guide constraint tolerance must be finite and nonnegative; optional weight must be finite and positive.')] }
  }
  const constraints: GeometryConstraint[] = []
  for (const [index, section] of region.sections.entries()) {
    for (const side of ['left', 'right'] as const) {
      const constraintId = `ribbon:${region.id}:${index}:${side}`
      if (constraintId.length > 128) return { ok: false, issues: [invalid('Region ID is too long for a generated modeling constraint ID.')] }
      constraints.push({
        id: constraintId, kind: 'position', strength: 'soft',
        atomId: side === 'left' ? section.leftAtomId : section.rightAtomId,
        target: { ...guide.sections[index]![side] }, tolerance: options.tolerance,
        ...(options.weight === undefined ? {} : { weight: options.weight }),
      })
    }
  }
  return { ok: true, atomIds: validation.atomIds, constraints }
}
