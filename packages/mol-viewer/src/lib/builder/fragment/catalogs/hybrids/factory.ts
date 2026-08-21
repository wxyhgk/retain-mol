import type { FragmentAtom, FragmentBond, FragmentDef } from '../../model'
import type { Vec3 } from '../../../math/vec3'

type V3 = Vec3
export type Hybridization = 'sp3' | 'sp2' | 'sp'

export interface HybridSpec {
  readonly hyb: Hybridization
  readonly attachOrder: 1 | 2 | 3
  readonly hCount: number
  readonly bondLen: number
}

const norm = (v: V3): V3 => {
  const length = Math.hypot(v[0], v[1], v[2]) || 1
  return [v[0] / length, v[1] / length, v[2] / length]
}

const TETRAHEDRAL_DIRECTIONS: V3[] = (
  [[1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]] as V3[]
).map(norm)

const BOND_GLYPH: Record<Hybridization, string> = {
  sp3: '–',
  sp2: '=',
  sp: '≡',
}

export function makeHybridStub(symbol: string, spec: HybridSpec): FragmentDef {
  const { hyb, attachOrder, hCount, bondLen } = spec
  const planar = (degrees: number): V3 => [
    Math.cos((degrees * Math.PI) / 180),
    Math.sin((degrees * Math.PI) / 180),
    0,
  ]
  const directions: V3[] = hyb === 'sp3'
    ? TETRAHEDRAL_DIRECTIONS
    : hyb === 'sp2'
      ? [planar(0), planar(120), planar(240)]
      : [planar(0), planar(180)]

  const atoms: FragmentAtom[] = [{ symbol, x: 0, y: 0, z: 0 }]
  const bonds: FragmentBond[] = []
  directions.slice(0, 1 + hCount).forEach((direction, index) => {
    atoms.push({
      symbol: 'H',
      x: direction[0] * bondLen,
      y: direction[1] * bondLen,
      z: direction[2] * bondLen,
    })
    bonds.push({ a: 0, b: index + 1, order: 1 })
  })

  const short = BOND_GLYPH[hyb] + symbol
  return {
    id: `${symbol.toLowerCase()}-${hyb}`,
    name: `${symbol} · ${hyb}`,
    short,
    formula: short,
    atoms,
    bonds,
    attachIndex: 0,
    attachHIndex: 1,
    attachOrder,
    group: hyb,
  }
}
