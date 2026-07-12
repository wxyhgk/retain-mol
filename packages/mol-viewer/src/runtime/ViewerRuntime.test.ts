import { describe, expect, it } from 'vitest'
import { newAtom, type Molecule } from '../lib/molecule'
import { createViewerRuntime } from './ViewerRuntime'

function molecule(symbol: string): Molecule {
  return {
    name: symbol,
    atoms: [newAtom(symbol, 0, 0, 0)],
    bonds: [],
  }
}

describe('ViewerRuntime', () => {
  it('isolates molecule, selection, and editor state between instances', () => {
    const first = createViewerRuntime()
    const second = createViewerRuntime()

    first.moleculeStore.getState().setMolecule(molecule('N'))
    const atomId = first.moleculeStore.getState().objectsById[
      first.moleculeStore.getState().activeObjectId!
    ].molecule.atoms[0].id
    first.moleculeStore.getState().selectAtom(atomId)
    first.editorStore.getState().setActiveElement('O')
    first.editorStore.getState().setTheme('iboview')

    expect(first.moleculeStore.getState().selectedAtomIds.has(atomId)).toBe(true)
    const secondObjectId = second.moleculeStore.getState().activeObjectId!
    expect(secondObjectId).not.toBe(first.moleculeStore.getState().activeObjectId)
    expect(second.moleculeStore.getState().objectsById[secondObjectId].molecule.atoms).toHaveLength(0)
    expect(second.moleculeStore.getState().selectedAtomIds.size).toBe(0)
    expect(second.editorStore.getState().activeElement).toBe('C')
    expect(second.editorStore.getState().themeId).toBe('default')

    first.dispose()
    second.dispose()
  })

  it('keeps viewport and capture registrations scoped to the runtime', () => {
    const first = createViewerRuntime()
    const second = createViewerRuntime()
    const disposeCapture = first.capture.register(() => 'first')
    const calls: string[] = []
    const disposeViewport = first.viewport.register({
      fitViewport: () => calls.push('fit'),
      focusViewportSelection: () => undefined,
      resetViewport: () => undefined,
      setViewportAxesVisible: () => undefined,
      setViewportGridVisible: () => undefined,
    })

    expect(first.capture.capture()).toBe('first')
    expect(second.capture.capture()).toBeNull()
    expect(first.viewport.invoke(controller => controller.fitViewport())).toBe(true)
    expect(second.viewport.invoke(controller => controller.fitViewport())).toBe(false)
    expect(calls).toEqual(['fit'])

    disposeCapture()
    disposeViewport()
    expect(first.capture.capture()).toBeNull()
    expect(first.viewport.invoke(controller => controller.fitViewport())).toBe(false)

    first.dispose()
    second.dispose()
  })
})
