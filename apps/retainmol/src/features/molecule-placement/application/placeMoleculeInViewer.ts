import { centerMolecule, type Molecule } from '@retainmol/mol-viewer/core'
import { is2D } from '@retainmol/mol-viewer/io'
import { useEditorStore } from '@/domain/viewer/editorState'
import { useMoleculeStore } from '@/domain/viewer/moleculeState'
import { flattenMolecule } from '@/features/molecule-animation'
import { generateInitial3D } from '@/features/molecular-computation'
import { beginAppTask, endAppTask } from '@/store/appTaskStore'
import {
  MoleculePlacementRequestGate,
  type MoleculePlacementMode,
  type MoleculePlacementRequest,
} from '../domain/moleculePlacementRequestGate'
import {
  abortPlacementAnimation,
  animatePlacement,
  getPlacementSceneRevision,
} from './placementRuntime'

export type { MoleculePlacementMode } from '../domain/moleculePlacementRequestGate'

export interface MoleculePlacementOptions {
  readonly mode: MoleculePlacementMode
  readonly animate2DTo3D?: boolean
}

const placementRequestGate = new MoleculePlacementRequestGate()

export async function runWith3DRequestBusy<T>(operation: () => Promise<T>): Promise<T> {
  const taskId = beginAppTask('molecule-placement', '正在用距离几何生成 3D 结构…')
  try {
    return await operation()
  } finally {
    endAppTask(taskId)
  }
}

function commitMolecule(
  molecule: Molecule,
  request: MoleculePlacementRequest,
): string | null {
  const store = useMoleculeStore.getState()
  if (request.mode === 'replace') {
    if (!placementRequestGate.canCommit(store, request, getPlacementSceneRevision())) return null
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
  const before = useMoleculeStore.getState()
  if (options.mode === 'replace' && before.activeObjectId) {
    abortPlacementAnimation(before.activeObjectId)
  }
  const request = placementRequestGate.begin(
    useMoleculeStore.getState(),
    options.mode,
    getPlacementSceneRevision(),
  )
  const animate2DTo3D = options.animate2DTo3D ?? true
  if (!animate2DTo3D || !is2D(molecule)) {
    return commitMolecule(centerMolecule(molecule), request)
  }

  return runWith3DRequestBusy(async () => {
    const result = await generateInitial3D(molecule)
    if (!placementRequestGate.canCommit(
      useMoleculeStore.getState(),
      request,
      getPlacementSceneRevision(),
    )) return null

    const final = centerMolecule(result.ok ? result.molecule : molecule)
    if (!result.ok) {
      useEditorStore.getState().flashHint(`距离几何失败，已保留二维结构：${result.reason ?? '未知原因'}`)
      return commitMolecule(final, request)
    }

    const flatFinal = flattenMolecule(final)
    const objectId = commitMolecule(flatFinal, request)
    if (objectId) {
      await animatePlacement(
        objectId,
        flatFinal,
        final,
        () => placementRequestGate.isLatest(request),
      )
    }
    return objectId
  })
}
