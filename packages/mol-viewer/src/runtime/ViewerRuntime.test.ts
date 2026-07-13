import { describe, expect, it } from 'vitest'
import { newAtom, type Molecule } from '../lib/molecule'
import { createViewerRuntime, getViewerRuntimeServices } from './ViewerRuntime'

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
    const firstServices = getViewerRuntimeServices(first)
    const secondServices = getViewerRuntimeServices(second)

    firstServices.moleculeStore.getState().setMolecule(molecule('N'))
    const atomId = firstServices.moleculeStore.getState().objectsById[
      firstServices.moleculeStore.getState().activeObjectId!
    ].molecule.atoms[0].id
    firstServices.moleculeStore.getState().selectAtom(atomId)
    firstServices.editorStore.getState().setActiveElement('O')
    firstServices.editorStore.getState().setTheme('iboview')

    expect(firstServices.moleculeStore.getState().selectedAtomIds.has(atomId)).toBe(true)
    const secondObjectId = secondServices.moleculeStore.getState().activeObjectId!
    expect(secondObjectId).not.toBe(firstServices.moleculeStore.getState().activeObjectId)
    expect(secondServices.moleculeStore.getState().objectsById[secondObjectId].molecule.atoms).toHaveLength(0)
    expect(secondServices.moleculeStore.getState().selectedAtomIds.size).toBe(0)
    expect(secondServices.editorStore.getState().activeElement).toBe('C')
    expect(secondServices.editorStore.getState().themeId).toBe('default')

    first.dispose()
    second.dispose()
  })

  it('keeps viewport and capture registrations scoped to the runtime', () => {
    const first = createViewerRuntime()
    const second = createViewerRuntime()
    const firstServices = getViewerRuntimeServices(first)
    const secondServices = getViewerRuntimeServices(second)
    const disposeCapture = firstServices.capture.register(() => 'first')
    const calls: string[] = []
    const disposeViewport = firstServices.viewport.register({
      fitViewport: () => calls.push('fit'),
      focusViewportSelection: () => undefined,
      resetViewport: () => undefined,
      setViewportAxesVisible: () => undefined,
      setViewportGridVisible: () => undefined,
    })

    expect(firstServices.capture.capture()).toBe('first')
    expect(secondServices.capture.capture()).toBeNull()
    expect(firstServices.viewport.invoke(controller => controller.fitViewport())).toBe(true)
    expect(secondServices.viewport.invoke(controller => controller.fitViewport())).toBe(false)
    expect(calls).toEqual(['fit'])

    disposeCapture()
    disposeViewport()
    expect(firstServices.capture.capture()).toBeNull()
    expect(firstServices.viewport.invoke(controller => controller.fitViewport())).toBe(false)

    first.dispose()
    second.dispose()
  })
})
