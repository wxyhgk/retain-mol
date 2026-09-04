import { describe, expect, it, vi } from 'vitest'
import type { Molecule } from '@retainmol/mol-viewer/core'
import { createEditorHostPort, type EditorHostAdapterDependencies } from './editorHostPort'

const firstMolecule: Molecule = { name: 'first', atoms: [], bonds: [] }
const secondMolecule: Molecule = { name: 'second', atoms: [], bonds: [] }

function harness(activeObjectId: string | null = 'object-1') {
  const addToScene = vi.fn(() => 'object-created')
  const setMolecule = vi.fn()
  const clearSelection = vi.fn()
  const notify = vi.fn()
  const subscribe = vi.fn(() => () => {})
  const objectsById: Record<string, { molecule: Molecule }> = activeObjectId
    ? { [activeObjectId]: { molecule: firstMolecule } }
    : {}
  const state: {
    activeObjectId: string | null
    objectsById: Record<string, { molecule: Molecule }>
    addToScene: typeof addToScene
    setMolecule: typeof setMolecule
    clearSelection: typeof clearSelection
  } = {
    activeObjectId,
    objectsById,
    addToScene,
    setMolecule,
    clearSelection,
  }
  const dependencies: EditorHostAdapterDependencies = {
    getMoleculeState: () => state,
    subscribe,
    notify,
  }
  return {
    port: createEditorHostPort(dependencies),
    state,
    addToScene,
    setMolecule,
    clearSelection,
    notify,
    subscribe,
  }
}

describe('editorHostPort', () => {
  it('returns a stable snapshot until the active molecule changes', () => {
    const { port, state } = harness()
    const first = port.getSnapshot()
    expect(port.getSnapshot()).toBe(first)

    state.objectsById['object-1'] = { molecule: secondMolecule }
    const changed = port.getSnapshot()

    expect(changed).not.toBe(first)
    expect(changed.activeMolecule).toBe(secondMolecule)
  })

  it('replaces the active molecule without exposing the store', () => {
    const { port, setMolecule, addToScene } = harness()

    expect(port.replaceActiveMolecule(secondMolecule)).toBe('object-1')
    expect(setMolecule).toHaveBeenCalledWith(secondMolecule)
    expect(addToScene).not.toHaveBeenCalled()
  })

  it('creates an editor object when no active object exists', () => {
    const { port, setMolecule, addToScene } = harness(null)

    expect(port.replaceActiveMolecule(secondMolecule)).toBe('object-created')
    expect(addToScene).toHaveBeenCalledWith(secondMolecule, false)
    expect(setMolecule).not.toHaveBeenCalled()
  })

  it('delegates subscriptions, selection cleanup, and notifications', () => {
    const { port, subscribe, clearSelection, notify } = harness()
    const listener = vi.fn()

    port.subscribe(listener)
    port.clearSelection()
    port.notify('loaded')

    expect(subscribe).toHaveBeenCalledWith(listener)
    expect(clearSelection).toHaveBeenCalledOnce()
    expect(notify).toHaveBeenCalledWith('loaded')
  })
})
