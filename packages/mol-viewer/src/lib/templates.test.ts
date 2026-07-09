import { describe, expect, it } from 'vitest'
import {
  MOLECULE_TEMPLATES,
  createCenteredMoleculeFromTemplate,
  createMoleculeFromTemplate,
  listMoleculeTemplateSummaries,
  validateMoleculeTemplate,
} from './templates'

describe('molecule templates', () => {
  it('keeps builtin templates structurally valid', () => {
    for (const template of MOLECULE_TEMPLATES) {
      expect(validateMoleculeTemplate(template), template.id).toEqual([])
    }
  })

  it('exposes stable metadata for the template picker', () => {
    const summaries = listMoleculeTemplateSummaries()
    expect(summaries.map(item => item.id)).toEqual([
      'water',
      'methane',
      'ethanol',
      'benzene',
      'carbon-dioxide',
      'ammonia',
    ])
    expect(summaries.find(item => item.id === 'benzene')).toMatchObject({
      name: '苯',
      formula: 'C6H6',
      atomCount: 12,
      bondCount: 12,
    })
  })

  it('creates fresh molecule instances', () => {
    const first = createMoleculeFromTemplate('benzene')
    const second = createMoleculeFromTemplate('benzene')

    expect(first).toBeDefined()
    expect(second).toBeDefined()
    expect(first).not.toBe(second)
    expect(first?.atoms[0]).not.toBe(second?.atoms[0])
  })

  it('creates centered molecule instances for canvas replacement', () => {
    const molecule = createCenteredMoleculeFromTemplate('ethanol')

    expect(molecule).toBeDefined()
    if (!molecule) return
    const cx = molecule.atoms.reduce((sum, atom) => sum + atom.x, 0) / molecule.atoms.length
    const cy = molecule.atoms.reduce((sum, atom) => sum + atom.y, 0) / molecule.atoms.length
    const cz = molecule.atoms.reduce((sum, atom) => sum + atom.z, 0) / molecule.atoms.length
    expect(cx).toBeCloseTo(0)
    expect(cy).toBeCloseTo(0)
    expect(cz).toBeCloseTo(0)
  })
})
