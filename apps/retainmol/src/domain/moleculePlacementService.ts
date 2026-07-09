import { centerMolecule, type Molecule } from '@retainmol/mol-viewer/core'
import { is2D } from '@retainmol/mol-viewer/io'
import { useMoleculeStore } from '@/domain/viewerAdapter'
import { moleculePositionWriter } from '@/domain/moleculePositionWriter'
import { flattenMolecule, generate3DAsync, relaxAnimate } from '@/lib/moleculeOpt'
import { useUiStore } from '@/lib/uiStore'

export type MoleculePlacementMode = 'replace' | 'add-to-scene'

export interface MoleculePlacementOptions {
  readonly mode: MoleculePlacementMode
  readonly animate2DTo3D?: boolean
}

function commitMolecule(molecule: Molecule, mode: MoleculePlacementMode): string | null {
  const store = useMoleculeStore.getState()
  if (mode === 'replace') {
    store.setMolecule(molecule)
    return useMoleculeStore.getState().activeObjectId
  }
  return store.addToScene(molecule)
}

/**
 * App workflow boundary for putting parsed/search/pasted molecules into the viewer.
 * Data preparation stays here; actual molecule/scene mutation still goes through mol-viewer store actions.
 */
export async function placeMoleculeInViewer(
  molecule: Molecule,
  options: MoleculePlacementOptions,
): Promise<string | null> {
  const animate2DTo3D = options.animate2DTo3D ?? true
  if (!animate2DTo3D || !is2D(molecule)) {
    return commitMolecule(centerMolecule(molecule), options.mode)
  }

  useUiStore.getState().setBusy('正在用距离几何生成 3D 结构…')
  const result = await generate3DAsync(molecule)
  useUiStore.getState().setBusy(null)

  const final = centerMolecule(result.ok ? result.molecule : molecule)
  if (!result.ok) return commitMolecule(final, options.mode)

  const flatFinal = flattenMolecule(final)
  const objectId = commitMolecule(flatFinal, options.mode)
  if (objectId) {
    await relaxAnimate(objectId, flatFinal, { target: final, writer: moleculePositionWriter })
  }
  return objectId
}
