import { expect, it } from 'vitest'
import { createModelingContext } from './context'
import { createHeadlessModelingContext } from '../../public/headless'

it('projects ordinary snapshot data and owns the same nested fields as headless context', () => {
  const molecule = {
    name: 'coordination',
    atoms: [{
      id: 'fe', symbol: 'Fe', isotope: 57, label: 'site', x: 0, y: 0, z: 0,
      coordinationDirections: [[1, 0, 0] as [number, number, number]],
      coordinationSites: [{ id: 'site-a', label: 'A', direction: [1, 0, 0] as [number, number, number], bondOrder: 1 as const, equivalenceGroup: 'a' }],
    }],
    bonds: [],
  }
  const intent = { tool: 'select', brushArmed: false, activeElement: 'C', atomClickMode: 'grow', activeFragmentId: null } as const
  const object = {
    id: 'object', molecule, name: 'coordination', visible: true, locked: false,
    offset: { x: 0, y: 0, z: 0 }, createdAt: 0,
  }
  const selectedAtomIds = new Set(['fe'])
  const fromSnapshot = createModelingContext({
    activeObjectId: object.id, objectOrder: [object.id], objectsById: { [object.id]: object },
    selectedAtomIds, selectedBondIds: new Set(),
  }, intent)
  const headless = createHeadlessModelingContext(molecule, { objectId: object.id, selection: { atomIds: ['fe'] }, editorIntent: intent })
  expect(fromSnapshot).toEqual(headless)
  molecule.atoms[0].label = 'mutated'
  molecule.atoms[0].coordinationDirections[0][0] = 9
  molecule.atoms[0].coordinationSites[0].direction[0] = 9
  selectedAtomIds.clear()
  object.offset.x = 5
  for (const context of [fromSnapshot, headless]) {
    expect(context.objects[0].molecule.atoms[0]).toMatchObject({
      isotope: 57, label: 'site', coordinationDirections: [[1, 0, 0]],
      coordinationSites: [{ direction: [1, 0, 0] }],
    })
    expect(context.selection.atomIds).toEqual(['fe'])
    expect(context.objects[0].offset.x).toBe(0)
  }
})
