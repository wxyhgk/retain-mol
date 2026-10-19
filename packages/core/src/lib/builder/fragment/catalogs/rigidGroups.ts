import type { FragmentDef } from '../model'

const FLUORENE_ATOMS = [
  { symbol: 'C', x: -3.437632, y: -0.079598, z: -0.133132 },
  { symbol: 'C', x: -2.920879, y: -1.379832, z: -0.266842 },
  { symbol: 'C', x: -1.541302, y: -1.610004, z: -0.244118 },
  { symbol: 'C', x: -0.695335, y: -0.525192, z: -0.086566 },
  { symbol: 'C', x: -1.221330, y: 0.778498, z: 0.047218 },
  { symbol: 'C', x: -2.585766, y: 1.015203, z: 0.025799 },
  { symbol: 'C', x: -0.098957, y: 1.784081, z: 0.205434 },
  { symbol: 'C', x: 1.128366, y: 0.897477, z: 0.145774 },
  { symbol: 'C', x: 2.458975, y: 1.270648, z: 0.237407 },
  { symbol: 'C', x: 3.427179, y: 0.268010, z: 0.154831 },
  { symbol: 'C', x: 3.057156, y: -1.077126, z: -0.016068 },
  { symbol: 'C', x: 1.710771, y: -1.445328, z: -0.107706 },
  { symbol: 'C', x: 0.749534, y: -0.452030, z: -0.025961 },
  { symbol: 'H', x: -4.514171, y: 0.073549, z: -0.153962 },
  { symbol: 'H', x: -3.603489, y: -2.217505, z: -0.389564 },
  { symbol: 'H', x: -1.152616, y: -2.617072, z: -0.348081 },
  { symbol: 'H', x: -2.984917, y: 2.018557, z: 0.128961 },
  { symbol: 'H', x: -0.165105, y: 2.288337, z: 1.173891 },
  { symbol: 'H', x: -0.100416, y: 2.498799, z: -0.622659 },
  { symbol: 'H', x: 2.744901, y: 2.308689, z: 0.369317 },
  { symbol: 'H', x: 4.480744, y: 0.529027, z: 0.223346 },
  { symbol: 'H', x: 3.828602, y: -1.841177, z: -0.077789 },
  { symbol: 'H', x: 1.435686, y: -2.486011, z: -0.239531 },
] as const

const FLUORENE_BONDS = [
  { a: 0, b: 1, order: 2 }, { a: 1, b: 2, order: 1 },
  { a: 2, b: 3, order: 2 }, { a: 3, b: 4, order: 1 },
  { a: 4, b: 5, order: 2 }, { a: 4, b: 6, order: 1 },
  { a: 6, b: 7, order: 1 }, { a: 7, b: 8, order: 2 },
  { a: 8, b: 9, order: 1 }, { a: 9, b: 10, order: 2 },
  { a: 10, b: 11, order: 1 }, { a: 11, b: 12, order: 2 },
  { a: 5, b: 0, order: 1 }, { a: 12, b: 7, order: 1 },
  { a: 12, b: 3, order: 1 }, { a: 0, b: 13, order: 1 },
  { a: 1, b: 14, order: 1 }, { a: 2, b: 15, order: 1 },
  { a: 5, b: 16, order: 1 }, { a: 6, b: 17, order: 1 },
  { a: 6, b: 18, order: 1 }, { a: 8, b: 19, order: 1 },
  { a: 9, b: 20, order: 1 }, { a: 10, b: 21, order: 1 },
  { a: 11, b: 22, order: 1 },
] as const

function makeFluoreneSite(site: 'a' | 'b'): FragmentDef {
  const attachHIndex = site === 'a' ? 17 : 18
  const secondHIndex = site === 'a' ? 18 : 17
  return {
    id: `fluorene-9h-site-${site}`,
    name: `9H-芴 · 9 位点 ${site.toUpperCase()}`,
    short: `Flu-${site.toUpperCase()}`,
    formula: 'C13H10',
    atoms: FLUORENE_ATOMS.map(atom => ({ ...atom })),
    bonds: FLUORENE_BONDS.map(bond => ({ ...bond })),
    attachIndex: 6,
    attachHIndex,
    attachOrder: 1,
    bridgeAttachment: {
      centerIndex: 6,
      sites: [
        { leavingHydrogenIndex: attachHIndex, order: 1 },
        { leavingHydrogenIndex: secondHIndex, order: 1 },
      ],
    },
    group: 'group',
  }
}

/**
 * Rigid 9H-fluorene templates. Site A/B are the two hydrogens on C9.
 * Keeping separate stable IDs lets an EditPlan choose one face explicitly;
 * after attachment the remaining C9 hydrogen can be removed for spiro closure.
 */
export const RIGID_GROUP_FRAGMENTS: readonly FragmentDef[] = [
  makeFluoreneSite('a'),
  makeFluoreneSite('b'),
]
