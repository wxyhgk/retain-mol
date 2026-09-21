/** Internal convex-distance witnesses and conservative projection lower bounds. */
export type Point = readonly [number, number, number]

export const subtract = (first: Point, second: Point): Point => [first[0] - second[0], first[1] - second[1], first[2] - second[2]]
export const dot = (first: Point, second: Point): number => first[0] * second[0] + first[1] * second[1] + first[2] * second[2]
export const norm = (point: Point): number => Math.hypot(...point)
export const interpolate = (first: Point, second: Point, time: number): Point => [first[0] * (1 - time) + second[0] * time, first[1] * (1 - time) + second[1] * time, first[2] * (1 - time) + second[2] * time]
const clamp = (value: number): number => Math.max(0, Math.min(1, value))

function closestPoint(point: Point, start: Point, end: Point): Point {
  const direction = subtract(end, start)
  const squaredLength = dot(direction, direction)
  const time = squaredLength === 0 ? 0 : clamp(dot(subtract(point, start), direction) / squaredLength)
  return interpolate(start, end, time)
}

/**
 * An upper bound is witnessed by two points inside the primitives. A lower
 * bound comes from projecting both convex primitives onto a unit direction.
 * An inaccurate nearly-parallel closest-point estimate can only weaken this
 * certificate; it cannot turn the upper-bound estimate into proof of safety.
 */
export function distanceBounds(first: readonly Point[], second: readonly Point[], margin: number): { lower: number; upper: number } {
  let bestFirst = first[0]!
  let bestSecond = second[0]!
  let upper = norm(subtract(bestFirst, bestSecond))
  const consider = (left: Point, right: Point): void => {
    const candidate = norm(subtract(left, right))
    if (candidate < upper) { upper = candidate; bestFirst = left; bestSecond = right }
  }
  if (second.length === 2) for (const point of first) consider(point, closestPoint(point, second[0]!, second[1]!))
  if (first.length === 2) for (const point of second) consider(closestPoint(point, first[0]!, first[1]!), point)
  if (first.length === 2 && second.length === 2) {
    const left = subtract(first[1]!, first[0]!)
    const right = subtract(second[1]!, second[0]!)
    const offset = subtract(first[0]!, second[0]!)
    const aa = dot(left, left), bb = dot(left, right), cc = dot(right, right)
    const dd = dot(left, offset), ee = dot(right, offset)
    const determinant = aa * cc - bb * bb
    if (determinant > Number.EPSILON * aa * cc * 16) {
      const leftTime = (bb * ee - cc * dd) / determinant
      const rightTime = (aa * ee - bb * dd) / determinant
      if (leftTime >= 0 && leftTime <= 1 && rightTime >= 0 && rightTime <= 1) consider(interpolate(first[0]!, first[1]!, leftTime), interpolate(second[0]!, second[1]!, rightTime))
    }
  }
  const direction = subtract(bestFirst, bestSecond)
  const length = norm(direction)
  if (length === 0) return { lower: 0, upper }
  // Dividing once more by a small inflation guarantees a direction norm below
  // one despite rounding. Working relative to an input vertex reduces offsets.
  const divisor = length * (1 + 16 * Number.EPSILON)
  const axis: Point = [direction[0] / divisor, direction[1] / divisor, direction[2] / divisor]
  const reference = first[0]!
  const left = first.map(point => dot(subtract(point, reference), axis))
  const right = second.map(point => dot(subtract(point, reference), axis))
  const separation = Math.max(Math.min(...left) - Math.max(...right), Math.min(...right) - Math.max(...left), 0)
  return { lower: Math.max(0, separation - margin), upper }
}
