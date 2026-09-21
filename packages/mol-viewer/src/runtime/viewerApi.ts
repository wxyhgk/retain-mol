import type { Molecule } from '../lib/molecule'
import type { DisplayMode } from '../lib/types'
import { selectActiveMoleculeOrEmpty } from '../store/moleculeStore'
import { getViewerRuntimeServices, type ViewerRuntime } from './ViewerRuntime'

export interface ViewerHistorySnapshot {
  readonly canUndo: boolean
  readonly canRedo: boolean
  readonly undoCount: number
  readonly redoCount: number
}

/** Immutable active-molecule/scene-selection snapshot, suitable for useSyncExternalStore. */
export interface ViewerSnapshot {
  readonly activeObjectId: string | null
  readonly molecule: Molecule
  readonly selectedAtomIds: readonly string[]
  readonly selectedBondIds: readonly string[]
  readonly history: ViewerHistorySnapshot
  readonly displayMode: DisplayMode
  readonly showAtomLabels: boolean
  readonly themeId: string
}

export interface ViewerEditResult {
  readonly ok: boolean
  readonly reason?: string
}

/**
 * Active-molecule edits use the same commands and chemical gates as the viewer UI.
 * Void actions preserve the existing no-op behavior for rejected edits; operations
 * returning ViewerEditResult explain their rejection. Each accepted edit is undoable.
 */
export interface ViewerEditApi {
  addAtom(symbol: string, x: number, y: number, z: number): string
  replaceAtom(atomId: string, symbol: string): void
  removeAtoms(atomIds: readonly string[]): void
  moveAtom(atomId: string, x: number, y: number, z: number): void
  addBond(atomId1: string, atomId2: string, order?: 1 | 2 | 3): void
  removeBond(bondId: string): void
  setBondOrder(bondId: string, order: 1 | 2 | 3): void
  setAtomCharge(atomId: string, charge: number): void
  setAtomRadical(atomId: string, radical: number): void
  addHydrogens(atomId?: string): void
  removeHydrogens(options?: { onlySelected?: boolean }): void
  setChirality(atomId: string, chirality: 'R' | 'S' | 'none'): ViewerEditResult
  setEZ(bondId: string, ez: 'E' | 'Z' | 'none'): ViewerEditResult
  setBondLength(atomId1: string, atomId2: string, length: number): ViewerEditResult
  setBondAngle(atomId1: string, atomId2: string, atomId3: string, degrees: number): ViewerEditResult
  setDihedralAngle(atomId1: string, atomId2: string, atomId3: string, atomId4: string, degrees: number): ViewerEditResult
  removeSelected(): void
}

export interface ViewerSelectionApi {
  /** Invalid IDs are filtered. Selection does not create undo entries. */
  set(atomIds: Iterable<string>, bondIds?: Iterable<string>): void
  clear(): void
}

export interface ViewerHistoryApi {
  /** History operations reject calls during an active edit gesture/transaction. */
  undo(): void
  redo(): void
  clear(): void
}

export interface ViewerViewApi {
  /** Camera commands return false when this runtime has no mounted viewport. */
  fit(): boolean
  focusSelection(): boolean
  reset(): boolean
  setAxesVisible(visible: boolean): boolean
  setGridVisible(visible: boolean): boolean
  setDisplayMode(mode: DisplayMode): void
  setShowAtomLabels(visible: boolean): void
  setTheme(themeId: string): void
  /** PNG data URL, or null when no viewport is mounted. */
  captureImage(scale?: number): string | null
}

export interface ViewerApi {
  /** Stable reference until exposed state changes. Molecule data must not be mutated. */
  getSnapshot(): ViewerSnapshot
  /**
   * Observe API and UI edits, selection, history and display changes. Notifications
   * are coalesced in a microtask so one edit never exposes half-updated history.
   * No initial callback. Unsubscribe and runtime disposal cancel pending callbacks.
   */
  subscribe(listener: () => void): () => void
  /** Replace the active molecule as one undo step. Does not clear history. */
  setMolecule(molecule: Molecule): void
  readonly edit: ViewerEditApi
  readonly selection: ViewerSelectionApi
  readonly history: ViewerHistoryApi
  readonly view: ViewerViewApi
}

const apis = new WeakMap<ViewerRuntime, ViewerApi>()

function sameIds(ids: readonly string[], selected: ReadonlySet<string>): boolean {
  if (ids.length !== selected.size) return false
  let index = 0
  for (const id of selected) if (ids[index++] !== id) return false
  return true
}

/**
 * Obtain a stable, instance-bound facade. Pass the same runtime to MolViewer.
 * This API owns no renderer and never accesses the default instance implicitly.
 * All methods reject use after runtime.dispose().
 */
export function getViewerApi(runtime: ViewerRuntime): ViewerApi {
  const services = getViewerRuntimeServices(runtime)
  const existing = apis.get(runtime)
  if (existing) return existing

  const state = () => getViewerRuntimeServices(runtime).moleculeStore.getState()
  const editor = () => getViewerRuntimeServices(runtime).editorStore.getState()
  const history = () => {
    const temporal = getViewerRuntimeServices(runtime).moleculeStore.temporal.getState()
    if (!temporal.isTracking) throw new Error('Cannot change history during an active edit transaction')
    return temporal
  }
  const subscriptions = new Set<() => void>()
  let snapshot: ViewerSnapshot | undefined
  const getSnapshot = (): ViewerSnapshot => {
    const current = state()
    const temporal = getViewerRuntimeServices(runtime).moleculeStore.temporal.getState()
    const display = editor()
    const molecule = selectActiveMoleculeOrEmpty(current)
    const undoCount = temporal.pastStates.length
    const redoCount = temporal.futureStates.length
    const canUndo = temporal.isTracking && undoCount > 0
    const canRedo = temporal.isTracking && redoCount > 0
    if (snapshot && snapshot.molecule === molecule && snapshot.activeObjectId === current.activeObjectId
      && sameIds(snapshot.selectedAtomIds, current.selectedAtomIds)
      && sameIds(snapshot.selectedBondIds, current.selectedBondIds)
      && snapshot.history.undoCount === undoCount && snapshot.history.redoCount === redoCount
      && snapshot.history.canUndo === canUndo && snapshot.history.canRedo === canRedo
      && snapshot.displayMode === display.displayMode && snapshot.showAtomLabels === display.showAtomLabels
      && snapshot.themeId === display.themeId) return snapshot

    snapshot = Object.freeze({
      activeObjectId: current.activeObjectId,
      molecule,
      selectedAtomIds: Object.freeze([...current.selectedAtomIds]),
      selectedBondIds: Object.freeze([...current.selectedBondIds]),
      history: Object.freeze({ canUndo, canRedo, undoCount, redoCount }),
      displayMode: display.displayMode,
      showAtomLabels: display.showAtomLabels,
      themeId: display.themeId,
    })
    return snapshot
  }

  const api: ViewerApi = {
    getSnapshot,
    subscribe(listener) {
      const currentServices = getViewerRuntimeServices(runtime)
      let previous = getSnapshot()
      let active = true
      let pending = false
      const notify = () => {
        if (!active || pending) return
        pending = true
        queueMicrotask(() => {
          pending = false
          if (!active) return
          const next = getSnapshot()
          if (next === previous) return
          previous = next
          listener()
        })
      }
      const stops = [
        currentServices.moleculeStore.subscribe(notify),
        currentServices.moleculeStore.temporal.subscribe(notify),
        currentServices.editorStore.subscribe(notify),
      ]
      const stop = () => {
        active = false
        for (const unsubscribe of stops) unsubscribe()
        subscriptions.delete(stop)
      }
      subscriptions.add(stop)
      return stop
    },
    setMolecule: molecule => state().setMolecule(molecule),
    edit: {
      addAtom: (...args) => state().addAtom(...args),
      replaceAtom: (...args) => state().replaceAtom(...args),
      removeAtoms: (...args) => state().removeAtoms(...args),
      moveAtom: (...args) => state().moveAtom(...args),
      addBond: (...args) => state().addBond(...args),
      removeBond: (...args) => state().removeBond(...args),
      setBondOrder: (...args) => state().setBondOrder(...args),
      setAtomCharge: (...args) => state().setAtomCharge(...args),
      setAtomRadical: (...args) => state().setAtomRadical(...args),
      addHydrogens: (...args) => state().addHydrogens(...args),
      removeHydrogens: (...args) => state().removeHydrogens(...args),
      setChirality: (...args) => state().setChirality(...args),
      setEZ: (...args) => state().setEZ(...args),
      setBondLength: (...args) => state().setBondLength(...args),
      setBondAngle: (...args) => state().setBondAngle(...args),
      setDihedralAngle: (...args) => state().setDihedralAngle(...args),
      removeSelected: () => state().removeSelected(),
    },
    selection: {
      set: (atomIds, bondIds = []) => state().setSelection(atomIds, bondIds),
      clear: () => state().clearSelection(),
    },
    history: {
      undo: () => history().undo(),
      redo: () => history().redo(),
      clear: () => history().clear(),
    },
    view: {
      fit: () => getViewerRuntimeServices(runtime).viewport.invoke(view => view.fitViewport()),
      focusSelection: () => getViewerRuntimeServices(runtime).viewport.invoke(view => view.focusViewportSelection()),
      reset: () => getViewerRuntimeServices(runtime).viewport.invoke(view => view.resetViewport()),
      setAxesVisible: visible => getViewerRuntimeServices(runtime).viewport.invoke(view => view.setViewportAxesVisible(visible)),
      setGridVisible: visible => getViewerRuntimeServices(runtime).viewport.invoke(view => view.setViewportGridVisible(visible)),
      setDisplayMode: mode => editor().setDisplayMode(mode),
      setShowAtomLabels: visible => editor().setShowAtomLabels(visible),
      setTheme: themeId => editor().setTheme(themeId),
      captureImage: scale => getViewerRuntimeServices(runtime).capture.capture(scale),
    },
  }
  services.onDispose(() => {
    for (const stop of subscriptions) stop()
    snapshot = undefined
    apis.delete(runtime)
  })
  apis.set(runtime, api)
  return api
}
