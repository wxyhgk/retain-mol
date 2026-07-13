import { afterEach, describe, expect, it } from 'vitest'
import * as THREE from 'three'
import { useEditorStore } from '../store/editorStore'
import type { Molecule } from '../lib/molecule'
import type { BuilderMoleculeStoreApi } from './builderPointerTypes'
import { handleBuilderBackgroundClick } from './builderBackgroundHandlers'

const editorSnapshot = useEditorStore.getState()

afterEach(() => {
  useEditorStore.setState(editorSnapshot, true)
})

function makeStore(onSetMolecule: (molecule: Molecule) => void): BuilderMoleculeStoreApi {
  const molecule: Molecule = { atoms: [], bonds: [], name: 'Empty' }
  return {
    getState: () => ({
      activeObjectId: 'obj-1',
      objectsById: {
        'obj-1': {
          id: 'obj-1',
          name: 'Empty',
          molecule,
          visible: true,
          locked: false,
        },
      },
      selectedAtomIds: new Set<string>(),
      setMolecule: onSetMolecule,
      selectAtom: () => undefined,
      selectAtoms: () => undefined,
      selectBond: () => undefined,
      clearSelection: () => undefined,
    }),
  } as unknown as BuilderMoleculeStoreApi
}

describe('builder background handler', () => {
  it('keeps a fragment brush armed after successful background placement', () => {
    useEditorStore.setState({
      activeTool: 'select',
      activeFragmentId: 'benzene',
      brushArmed: true,
    })
    const placed: Molecule[] = []

    handleBuilderBackgroundClick(
      makeStore(molecule => placed.push(molecule)),
      new THREE.Vector3(0, 0, 0),
      { shiftKey: false, altKey: false } as MouseEvent,
    )

    expect(placed).toHaveLength(1)
    expect(placed[0]?.atoms).toHaveLength(12)
    expect(useEditorStore.getState()).toMatchObject({
      activeTool: 'select',
      activeFragmentId: 'benzene',
      brushArmed: true,
    })
  })
})
