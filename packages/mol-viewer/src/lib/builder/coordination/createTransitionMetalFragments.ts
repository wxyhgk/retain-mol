import type { FragmentDef } from '../fragmentLibrary'
import { getElementConfig } from '../../../config/elements.config'
import { COORDINATION_GEOMETRY_CATALOG } from './geometryCatalog'
import type { TransitionMetalCoordinationSpec, TransitionMetalCoordinationSet } from './types'

export function defineTransitionMetalCoordinationSet(
  symbol: string,
  specs: readonly TransitionMetalCoordinationSpec[],
): TransitionMetalCoordinationSet {
  const fragments: FragmentDef[] = specs.map(spec => {
    const base = COORDINATION_GEOMETRY_CATALOG[spec.geometryId]
    const directions = (spec.directions ?? base.directions).map(direction => [...direction] as [number, number, number])
    const pointGroup = spec.pointGroup ?? base.pointGroup
    const short = spec.short ?? `${base.short}${pointGroup ? ` (${pointGroup})` : ''}`
    const slotBondLength = spec.slotBondLength
      ?? getElementConfig(symbol).covalentRadius + getElementConfig('H').covalentRadius
    const atoms = [
      { symbol, x: 0, y: 0, z: 0 },
      ...directions.map(direction => ({
        symbol: 'H',
        x: direction[0] * slotBondLength,
        y: direction[1] * slotBondLength,
        z: direction[2] * slotBondLength,
      })),
    ]
    const bonds = directions.map((_, index) => ({
      a: 0,
      b: index + 1,
      order: 1 as const,
    }))
    return {
      id: `${symbol.toLowerCase()}-coord-${spec.geometryId}`,
      name: spec.name ?? `${symbol} · ${base.name}`,
      short,
      formula: `${symbol}H${base.coordinationNumber}`,
      atoms,
      bonds,
      attachIndex: 0,
      attachHIndex: 1,
      attachDirection: [...directions[0]],
      attachOrder: 1,
      group: 'coordination',
      coordination: {
        geometryId: spec.geometryId,
        coordinationNumber: base.coordinationNumber,
        pointGroup,
        directions,
      },
    }
  })

  return { symbol, fragments }
}
