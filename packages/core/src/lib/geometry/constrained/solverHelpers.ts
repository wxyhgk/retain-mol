/** Bounded sparse damped least-squares primitives; no molecular policy. */
export interface NumericalTerm {
  readonly variables: readonly number[]
  readonly value: () => number
}

export interface JacobianRow {
  readonly residual: number
  readonly entries: readonly { readonly index: number; readonly derivative: number }[]
}

export function objective(terms: readonly NumericalTerm[]): number {
  let sum = 0
  for (const term of terms) {
    const value = term.value()
    if (!Number.isFinite(value)) return Infinity
    sum += value * value
  }
  return sum
}

export function numericalJacobian(
  terms: readonly NumericalTerm[],
  read: (index: number) => number,
  write: (index: number, value: number) => void,
): JacobianRow[] | null {
  const result: JacobianRow[] = []
  for (const term of terms) {
    const residual = term.value()
    if (!Number.isFinite(residual)) return null
    const entries: { index: number; derivative: number }[] = []
    for (const index of term.variables) {
      const original = read(index)
      // Coordinate-relative steps would make a translated molecule behave
      // differently. Geometry lives in angstroms, so use an absolute step.
      const delta = 1e-5
      write(index, original + delta)
      const plus = term.value()
      write(index, original - delta)
      const minus = term.value()
      write(index, original)
      if (!Number.isFinite(plus) || !Number.isFinite(minus)) return null
      const derivative = (plus - minus) / (2 * delta)
      if (Math.abs(derivative) > 1e-12) entries.push({ index, derivative })
    }
    if (entries.length > 0) result.push({ residual, entries })
  }
  return result
}

function inner(left: Float64Array, right: Float64Array): number {
  let value = 0
  for (let index = 0; index < left.length; index += 1) value += left[index]! * right[index]!
  return value
}

/** Solve (J'J + damping D) step = -J'r with bounded preconditioned CG. */
export function leastSquaresStep(
  rows: readonly JacobianRow[],
  size: number,
  damping: number,
): Float64Array {
  const diagonal = new Float64Array(size)
  const right = new Float64Array(size)
  for (const row of rows) for (const entry of row.entries) {
    diagonal[entry.index] = diagonal[entry.index]! + entry.derivative * entry.derivative
    right[entry.index] = right[entry.index]! - entry.derivative * row.residual
  }
  const regularizer = Float64Array.from(diagonal, value => damping * (1 + value))
  const multiply = (vector: Float64Array): Float64Array => {
    const product = Float64Array.from(vector, (value, index) => value * regularizer[index]!)
    for (const row of rows) {
      let projected = 0
      for (const entry of row.entries) projected += entry.derivative * vector[entry.index]!
      for (const entry of row.entries) product[entry.index] = product[entry.index]! + entry.derivative * projected
    }
    return product
  }
  const precondition = (vector: Float64Array): Float64Array =>
    Float64Array.from(vector, (value, index) => value / (diagonal[index]! + regularizer[index]!))
  const step = new Float64Array(size)
  const residual = right.slice()
  let adjusted = precondition(residual)
  let direction = adjusted.slice()
  let previous = inner(residual, adjusted)
  const threshold = Math.max(1e-24, inner(right, right) * 1e-12)
  for (let iteration = 0; iteration < Math.min(100, size * 2 + 1); iteration += 1) {
    if (inner(residual, residual) <= threshold) break
    const product = multiply(direction)
    const denominator = inner(direction, product)
    if (!Number.isFinite(denominator) || denominator <= 1e-24) break
    const alpha = previous / denominator
    for (let index = 0; index < size; index += 1) {
      step[index] = step[index]! + alpha * direction[index]!
      residual[index] = residual[index]! - alpha * product[index]!
    }
    adjusted = precondition(residual)
    const next = inner(residual, adjusted)
    const beta = next / previous
    direction = Float64Array.from(adjusted, (value, index) => value + beta * direction[index]!)
    previous = next
  }
  return step
}
