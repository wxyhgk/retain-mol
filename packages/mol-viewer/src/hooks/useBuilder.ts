/**
 * useBuilder — 分子建模交互 hook
 * 连接 builder commands（纯编辑命令）和 Zustand store（状态）
 */

import { useCallback, useEffect, useMemo } from 'react'
import type { BuilderInteractionHandlers } from '../lib/interaction/contracts'
import { useViewerRuntimeServices, type ViewerRuntime } from '../runtime/ViewerRuntime'
import { createAtomDragEditSession } from '../runtime/editingSessions'
import {
  getBuilderGrowGuide,
  getBuilderGrowPreview,
  canHandleBuilderBondDrag,
  canHandleBuilderFragmentTorsion,
  handleBuilderAtomClick,
  handleBuilderAtomDoubleClick,
  handleBuilderBackgroundClick,
  handleBuilderBondClick,
  handleBuilderBondDragEnd,
  handleBuilderBondDragStart,
  handleBuilderFragmentTorsionEnd,
  handleBuilderFragmentTorsionStart,
  getBuilderFragmentTorsionPreview,
} from './builderPointerHandlers'

export type BuilderHandlers = BuilderInteractionHandlers

export function useBuilder(runtimeOverride?: ViewerRuntime): BuilderHandlers {
  const { moleculeStore: store, editorStore } = useViewerRuntimeServices(runtimeOverride)
  const atomDragSession = useMemo(() => createAtomDragEditSession(store), [store])
  useEffect(() => () => atomDragSession.cancel(), [atomDragSession])

  const onAtomClick = useCallback((atomId: string, event: MouseEvent) => {
    handleBuilderAtomClick(store, atomId, event, editorStore)
  }, [store, editorStore])

  const onBondClick = useCallback((bondId: string, event: MouseEvent) => {
    handleBuilderBondClick(store, bondId, event, editorStore)
  }, [store, editorStore])

  // 空白点击由 intent 路由：构建态放置，选择态清选择，测量态提交。
  // 相机拖拽会被 InteractionHandler 的位移阈值拦截，不会误触放置。
  const onBackgroundClick: BuilderHandlers['onBackgroundClick'] = useCallback((worldPos, event, viewDirLocal) => {
    handleBuilderBackgroundClick(store, worldPos, event, viewDirLocal, editorStore)
  }, [store, editorStore])

  const onAtomDragStart = useCallback((id: string) => {
    atomDragSession.start(id)
  }, [atomDragSession])

  const onAtomDrag = useCallback((id: string, x: number, y: number, z: number) => {
    atomDragSession.move(id, { x, y, z })
  }, [atomDragSession])

  const onAtomDragEnd = useCallback((_id: string) => {
    atomDragSession.end()
  }, [atomDragSession])

  const onAtomDragCancel = useCallback((_id: string) => {
    atomDragSession.cancel()
  }, [atomDragSession])

  const onAtomDoubleClick = useCallback((atomId: string, _event: MouseEvent) => {
    handleBuilderAtomDoubleClick(store, atomId, editorStore)
  }, [store, editorStore])

  // Pointer down only performs this pure eligibility query. Scene activation is
  // deferred until the gesture crosses the drag threshold.
  const canStartBondDrag = useCallback((sourceId: string): boolean => {
    return canHandleBuilderBondDrag(store, sourceId, editorStore)
  }, [store, editorStore])

  const onBondDragStart = useCallback((sourceId: string): boolean => {
    return handleBuilderBondDragStart(store, sourceId, editorStore)
  }, [store, editorStore])

  const onBondDragEnd: BuilderHandlers['onBondDragEnd'] = useCallback((sourceId, targetId, dropLocal) => {
    handleBuilderBondDragEnd(store, sourceId, targetId, dropLocal, editorStore)
  }, [store, editorStore])

  // 拖出生长的实时预览：返回 VSEPR 吸附后的落点和新原子外观
  const getGrowPreview: BuilderHandlers['getGrowPreview'] = useCallback((
    sourceId, cursorLocal, freeDirection,
  ) => {
    return getBuilderGrowPreview(store, sourceId, cursorLocal, freeDirection, editorStore)
  }, [store, editorStore])

  // 拖出生长开始时的候选槽位参考几何（环 / 点）
  const getGrowGuide: BuilderHandlers['getGrowGuide'] = useCallback((sourceId) => {
    return getBuilderGrowGuide(store, sourceId, editorStore)
  }, [store, editorStore])

  const canStartFragmentTorsion = useCallback((targetId: string) => (
    canHandleBuilderFragmentTorsion(store, targetId, editorStore)
  ), [store, editorStore])

  const onFragmentTorsionStart = useCallback((targetId: string) => (
    handleBuilderFragmentTorsionStart(store, targetId, editorStore)
  ), [store, editorStore])

  const getFragmentTorsionPreview = useCallback((targetId: string, angleDegrees: number) => (
    getBuilderFragmentTorsionPreview(store, targetId, angleDegrees, editorStore)
  ), [store, editorStore])

  const onFragmentTorsionEnd = useCallback((targetId: string, angleDegrees: number) => {
    handleBuilderFragmentTorsionEnd(store, targetId, angleDegrees, editorStore)
  }, [store, editorStore])

  return {
    onAtomClick, onAtomDoubleClick, onBondClick, onBackgroundClick,
    onAtomDragStart, onAtomDrag, onAtomDragEnd, onAtomDragCancel,
    canStartBondDrag, onBondDragStart, onBondDragEnd, getGrowPreview, getGrowGuide,
    canStartFragmentTorsion, onFragmentTorsionStart,
    getFragmentTorsionPreview, onFragmentTorsionEnd,
  }
}
