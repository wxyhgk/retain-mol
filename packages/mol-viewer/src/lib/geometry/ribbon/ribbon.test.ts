import { describe, expect, it } from 'vitest'
import type { Molecule } from '../../model/types'
import { createRibbonGuide, compileRibbonGuideConstraints } from './guide'
import { validateRibbonRegion } from './region'
import { measureRibbonGeometry } from './measure'
import type { GeometryRibbonGuide, GeometryRibbonGuideRequest, GeometryRibbonRegion } from './contracts'

function guide(halfTwists = 3): GeometryRibbonGuide {
  const result = createRibbonGuide({ sectionCount: 24, radius: 3, halfWidth: 0.5, halfTwists })
  if (result.ok === false) throw new Error(result.issues.map(issue => issue.message).join('; '))
  return result.guide
}

// Test-only rail graph. It is not asserted to be a chemically valid structure.
function railFixture(input = guide()): { molecule: Molecule; region: GeometryRibbonRegion } {
  const sections = input.sections.map((_, index) => ({ leftAtomId: `left-${index}`, rightAtomId: `right-${index}` }))
  const atoms = input.sections.flatMap((section, index) => [
    { ...section.left, id: sections[index]!.leftAtomId, symbol: 'C' },
    { ...section.right, id: sections[index]!.rightAtomId, symbol: 'C' },
  ])
  const bonds: Molecule['bonds'][number][] = []
  for (let index = 0; index < sections.length; index += 1) {
    const current = sections[index]!
    const next = sections[(index + 1) % sections.length]!
    const crossed = index === sections.length - 1 && input.closure === 'crossed'
    bonds.push({ id: `left-bond-${index}`, atomId1: current.leftAtomId, atomId2: crossed ? next.rightAtomId : next.leftAtomId, order: 1 })
    bonds.push({ id: `right-bond-${index}`, atomId1: current.rightAtomId, atomId2: crossed ? next.leftAtomId : next.rightAtomId, order: 1 })
  }
  return { molecule: { atoms, bonds }, region: { id: 'test-ribbon', sections, closure: input.closure } }
}

describe('createRibbonGuide', () => {
  it.each([-3, -1, 0, 1, 2, 3])('generates finite circular samples with seam parity for %s half twists', halfTwists => {
    const result = guide(halfTwists)
    expect(result.sectionCount).toBe(24)
    expect(result.sections).toHaveLength(24)
    expect(result.closure).toBe(Math.abs(halfTwists) % 2 ? 'crossed' : 'parallel')
    for (const { center, left, right } of result.sections) {
      expect(Math.hypot(center.x, center.y)).toBeCloseTo(3, 12)
      expect(center.z).toBe(0)
      expect(Math.hypot(left.x - right.x, left.y - right.y, left.z - right.z)).toBeCloseTo(1, 12)
      expect([left.x, left.y, left.z, right.x, right.y, right.z].every(Number.isFinite)).toBe(true)
    }
  })

  it('generates the opposite twist as a mirror without fetching coordinates', () => {
    const positive = guide(3)
    const negative = guide(-3)
    for (const [index, section] of positive.sections.entries()) for (const side of ['left', 'right'] as const) {
      expect(section[side].x).toBeCloseTo(negative.sections[index]![side].x, 12)
      expect(section[side].y).toBeCloseTo(negative.sections[index]![side].y, 12)
      expect(section[side].z).toBeCloseTo(-negative.sections[index]![side].z, 12)
    }
  })

  it.each([
    { sectionCount: 2 }, { sectionCount: 501 }, { sectionCount: 3.5 }, { sectionCount: Infinity },
    { radius: 0 }, { radius: Infinity }, { radius: NaN },
    { halfWidth: 0 }, { halfWidth: -1 }, { halfWidth: 3 }, { halfWidth: 4 }, { halfWidth: NaN },
    { halfTwists: 0.5 }, { halfTwists: Infinity }, { halfTwists: 12 }, { halfTwists: -12 },
    { radius: 1e308, halfWidth: 9e307 },
  ])('rejects invalid or undersampled parameters %j', override => {
    expect(createRibbonGuide({ sectionCount: 24, radius: 3, halfWidth: 0.5, halfTwists: 3, ...override }).ok).toBe(false)
  })

  it('returns a typed failure for an absent parameter object', () => {
    expect(createRibbonGuide(null as unknown as GeometryRibbonGuideRequest)).toMatchObject({ ok: false, issues: [{ code: 'invalid-guide' }] })
  })

  it('rejects finite parameters whose width vanishes through floating-point rounding', () => {
    expect(createRibbonGuide({ sectionCount: 24, radius: 3, halfWidth: Number.MIN_VALUE, halfTwists: 0 }).ok).toBe(false)
  })
})

describe('validateRibbonRegion', () => {
  it('uses explicit stable IDs and rail edges without requiring cross-section chemical bonds', () => {
    const { molecule, region } = railFixture()
    const report = validateRibbonRegion(molecule, region)
    expect(report.ok).toBe(true)
    expect(report.atomIds).toEqual(region.sections.flatMap(section => [section.leftAtomId, section.rightAtomId]))
    expect(molecule.bonds.some(bond => bond.atomId1 === 'left-0' && bond.atomId2 === 'right-0')).toBe(false)
    expect(validateRibbonRegion({ ...molecule, atoms: [...molecule.atoms].reverse(), bonds: [...molecule.bonds].reverse() }, region)).toEqual(report)
  })

  it.each([0, 3])('checks the declared seam rather than inferring it from geometry (%s half twists)', twists => {
    const { molecule, region } = railFixture(guide(twists))
    const wrong: GeometryRibbonRegion = { ...region, closure: region.closure === 'parallel' ? 'crossed' : 'parallel' }
    const report = validateRibbonRegion(molecule, wrong)
    expect(report.ok).toBe(false)
    expect(report.issues).toHaveLength(2)
    expect(report.issues.every(issue => issue.code === 'missing-rail-bond')).toBe(true)
  })

  it('requires no seam for an explicitly open region', () => {
    const { molecule, region } = railFixture()
    const openMolecule = { ...molecule, bonds: molecule.bonds.slice(0, -2) }
    expect(validateRibbonRegion(openMolecule, { ...region, closure: 'open' }).ok).toBe(true)
    expect(validateRibbonRegion(openMolecule, region).ok).toBe(false)
  })

  it('diagnoses missing intermediate rail edges with stable atom IDs', () => {
    const { molecule, region } = railFixture()
    const report = validateRibbonRegion({ ...molecule, bonds: molecule.bonds.filter(bond => bond.id !== 'left-bond-4') }, region)
    expect(report).toMatchObject({ ok: false, issues: [{ code: 'missing-rail-bond', atomIds: ['left-4', 'left-5'], sectionIndex: 4 }] })
  })

  it('rejects repeated section atoms, short regions, missing IDs and nonfinite coordinates', () => {
    const { molecule, region } = railFixture()
    expect(validateRibbonRegion(molecule, { ...region, sections: region.sections.slice(0, 2) }).ok).toBe(false)
    expect(validateRibbonRegion(molecule, { ...region, sections: [region.sections[0]!, region.sections[0]!, ...region.sections.slice(2)] }).ok).toBe(false)
    expect(validateRibbonRegion({ ...molecule, atoms: molecule.atoms.slice(1) }, region).ok).toBe(false)
    expect(validateRibbonRegion({ ...molecule, atoms: molecule.atoms.map((atom, index) => index ? atom : { ...atom, x: NaN }) }, region).ok).toBe(false)
    expect(validateRibbonRegion({ ...molecule, atoms: [...molecule.atoms, molecule.atoms[0]!] }, region).ok).toBe(false)
  })
})

describe('measureRibbonGeometry', () => {
  it.each([-3, -1, 0, 1, 2, 3])('measures analytic widths and local twist including seam for %s half twists', twists => {
    const { molecule, region } = railFixture(guide(twists))
    const measured = measureRibbonGeometry(molecule, region)
    expect(measured.ok).toBe(true)
    expect(measured.turnsDegrees).toHaveLength(24)
    expect(measured.widthsAngstrom).toHaveLength(24)
    measured.widthsAngstrom.forEach(width => expect(width).toBeCloseTo(1, 10))
    measured.turnsDegrees.forEach(turn => expect(turn).toBeCloseTo(180 * twists / 24, 10))
    // This sum checks this known analytic fixture; the API deliberately does
    // not promote a sampled sum to a whole-molecule topological certificate.
    expect(measured.turnsDegrees.reduce<number>((sum, turn) => sum + turn!, 0)).toBeCloseTo(twists * 180, 9)
  })

  it('is stable under storage reorder and proper rigid motion, and changes sign under reflection', () => {
    const { molecule, region } = railFixture()
    const original = measureRibbonGeometry(molecule, region)
    const transformed: Molecule = { ...molecule, atoms: molecule.atoms.map(atom => ({ ...atom, x: atom.z + 5, y: atom.x - 3, z: atom.y + 7 })).reverse(), bonds: [...molecule.bonds].reverse() }
    const reflected: Molecule = { ...molecule, atoms: molecule.atoms.map(atom => ({ ...atom, z: -atom.z })) }
    const rigid = measureRibbonGeometry(transformed, region)
    const mirror = measureRibbonGeometry(reflected, region)
    expect(rigid.ok).toBe(true)
    expect(mirror.ok).toBe(true)
    rigid.turnsDegrees.forEach((turn, index) => expect(turn).toBeCloseTo(original.turnsDegrees[index]!, 9))
    mirror.turnsDegrees.forEach((turn, index) => expect(turn).toBeCloseTo(-original.turnsDegrees[index]!, 9))
  })

  it('omits the seam measurement for an open region', () => {
    const { molecule, region } = railFixture()
    const result = measureRibbonGeometry(molecule, { ...region, closure: 'open' })
    expect(result.ok).toBe(true)
    expect(result.turnsDegrees).toHaveLength(23)
  })

  it('returns null and diagnostics for collapsed widths rather than inventing a frame', () => {
    const { molecule, region } = railFixture()
    const left = molecule.atoms.find(atom => atom.id === 'left-4')!
    const collapsed = { ...molecule, atoms: molecule.atoms.map(atom => atom.id === 'right-4' ? { ...atom, x: left.x, y: left.y, z: left.z } : atom) }
    const result = measureRibbonGeometry(collapsed, region)
    expect(result.ok).toBe(false)
    expect(result.widthsAngstrom[4]).toBe(0)
    expect(result.turnsDegrees[3]).toBeNull()
    expect(result.turnsDegrees[4]).toBeNull()
    expect(result.issues.some(issue => issue.code === 'degenerate-geometry' && issue.sectionIndex === 4)).toBe(true)
  })

  it('does not choose an arbitrary sign for an exact antipodal section rotation', () => {
    const { molecule, region } = railFixture(guide(0))
    const left = molecule.atoms.find(atom => atom.id === 'left-4')!
    const right = molecule.atoms.find(atom => atom.id === 'right-4')!
    const flipped = { ...molecule, atoms: molecule.atoms.map(atom => {
      const source = atom.id === left.id ? right : atom.id === right.id ? left : atom
      return { ...atom, x: source.x, y: source.y, z: source.z }
    }) }
    const result = measureRibbonGeometry(flipped, region)
    expect(result.ok).toBe(false)
    expect(result.turnsDegrees[3]).toBeNull()
    expect(result.turnsDegrees[4]).toBeNull()
  })
})

describe('compileRibbonGuideConstraints', () => {
  it('maps sections to stable IDs as soft targets without modifying graph, geometry or guide', () => {
    const input = guide()
    const { molecule, region } = railFixture(input)
    const before = structuredClone({ input, molecule, region })
    const shuffled = { ...molecule, atoms: [...molecule.atoms].reverse() }
    const compiled = compileRibbonGuideConstraints(shuffled, region, input, { tolerance: 0.1, weight: 2 })
    expect(compiled.ok).toBe(true)
    if (compiled.ok === false) throw new Error('compilation failed')
    expect(compiled.constraints).toHaveLength(48)
    expect(compiled.constraints[8]).toEqual({
      id: 'ribbon:test-ribbon:4:left', kind: 'position', strength: 'soft', atomId: 'left-4',
      target: input.sections[4]!.left, tolerance: 0.1, weight: 2,
    })
    expect(compiled.constraints[9]).toMatchObject({ atomId: 'right-4', target: input.sections[4]!.right })
    expect(compileRibbonGuideConstraints(molecule, region, input, { tolerance: 0.1, weight: 2 })).toEqual(compiled)
    expect({ input, molecule, region }).toEqual(before)
  })

  it('rejects guide payloads whose sections, closure or metadata were changed independently', () => {
    const input = guide()
    const { molecule, region } = railFixture(input)
    const malformed: GeometryRibbonGuide[] = [
      { ...input, closure: 'parallel' },
      { ...input, halfTwists: 1 },
      { ...input, sections: input.sections.slice(1) },
      { ...input, sections: input.sections.map((section, index) => index ? section : { ...section, left: { ...section.left, x: section.left.x + 1 } }) },
      { ...input, sections: input.sections.map((section, index) => index ? section : { ...section, center: { ...section.center, z: 1 } }) },
    ]
    for (const modified of malformed) expect(compileRibbonGuideConstraints(molecule, region, modified, { tolerance: 0.1 }).ok).toBe(false)
  })

  it('rejects topology mismatch, a different guide parity, and invalid constraint options', () => {
    const input = guide()
    const { molecule, region } = railFixture(input)
    expect(compileRibbonGuideConstraints({ ...molecule, bonds: [] }, region, input, { tolerance: 0.1 }).ok).toBe(false)
    expect(compileRibbonGuideConstraints(molecule, region, guide(0), { tolerance: 0.1 }).ok).toBe(false)
    for (const options of [{ tolerance: -1 }, { tolerance: Infinity }, { tolerance: 0.1, weight: 0 }, { tolerance: 0.1, weight: Infinity }]) {
      expect(compileRibbonGuideConstraints(molecule, region, input, options).ok).toBe(false)
    }
  })
})
