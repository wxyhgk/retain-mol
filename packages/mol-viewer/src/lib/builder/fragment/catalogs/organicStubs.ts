import type { FragmentAtom, FragmentBond, FragmentDef } from '../model'
import type { Vec3 } from '../../math/vec3'

type V3 = Vec3
type Hybridization = 'sp3' | 'sp2' | 'sp'

interface HybridSpec {
  hyb: Hybridization
  attachOrder: 1 | 2 | 3
  hCount: number
  bondLen: number
}

const norm = (v: V3): V3 => {
  const length = Math.hypot(v[0], v[1], v[2]) || 1
  return [v[0] / length, v[1] / length, v[2] / length]
}

// Tetrahedral vertices; index 0 is also the attachment-hydrogen direction.
const TETRAHEDRAL_DIRECTIONS: V3[] = (
  [[1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]] as V3[]
).map(norm)

const BOND_GLYPH: Record<Hybridization, string> = {
  sp3: '–',
  sp2: '=',
  sp: '≡',
}

function makeHybridStub(symbol: string, spec: HybridSpec): FragmentDef {
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

// Hydrogen counts exclude the attachment bond. Bond lengths are in angstroms.
const HYBRID_TABLE: Record<string, HybridSpec[]> = {
  C: [
    { hyb: 'sp3', attachOrder: 1, hCount: 3, bondLen: 1.09 },
    { hyb: 'sp2', attachOrder: 2, hCount: 2, bondLen: 1.09 },
    { hyb: 'sp', attachOrder: 3, hCount: 1, bondLen: 1.09 },
  ],
  N: [
    { hyb: 'sp3', attachOrder: 1, hCount: 2, bondLen: 1.01 },
    { hyb: 'sp2', attachOrder: 2, hCount: 1, bondLen: 1.01 },
    { hyb: 'sp', attachOrder: 3, hCount: 0, bondLen: 1.01 },
  ],
  O: [
    { hyb: 'sp3', attachOrder: 1, hCount: 1, bondLen: 0.96 },
    { hyb: 'sp2', attachOrder: 2, hCount: 0, bondLen: 1.21 },
  ],
  S: [
    { hyb: 'sp3', attachOrder: 1, hCount: 1, bondLen: 1.34 },
    { hyb: 'sp2', attachOrder: 2, hCount: 0, bondLen: 1.60 },
  ],
}

export const ORGANIC_STUB_FRAGMENTS: readonly FragmentDef[] = Object.entries(HYBRID_TABLE)
  .flatMap(([symbol, specs]) => specs.map(spec => makeHybridStub(symbol, spec)))
