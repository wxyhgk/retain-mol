import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { computeMoleculeRevision } from '@retainmol/mol-viewer/headless'
import { defaultViewerRuntime, getViewerApi } from '@retainmol/mol-viewer/runtime'
import { useMoleculeStore, selectActiveMoleculeOrEmpty } from './moleculeState'
import { useEditorStore } from './editorState'
import { beginAppTask, endAppTask, useAppTaskStore } from '@/store/appTaskStore'
import { activateAppWorkspaceTool } from '../workspaceToolController'
import { buildEntityRows, queryEntityRows } from '@/features/inspector/model/entityBrowser'
import { inspectorUndoReason, replaceInspectorAtom, selectInspectorTarget, setInspectorBondOrder, undoInspectorEdit, type InspectorTarget } from './inspectorActions'

function target(kind: InspectorTarget['kind'] = 'atom', id = kind === 'atom' ? 'oxygen' : 'co'): InspectorTarget {
  const state = useMoleculeStore.getState()
  return { objectId: state.activeObjectId!, kind, id, revision: computeMoleculeRevision(selectActiveMoleculeOrEmpty(state)), label: id }
}
const molecule = () => selectActiveMoleculeOrEmpty(useMoleculeStore.getState())
const history = () => useMoleculeStore.temporal.getState()

beforeEach(() => {
  history().resume()
  useMoleculeStore.setState({ objectsById: {}, objectOrder: [], activeObjectId: null, selectedAtomIds: new Set(), selectedBondIds: new Set() })
  useMoleculeStore.getState().setMolecule({ name: 'fixture', atoms: [
    { id: 'carbon', symbol: 'C', x: 0, y: 0, z: 0 },
    { id: 'oxygen', symbol: 'O', x: 1.4, y: 0, z: 0 },
  ], bonds: [{ id: 'co', atomId1: 'carbon', atomId2: 'oxygen', order: 1 }] })
  history().clear()
  useAppTaskStore.setState({ tasks: [] })
})
afterEach(() => vi.restoreAllMocks())

describe('inspector target actions', () => {
  it('searches, selects, focuses, edits and undoes a target in a 100-atom molecule', () => {
    const atoms = Array.from({ length: 100 }, (_, i) => ({ id: `atom-${i}`, symbol: i === 72 ? 'O' : 'C', x: i, y: 0, z: 0 }))
    useMoleculeStore.getState().setMolecule({ atoms, bonds: [] })
    history().clear()
    const row = queryEntityRows(buildEntityRows(molecule(), 'atom', new Set(), new Set()), 'O', false, 0).rows[0]!
    const binding = { ...target(row.kind, row.id), label: row.label }
    const focus = vi.spyOn(getViewerApi(defaultViewerRuntime).view, 'focusSelection').mockReturnValue(true)
    expect(selectInspectorTarget(binding).status).toBe('success')
    expect(focus).not.toHaveBeenCalled()
    expect(selectInspectorTarget(binding, true).status).toBe('success')
    const result = replaceInspectorAtom(binding, 'N')
    expect(result.status).toBe('success')
    expect(molecule().atoms.filter(atom => atom.symbol === 'N').map(atom => atom.id)).toEqual(['atom-72'])
    expect(undoInspectorEdit(result.undo!).status).toBe('success')
    expect(molecule().atoms).toEqual(atoms)
  })
  it('selects by stable ID without focusing or creating history, and leaves drawing mode', () => {
    activateAppWorkspaceTool('draw')
    const focus = vi.spyOn(getViewerApi(defaultViewerRuntime).view, 'focusSelection').mockReturnValue(true)
    expect(selectInspectorTarget(target())).toMatchObject({ status: 'success' })
    expect([...useMoleculeStore.getState().selectedAtomIds]).toEqual(['oxygen'])
    expect(useEditorStore.getState().brushArmed).toBe(false)
    expect(focus).not.toHaveBeenCalled()
    expect(history().pastStates).toHaveLength(0)
  })
  it('focuses only explicitly and reports unavailable viewport', () => {
    const focus = vi.spyOn(getViewerApi(defaultViewerRuntime).view, 'focusSelection').mockReturnValue(false)
    expect(selectInspectorTarget(target('bond'), true)).toMatchObject({ status: 'rejected', code: 'viewport-unavailable' })
    expect([...useMoleculeStore.getState().selectedBondIds]).toEqual(['co'])
    focus.mockReturnValue(true)
    expect(selectInspectorTarget(target(), true)).toMatchObject({ status: 'success' })
    expect(focus).toHaveBeenCalledTimes(2)
  })
  it('edits and restores the exact scene with one undo', () => {
    selectInspectorTarget(target())
    const before = molecule()
    const result = replaceInspectorAtom(target(), 'N')
    expect(result).toMatchObject({ status: 'success', target: { id: 'oxygen' } })
    expect(molecule().atoms.find(atom => atom.id === 'oxygen')?.symbol).toBe('N')
    expect(history().pastStates).toHaveLength(1)
    expect([...useMoleculeStore.getState().selectedAtomIds]).toEqual(['oxygen'])
    expect(result.undo).toBeDefined()
    expect(undoInspectorEdit(result.undo!)).toMatchObject({ status: 'success', message: '已恢复本次编辑前的结构' })
    expect(molecule()).toEqual(before)
    expect(history().pastStates).toHaveLength(0)
    expect(history().futureStates).toHaveLength(1)
    expect(undoInspectorEdit(result.undo!)).toMatchObject({ status: 'rejected' })
  })
  it('reports no-op and invalid edits without history or loss of redo', () => {
    useMoleculeStore.getState().moveAtom('oxygen', 2, 0, 0)
    history().undo()
    const future = history().futureStates
    expect(replaceInspectorAtom(target(), 'O')).toMatchObject({ status: 'noop' })
    expect(replaceInspectorAtom(target(), 'Invalid')).toMatchObject({ status: 'rejected' })
    expect(history().pastStates).toHaveLength(0)
    expect(history().futureStates).toBe(future)
  })
  it('rejects stale revision and removed targets', () => {
    const old = target()
    useMoleculeStore.getState().moveAtom('carbon', 3, 0, 0)
    expect(replaceInspectorAtom(old, 'N')).toMatchObject({ status: 'rejected', code: 'stale-context' })
    expect(selectInspectorTarget(old)).toMatchObject({ status: 'rejected', code: 'stale-context' })
    useMoleculeStore.getState().removeAtom('oxygen')
    const before = useMoleculeStore.getState().objectsById
    expect(replaceInspectorAtom(old, 'N')).toMatchObject({ status: 'rejected', code: 'entity-not-found' })
    expect(useMoleculeStore.getState().objectsById).toBe(before)
  })
  it('rejects a switched object even when the entity ID is reused', () => {
    const old = target()
    const second = useMoleculeStore.getState().addToScene({ atoms: [{ id: 'oxygen', symbol: 'F', x: 0, y: 0, z: 0 }], bonds: [] })
    useMoleculeStore.getState().setActiveObject(second)
    const before = useMoleculeStore.getState().objectsById
    expect(replaceInspectorAtom(old, 'N')).toMatchObject({ status: 'rejected', code: 'target-not-active' })
    expect(selectInspectorTarget(old)).toMatchObject({ status: 'rejected', code: 'target-not-active' })
    expect(useMoleculeStore.getState().objectsById).toBe(before)
  })
  it.each(['locked', 'hidden'] as const)('rejects %s object edits', mode => {
    const old = target()
    if (mode === 'locked') useMoleculeStore.getState().setObjectLocked(old.objectId, true)
    else useMoleculeStore.getState().setObjectVisible(old.objectId, false)
    history().clear()
    expect(replaceInspectorAtom(old, 'N')).toMatchObject({ status: 'rejected', code: 'object-not-editable' })
    expect(history().pastStates).toHaveLength(0)
  })
  it('rejects selection, edit and undo while busy', () => {
    const result = replaceInspectorAtom(target(), 'N')
    const current = target()
    const task = beginAppTask('test', '')
    expect(selectInspectorTarget(current)).toMatchObject({ status: 'rejected', code: 'busy' })
    expect(replaceInspectorAtom(current, 'F')).toMatchObject({ status: 'rejected', code: 'busy' })
    expect(undoInspectorEdit(result.undo!)).toMatchObject({ status: 'rejected', code: 'undo-unavailable' })
    endAppTask(task)
    const transaction = useMoleculeStore.getState().beginTransaction('test')
    try {
      expect(selectInspectorTarget(current)).toMatchObject({ status: 'rejected', code: 'busy' })
      expect(replaceInspectorAtom(current, 'F')).toMatchObject({ status: 'rejected', code: 'busy' })
      expect(undoInspectorEdit(result.undo!)).toMatchObject({ status: 'rejected', code: 'undo-unavailable' })
    } finally { transaction.cancel() }
    expect(history().pastStates).toHaveLength(1)
  })
  it('does not undo a later unrelated edit or a cleared history', () => {
    const result = replaceInspectorAtom(target(), 'N')
    useMoleculeStore.getState().moveAtom('carbon', 2, 0, 0)
    const before = molecule()
    expect(inspectorUndoReason(result.undo!)).toBeTruthy()
    expect(undoInspectorEdit(result.undo!)).toMatchObject({ status: 'rejected' })
    expect(molecule()).toBe(before)
    history().undo()
    history().clear()
    expect(undoInspectorEdit(result.undo!)).toMatchObject({ status: 'rejected' })
  })
  it('changes the explicit bond and can undo its receipt', () => {
    const result = setInspectorBondOrder(target('bond'), 2)
    expect(result.status).toBe('success')
    expect(molecule().bonds[0]?.order).toBe(2)
    expect(undoInspectorEdit(result.undo!).status).toBe('success')
    expect(molecule().bonds[0]?.order).toBe(1)
    expect(setInspectorBondOrder(target(), 2)).toMatchObject({ status: 'rejected', code: 'invalid-target' })
  })
})
