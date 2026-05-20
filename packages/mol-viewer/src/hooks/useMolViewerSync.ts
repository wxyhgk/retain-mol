/**
 * useMolViewerSync — MolViewer 受控/非受控 prop 与 store 双向同步
 *
 * 解决的问题：MolViewer 同时支持"受控"（外部传 prop）和"非受控"（内部 store 自管）
 * 两种模式。prop 写入 store 不该触发 onChange 回调，否则循环。
 *
 * 返回最终生效的 displayMode / showAtomLabels / theme（prop 优先，缺省退回 store）。
 */

import { useEffect, useRef } from 'react'
import { useMoleculeStore, selectActiveMolecule } from '../store/moleculeStore'
import { useEditorStore } from '../store/editorStore'
import { resolveTheme, type ResolvedTheme } from '../presets'
import type { DisplayMode } from '../lib/types'
import type { Molecule } from '../lib/molecule'

interface SyncProps {
  molecule?:          Molecule
  onMoleculeChange?:  (mol: Molecule) => void
  selectedAtomIds?:   ReadonlySet<string>
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
  onSelectionChange,
  displayMode: displayModeProp,
  theme: themeProp,
  showAtomLabels: showAtomLabelsProp,
}: SyncProps): SyncResult {

  const storeDisplayMode    = useEditorStore(s => s.displayMode)
  const storeShowAtomLabels = useEditorStore(s => s.showAtomLabels)
  const storeTheme          = useEditorStore(s => s.theme)

  // ── molecule prop → store ────────────────────────────────────────────────
  // lastPropMolRef：记住最后一次由 prop 写入的引用，防止 store 变更回调给外部再循环写入
  const lastPropMolRef = useRef<Molecule | undefined>(undefined)

  useEffect(() => {
    if (moleculeProp === undefined || moleculeProp === lastPropMolRef.current) return
    lastPropMolRef.current = moleculeProp
    useMoleculeStore.getState().setMolecule(moleculeProp)
  }, [moleculeProp])

  // ── store → onMoleculeChange ─────────────────────────────────────────────
  useEffect(() => {
    if (!onMoleculeChange) return
    return useMoleculeStore.subscribe(
      s => selectActiveMolecule(s),
      (mol) => {
        if (mol && mol !== lastPropMolRef.current) onMoleculeChange(mol)
      },
    )
  }, [onMoleculeChange])

  // ── selectedAtomIds prop → store ─────────────────────────────────────────
  // selectionVersion 防循环：prop 写入后记住版本号，subscription 收到同版本时跳过
  const lastPropSelVersionRef = useRef(-1)

  useEffect(() => {
    if (selectedAtomIdsProp === undefined) return
    useMoleculeStore.getState().selectAtoms(selectedAtomIdsProp, 'replace')
    lastPropSelVersionRef.current = useMoleculeStore.getState().selectionVersion
  }, [selectedAtomIdsProp])

  // ── store → onSelectionChange ────────────────────────────────────────────
  useEffect(() => {
    if (!onSelectionChange) return
    return useMoleculeStore.subscribe(
      s => s.selectionVersion,
      (version) => {
        if (version === lastPropSelVersionRef.current) return
        const { selectedAtomIds: a, selectedBondIds: b } = useMoleculeStore.getState()
        onSelectionChange(new Set(a), new Set(b))
      },
    )
  }, [onSelectionChange])

  // ── theme prop → store ───────────────────────────────────────────────────
  useEffect(() => {
    if (themeProp === undefined) return
    useEditorStore.getState().setTheme(themeProp)
  }, [themeProp])

  // ── showAtomLabels prop → store ──────────────────────────────────────────
  useEffect(() => {
    if (showAtomLabelsProp === undefined) return
    useEditorStore.getState().setShowAtomLabels(showAtomLabelsProp)
  }, [showAtomLabelsProp])

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
