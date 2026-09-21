import { createRibbonGuide, measureRibbonGeometry, validateRibbonRegion, type GeometryRibbonRegion, type Molecule } from '@/domain/viewer/geometryPath'

/** Stable IDs describe sampled guide points, not atoms identified in a paper. */
export function ribbonFixture(halfTwists: number) {
  const result = createRibbonGuide({ sectionCount: 24, radius: 3, halfWidth: 0.5, halfTwists })
  if (result.ok === false) throw new Error(result.issues.map(issue => issue.message).join('；'))
  const guide = result.guide
  const region: GeometryRibbonRegion = {
    id: 'demo-ribbon', closure: guide.closure,
    sections: guide.sections.map((_, index) => ({ leftAtomId: `ribbon-left-${index}`, rightAtomId: `ribbon-right-${index}` })),
  }
  const atoms = guide.sections.flatMap((section, index) => [
    { id: region.sections[index]!.leftAtomId, symbol: 'C', ...section.left },
    { id: region.sections[index]!.rightAtomId, symbol: 'C', ...section.right },
  ])
  const bonds: Molecule['bonds'][number][] = []
  for (let index = 0; index < region.sections.length; index += 1) {
    const current = region.sections[index]!, next = region.sections[(index + 1) % region.sections.length]!
    const crossedSeam = index === region.sections.length - 1 && region.closure === 'crossed'
    bonds.push(
      { id: `ribbon-rail-left-${index}`, atomId1: current.leftAtomId, atomId2: crossedSeam ? next.rightAtomId : next.leftAtomId, order: 1 },
      { id: `ribbon-rail-right-${index}`, atomId1: current.rightAtomId, atomId2: crossedSeam ? next.leftAtomId : next.rightAtomId, order: 1 },
      { id: `ribbon-section-${index}`, atomId1: current.leftAtomId, atomId2: current.rightAtomId, order: 1 },
    )
  }
  const molecule: Molecule = { name: `程序环带骨架 · ${halfTwists} 个半扭`, atoms, bonds }
  return { guide, region, molecule, validation: validateRibbonRegion(molecule, region), measurements: measureRibbonGeometry(molecule, region) }
}
