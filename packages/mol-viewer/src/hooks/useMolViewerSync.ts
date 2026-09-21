/**
 * useMolViewerSync — MolViewer 受控/非受控 prop 与 store 双向同步
 *
 * 解决的问题：MolViewer 同时支持"受控"（外部传 prop）和"非受控"（内部 store 自管）
 * 两种模式。prop 写入 store 不该触发 onChange 回调，否则循环。
 *
 * 返回最终生效的 displayMode / showAtomLabels / theme（prop 优先，缺省退回 store）。
 */

import { useEffect, useRef } from 'react'
import { selectActiveMolecule } from '../store/moleculeStore'
import { useViewerRuntimeServices, type ViewerRuntime } from '../runtime/ViewerRuntime'
import { resolveTheme, type ResolvedTheme } from '../presets'
import type { DisplayMode } from '../lib/presentation/types'
import type { Molecule } from '../lib/molecule'
import {
  commitControlledMoleculePropToStore,
  commitControlledSelectionPropsToStore,
  runControlledStoreCommit,
  shouldNotifyControlledStoreChange,
} from './useMolViewerSyncEffects'

interface SyncProps {
  molecule?:          Molecule
  onMoleculeChange?:  (mol: Molecule) => void
  selectedAtomIds?:   ReadonlySet<string>
  selectedBondIds?:   ReadonlySet<string>
  onSelectionChange?: (atomIds: Set<string>, bondIds: Set<string>) => void
  displayMode?:       DisplayMode
  theme?:             string
  showAtomLabels?:    boolean
}

interface SyncResult {
  displayMode:    DisplayMode
  showAtomLabels: boolean
  theme:          ResolvedTheme
}

export function useMolViewerSync({
  molecule: moleculeProp,
  onMoleculeChange,
  selectedAtomIds: selectedAtomIdsProp,
  selectedBondIds: selectedBondIdsProp,
  onSelectionChange,
  displayMode: displayModeProp,
  theme: themeProp,
  showAtomLabels: showAtomLabelsProp,
}: SyncProps, runtimeOverride?: ViewerRuntime): SyncResult {
  const { moleculeStore, editorStore } = useViewerRuntimeServices(runtimeOverride)

  const storeDisplayMode    = editorStore(s => s.displayMode)
  const storeShowAtomLabels = editorStore(s => s.showAtomLabels)
  const storeTheme          = editorStore(s => s.theme)

  // ── molecule prop → store ────────────────────────────────────────────────
  // lastPropMolRef：记住最后一次由 prop 写入的引用，防止 store 变更回调给外部再循环写入
  const lastPropMolRef = useRef<Molecule | undefined>(undefined)
  const controlledMoleculeCommitRef = useRef(false)

  useEffect(() => {
    lastPropMolRef.current = runControlledStoreCommit(
      controlledMoleculeCommitRef,
      () => commitControlledMoleculePropToStore(
        moleculeProp,
        lastPropMolRef.current,
        moleculeStore.getState,
      ),
    )
  }, [moleculeProp, moleculeStore])

  // ── store → onMoleculeChange ─────────────────────────────────────────────
  useEffect(() => {
    if (!onMoleculeChange) return
    return moleculeStore.subscribe(
      s => selectActiveMolecule(s),
      (mol) => {
        if (
          shouldNotifyControlledStoreChange(controlledMoleculeCommitRef) &&
          mol &&
          mol !== lastPropMolRef.current
        ) {
          onMoleculeChange(mol)
        }
      },
    )
  }, [onMoleculeChange, moleculeStore])

  // ── selectedAtomIds prop → store ─────────────────────────────────────────
  // selectionVersion 防循环：prop 写入后记住版本号，subscription 收到同版本时跳过
  const lastPropSelVersionRef = useRef(-1)
  const controlledSelectionCommitRef = useRef(false)

  useEffect(() => {
    const version = runControlledStoreCommit(
      controlledSelectionCommitRef,
      () => commitControlledSelectionPropsToStore(
        selectedAtomIdsProp,
        selectedBondIdsProp,
        moleculeStore.getState,
      ),
    )
    if (version !== null) lastPropSelVersionRef.current = version
  }, [selectedAtomIdsProp, selectedBondIdsProp, moleculeStore])

  // ── store → onSelectionChange ────────────────────────────────────────────
  useEffect(() => {
    if (!onSelectionChange) return
    return moleculeStore.subscribe(
      s => s.selectionVersion,
      (version) => {
        if (!shouldNotifyControlledStoreChange(controlledSelectionCommitRef)) return
        if (version === lastPropSelVersionRef.current) return
        const { selectedAtomIds: a, selectedBondIds: b } = moleculeStore.getState()
        onSelectionChange(new Set(a), new Set(b))
      },
    )
  }, [onSelectionChange, moleculeStore])

  // ── theme prop → store ───────────────────────────────────────────────────
  useEffect(() => {
    if (themeProp === undefined) return
    editorStore.getState().setTheme(themeProp)
  }, [themeProp, editorStore])

  // ── showAtomLabels prop → store ──────────────────────────────────────────
  useEffect(() => {
    if (showAtomLabelsProp === undefined) return
    editorStore.getState().setShowAtomLabels(showAtomLabelsProp)
  }, [showAtomLabelsProp, editorStore])

  // ── 解析最终生效值（prop 优先）──────────────────────────────────────────
  const theme = themeProp != null
    ? (() => { try { return resolveTheme(themeProp) } catch { return storeTheme } })()
    : storeTheme

  return {
    displayMode:    displayModeProp    ?? storeDisplayMode,
    showAtomLabels: showAtomLabelsProp ?? storeShowAtomLabels,
    theme,
  }
}
