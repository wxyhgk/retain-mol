import { describe, expect, it, vi } from 'vitest'
import { getFragment } from '../lib/builder/fragmentLibrary'
import { placeFragmentStandalone } from '../lib/builder/editing/fragment'
import { resolveBuilderIntent } from '../lib/builder/commands/interaction'
import {
  applyFragmentTorsion,
  canStartFragmentTorsion,
  createFragmentTorsionPreview,
} from './builderFragmentTorsionEffects'

function fragmentIntent(fragmentId: string) {
  return resolveBuilderIntent({
    activeTool: 'select',
    activeElement: 'C',
    atomClickMode: 'grow',
    activeFragmentId: fragmentId,
    brushArmed: true,
  })
}

describe('builder fragment torsion effects', () => {
  it('previews without committing and commits the final angle exactly once', () => {
    const methane = getFragment('c-sp3')!
    const molecule = placeFragmentStandalone({ atoms: [], bonds: [] }, methane, { x: 0, y: 0, z: 0 })
    const targetHydrogen = molecule.atoms.find(atom => atom.symbol === 'H')!
    const intent = fragmentIntent('c-sp3')
    const setMolecule = vi.fn()

    expect(canStartFragmentTorsion(intent, molecule, targetHydrogen.id)).toBe(true)
    const preview0 = createFragmentTorsionPreview(intent, molecule, targetHydrogen.id, 0)
    const preview180 = createFragmentTorsionPreview(intent, molecule, targetHydrogen.id, 180)
    expect(preview0?.atoms.length).toBeGreaterThan(1)
    expect(preview180?.atoms).not.toEqual(preview0?.atoms)
    expect(setMolecule).not.toHaveBeenCalled()

    applyFragmentTorsion(intent, molecule, targetHydrogen.id, 180, {
      setMolecule,
      flashHint: vi.fn(),
    })
    expect(setMolecule).toHaveBeenCalledTimes(1)
  })

  it('does not offer free torsion for a double-bond fragment', () => {
    const methane = getFragment('c-sp3')!
    const molecule = placeFragmentStandalone({ atoms: [], bonds: [] }, methane, { x: 0, y: 0, z: 0 })
    const targetHydrogen = molecule.atoms.find(atom => atom.symbol === 'H')!
    expect(canStartFragmentTorsion(fragmentIntent('c-sp2'), molecule, targetHydrogen.id)).toBe(false)
  })
})
