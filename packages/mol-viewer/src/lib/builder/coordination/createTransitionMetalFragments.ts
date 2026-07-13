import type { FragmentDef } from '../fragment/model'
import { getElementConfig } from '../../../config/elements.config'
import { COORDINATION_GEOMETRY_CATALOG } from './geometryCatalog'
import type { TransitionMetalCoordinationSpec, TransitionMetalCoordinationSet } from './types'

export function defineTransitionMetalCoordinationSet(
  symbol: string,
  specs: readonly TransitionMetalCoordinationSpec[],
): TransitionMetalCoordinationSet {
  const fragments: FragmentDef[] = specs.map(spec => {
    const base = COORDINATION_GEOMETRY_CATALOG[spec.geometryId]
    const authoredDirections = spec.directions ?? base.directions
    const sites = base.sites.map((baseSite, index) => {
      const override = spec.siteOverrides?.[baseSite.id]
      const direction = override?.direction ?? authoredDirections[index] ?? baseSite.direction
      const length = Math.hypot(direction[0], direction[1], direction[2]) || 1
      return {
        ...baseSite,
        ...override,
        direction: [direction[0] / length, direction[1] / length, direction[2] / length] as [number, number, number],
      }
    })
    const directions = sites.map(site => [...site.direction] as [number, number, number])
    const attachDirection: [number, number, number] = directions[0] ?? [1, 0, 0]
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
    const bonds = sites.map((site, index) => ({
      a: 0,
      b: index + 1,
      order: site.bondOrder,
      coordinationSiteId: site.id,
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
      attachDirection: [...attachDirection],
      attachOrder: sites[0]?.bondOrder ?? 1,
      group: 'coordination',
      coordination: {
        geometryId: spec.geometryId,
        coordinationNumber: base.coordinationNumber,
        ...(pointGroup !== undefined ? { pointGroup } : {}),
        directions,
        sites,
      },
    }
  })

  return { symbol, fragments }
}
