import { tetrahedralCandidates } from '../../geometry/vsepr'
import { type Vec3, add, scale } from '../../math/vec3'
import type { FragmentAtom, FragmentBond, FragmentDef } from '../model'

type V3 = Vec3

const norm = (v: V3): V3 => {
  const length = Math.hypot(v[0], v[1], v[2]) || 1
  return [v[0] / length, v[1] / length, v[2] / length]
}

const CH_BOND_LENGTH = 1.09

function makeRing(options: {
  id: string
  name: string
  short: string
  formula: string
  n: number
  cc: number
  orders: (1 | 2)[]
  pucker: number
  hPerC: 1 | 2
}): FragmentDef {
  const { n, cc, orders, pucker, hPerC } = options
  const ccXY = pucker > 0 ? Math.sqrt(cc * cc - (2 * pucker) * (2 * pucker)) : cc
  const radius = ccXY / (2 * Math.sin(Math.PI / n))

  const carbons: V3[] = []
  for (let index = 0; index < n; index++) {
    const angle = (2 * Math.PI * index) / n
    carbons.push([
      radius * Math.cos(angle),
      radius * Math.sin(angle),
      pucker * (index % 2 === 0 ? 1 : -1),
    ])
  }

  const atoms: FragmentAtom[] = carbons.map(carbon => ({
    symbol: 'C',
    x: carbon[0],
    y: carbon[1],
    z: carbon[2],
  }))
  const bonds: FragmentBond[] = []
  for (let index = 0; index < n; index++) {
    const order = orders[index]
    if (order === undefined) throw new Error(`${options.id}: missing ring bond order ${index}`)
    bonds.push({ a: index, b: (index + 1) % n, order })
  }

  let attachHIndex = -1
  for (let index = 0; index < n; index++) {
    const carbon = carbons[index]
    const nextCarbon = carbons[(index + 1) % n]
    const previousCarbon = carbons[(index + n - 1) % n]
    if (!carbon || !nextCarbon || !previousCarbon) {
      throw new Error(`${options.id}: incomplete ring coordinates at ${index}`)
    }
    const nextDirection = norm(add(nextCarbon, scale(carbon, -1)))
    const previousDirection = norm(add(previousCarbon, scale(carbon, -1)))
    const directionSum = add(nextDirection, previousDirection)

    if (hPerC === 1) {
      const direction = norm(scale(directionSum, -1))
      const hydrogen = add(carbon, scale(direction, CH_BOND_LENGTH))
      atoms.push({ symbol: 'H', x: hydrogen[0], y: hydrogen[1], z: hydrogen[2] })
      bonds.push({ a: index, b: atoms.length - 1, order: 1 })
      if (index === 0) attachHIndex = atoms.length - 1
      continue
    }

    const hydrogenDirections = tetrahedralCandidates(nextDirection, previousDirection)
    if (!hydrogenDirections) {
      throw new Error(`${options.id}: cannot resolve tetrahedral hydrogens at ${index}`)
    }
    for (const direction of hydrogenDirections) {
      const hydrogen = add(carbon, scale(direction, CH_BOND_LENGTH))
      atoms.push({ symbol: 'H', x: hydrogen[0], y: hydrogen[1], z: hydrogen[2] })
      bonds.push({ a: index, b: atoms.length - 1, order: 1 })
      if (index === 0 && attachHIndex < 0) attachHIndex = atoms.length - 1
    }
  }

  return {
    id: options.id,
    name: options.name,
    short: options.short,
    formula: options.formula,
    atoms,
    bonds,
    attachIndex: 0,
    attachHIndex,
    attachBond: [0, 1],
    group: 'ring',
  }
}

export const RING_FRAGMENTS: readonly FragmentDef[] = [
  makeRing({
    id: 'benzene', name: '苯环', short: 'Ph', formula: 'C₆H₆',
    n: 6, cc: 1.39, orders: [2, 1, 2, 1, 2, 1], pucker: 0, hPerC: 1,
  }),
  makeRing({
    id: 'cyclohexane', name: '环己烷（椅式）', short: 'Cy', formula: 'C₆H₁₂',
    n: 6, cc: 1.53, orders: [1, 1, 1, 1, 1, 1], pucker: 0.237, hPerC: 2,
  }),
  makeRing({
    id: 'cyclopentane', name: '环戊烷', short: 'Cp', formula: 'C₅H₁₀',
    n: 5, cc: 1.54, orders: [1, 1, 1, 1, 1], pucker: 0, hPerC: 2,
  }),
  makeRing({
    id: 'cyclopropane', name: '环丙烷', short: 'C₃', formula: 'C₃H₆',
    n: 3, cc: 1.51, orders: [1, 1, 1], pucker: 0, hPerC: 2,
  }),
]
