import { describe, expect, it } from 'vitest'
import { newAtom, newBond } from '@retainmol/mol-viewer/core'
import { activateRuntimeTemplateBrush } from './runtimeTemplateBrush'

describe('runtime template brush', () => {
  it('uses a selected H as a leaving atom at runtime', () => {
    const carbon = newAtom('C')
    const hydrogen = newAtom('H', 1.09)
    const molecule = { atoms: [carbon, hydrogen], bonds: [newBond(carbon.id, hydrogen.id)] }
    const fragment = activateRuntimeTemplateBrush({ templateId: 'methane', templateName: '甲烷', molecule, site: { kind: 'atom', atomId: hydrogen.id } })
    expect(fragment).toMatchObject({ attachIndex: 0, attachHIndex: 1, group: 'group' })
  })

  it('compiles a selected edge and reverses it when flipped', () => {
    const a = newAtom('C')
    const b = newAtom('C', 1.4)
    const c = newAtom('C', 0.7, 1.2)
    const bond = newBond(a.id, b.id)
    const molecule = { atoms: [a, b, c], bonds: [bond, newBond(b.id, c.id), newBond(c.id, a.id)] }
    const fragment = activateRuntimeTemplateBrush({ templateId: 'edge', templateName: '边', molecule, site: { kind: 'edge', bondId: bond.id }, flipped: true })
    expect(fragment.attachBond).toEqual([1, 0])
    expect(fragment.group).toBe('ring')
  })

  it('rejects a selected edge that is not part of a ring', () => {
    const a = newAtom('C')
    const b = newAtom('C', 1.4)
    const bond = newBond(a.id, b.id)
    const molecule = { atoms: [a, b], bonds: [bond] }

    expect(() => activateRuntimeTemplateBrush({
      templateId: 'chain',
      templateName: '链',
      molecule,
      site: { kind: 'edge', bondId: bond.id },
    })).toThrow('所选模板键不在环内')
  })
})
