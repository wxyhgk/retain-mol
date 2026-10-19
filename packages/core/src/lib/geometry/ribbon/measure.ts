import type { Molecule, Vector3Data } from '../../model/types'
import { cross, dot } from '../../math/vec3'
import type { Vec3 } from '../../math/vec3'
import { validateRibbonRegion } from './region'
import type { GeometryRibbonIssue, GeometryRibbonMeasurements, GeometryRibbonRegion } from './contracts'

const EPSILON = 1e-10

function difference(first: Vector3Data, second: Vector3Data): Vec3 {
  return [first.x - second.x, first.y - second.y, first.z - second.z]
}

function unit(vector: Vec3): Vec3 | null {
  const length = Math.hypot(...vector)
  return Number.isFinite(length) && length > EPSILON
    ? [vector[0] / length, vector[1] / length, vector[2] / length] : null
}

function transverse(vector: Vec3, tangent: Vec3): Vec3 | null {
  const normalized = unit(vector)
  if (!normalized) return null
  const along = dot(normalized, tangent)
  return unit([
    normalized[0] - along * tangent[0], normalized[1] - along * tangent[1], normalized[2] - along * tangent[2],
  ])
}

/** Minimal proper rotation mapping the first tangent to the next tangent. */
function transport(vector: Vec3, from: Vec3, to: Vec3): Vec3 | null {
  const axis = cross(from, to)
  const sine = Math.hypot(...axis)
  const cosine = Math.max(-1, Math.min(1, dot(from, to)))
  if (sine <= EPSILON) return cosine > 0 ? vector : null
  const normal: Vec3 = [axis[0] / sine, axis[1] / sine, axis[2] / sine]
  const crossed = cross(normal, vector)
  const along = dot(normal, vector) * (1 - cosine)
  return [
    vector[0] * cosine + crossed[0] * sine + normal[0] * along,
    vector[1] * cosine + crossed[1] * sine + normal[1] * along,
    vector[2] * cosine + crossed[2] * sine + normal[2] * along,
  ]
}

/**
 * Measure widths and local material-frame turns of an explicitly ordered
 * region. Centerline tangents use centered finite differences (one-sided at
 * open ends); adjacent transverse widths are compared after minimal tangent
 * transport. This discrete convention is not a global topological invariant.
 */
export function measureRibbonGeometry(molecule: Molecule, region: GeometryRibbonRegion): GeometryRibbonMeasurements {
  const validation = validateRibbonRegion(molecule, region)
  if (!validation.ok) return { ...validation, widthsAngstrom: [], turnsDegrees: [] }
  const issues: GeometryRibbonIssue[] = []
  const atoms = new Map(molecule.atoms.map(atom => [atom.id, atom]))
  const centers: Vector3Data[] = []
  const widthVectors: Vec3[] = []
  const widthsAngstrom: (number | null)[] = []
  const reject = (message: string, sectionIndex: number): void => {
    const section = region.sections[sectionIndex]!
    issues.push({ code: 'degenerate-geometry', message, sectionIndex, atomIds: [section.leftAtomId, section.rightAtomId] })
  }
  for (const [index, section] of region.sections.entries()) {
    const left = atoms.get(section.leftAtomId)!
    const right = atoms.get(section.rightAtomId)!
    centers.push({ x: left.x / 2 + right.x / 2, y: left.y / 2 + right.y / 2, z: left.z / 2 + right.z / 2 })
    const vector = difference(left, right)
    widthVectors.push(vector)
    const width = Math.hypot(...vector)
    widthsAngstrom.push(Number.isFinite(width) ? width : null)
    if (!Number.isFinite(width) || width <= EPSILON) reject('Section width is zero or cannot be measured.', index)
  }
  const count = centers.length
  const tangents = centers.map((center, index) => {
    const previous = index > 0 ? centers[index - 1]! : region.closure === 'open' ? center : centers[count - 1]!
    const next = index < count - 1 ? centers[index + 1]! : region.closure === 'open' ? center : centers[0]!
    const tangent = unit(difference(next, previous))
    if (!tangent) reject('Centerline tangent is undefined for coincident or reversing centers.', index)
    return tangent
  })
  const widths = widthVectors.map((vector, index) => {
    const tangent = tangents[index]
    const width = tangent ? transverse(vector, tangent) : null
    if (!width && tangent) reject('Section width is parallel to its centerline tangent or degenerate.', index)
    return width
  })
  const turnsDegrees: (number | null)[] = []
  const stepCount = region.closure === 'open' ? count - 1 : count
  for (let index = 0; index < stepCount; index += 1) {
    const nextIndex = (index + 1) % count
    const firstTangent = tangents[index]
    const nextTangent = tangents[nextIndex]
    const firstWidth = widths[index]
    const nextWidth = widths[nextIndex]
    let turn: number | null = null
    if (firstTangent && nextTangent && firstWidth && nextWidth) {
      const moved = transport(firstWidth, firstTangent, nextTangent)
      const from = moved ? transverse(moved, nextTangent) : null
      const seamSign = nextIndex === 0 && region.closure === 'crossed' ? -1 : 1
      const to: Vec3 = [nextWidth[0] * seamSign, nextWidth[1] * seamSign, nextWidth[2] * seamSign]
      if (from) {
        const sine = dot(nextTangent, cross(from, to))
        const cosine = Math.max(-1, Math.min(1, dot(from, to)))
        // An exact half-turn has two equally short signed rotations.
        if (!(Math.abs(sine) <= EPSILON && cosine < 0)) {
          const degrees = Math.atan2(sine, cosine) * 180 / Math.PI
          turn = Math.abs(degrees) <= EPSILON ? 0 : degrees
        }
      }
    }
    turnsDegrees.push(turn)
    if (turn === null) reject('Adjacent-section turn is undefined or has an ambiguous antipodal rotation.', index)
  }
  return { ok: issues.length === 0, atomIds: validation.atomIds, widthsAngstrom, turnsDegrees, issues }
}
