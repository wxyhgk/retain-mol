/**
 * useBuilder — 分子建模交互 hook
 * 连接 builder commands（纯编辑命令）和 Zustand store（状态）
 */

import { useCallback, useEffect, useRef } from 'react'
import * as THREE from 'three'
import type { GrowGuideSpec } from '../lib/types'
import { useViewerRuntime, type ViewerRuntime } from '../runtime/ViewerRuntime'
import { createAtomDragEditSession } from './editSessionFactory'
import {
  getBuilderGrowGuide,
  getBuilderGrowPreview,
  handleBuilderAtomClick,
  handleBuilderAtomDoubleClick,
  handleBuilderBackgroundClick,
  handleBuilderBondClick,
  handleBuilderBondDragEnd,
  handleBuilderBondDragStart,
} from './builderPointerHandlers'

export interface BuilderHandlers {
  onAtomClick: (atomId: string, event: MouseEvent) => void
  onAtomDoubleClick: (atomId: string, event: MouseEvent) => void
  onBondClick: (bondId: string, event: MouseEvent) => void
  onBackgroundClick: (worldPos: THREE.Vector3, event: MouseEvent, viewDirLocal?: THREE.Vector3) => void
  onAtomDragStart: (id: string) => void
  onAtomDrag: (id: string, x: number, y: number, z: number) => void
  onAtomDragEnd: (id: string) => void
  onBondDragStart: (sourceId: string) => boolean
  onBondDragEnd: (sourceId: string, targetId: string | null, dropLocal: THREE.Vector3 | null) => void
  getGrowPreview: (sourceId: string, cursorLocal: THREE.Vector3, freeDirection: boolean)
    => { pos: THREE.Vector3; radius: number; color: number } | null
  getGrowGuide: (sourceId: string) => GrowGuideSpec
}

export function useBuilder(runtimeOverride?: ViewerRuntime): BuilderHandlers {
  const contextRuntime = useViewerRuntime()
  const runtime = runtimeOverride ?? contextRuntime
  const store = runtime.moleculeStore
  const editorStore = runtime.editorStore
  const atomDragSessionRef = useRef<ReturnType<typeof createAtomDragEditSession> | null>(null)
  if (!atomDragSessionRef.current) {
    atomDragSessionRef.current = createAtomDragEditSession(store)
  }

  useEffect(() => () => atomDragSessionRef.current?.end(), [])

  const onAtomClick = useCallback((atomId: string, event: MouseEvent) => {
    handleBuilderAtomClick(store, atomId, event, editorStore)
  }, [store, editorStore])

  const onBondClick = useCallback((bondId: string, event: MouseEvent) => {
    handleBuilderBondClick(store, bondId, event, editorStore)
  }, [store, editorStore])

  // 空白点击由 intent 路由：构建态放置，选择态清选择，测量态提交。
  // 相机拖拽会被 InteractionHandler 的位移阈值拦截，不会误触放置。
  const onBackgroundClick = useCallback((worldPos: THREE.Vector3, event: MouseEvent, viewDirLocal?: THREE.Vector3) => {
    handleBuilderBackgroundClick(store, worldPos, event, viewDirLocal, editorStore)
  }, [store, editorStore])

  const onAtomDragStart = useCallback((id: string) => {
    atomDragSessionRef.current?.start(id)
  }, [])

  const onAtomDrag = useCallback((id: string, x: number, y: number, z: number) => {
    atomDragSessionRef.current?.move(id, { x, y, z })
  }, [])

  const onAtomDragEnd = useCallback((_id: string) => {
    atomDragSessionRef.current?.end()
  }, [])

  const onAtomDoubleClick = useCallback((atomId: string, _event: MouseEvent) => {
    handleBuilderAtomDoubleClick(store, atomId, editorStore)
  }, [store, editorStore])

  // 返回 true 则 InteractionHandler 进入 bond-drag 候选模式（智能指针的拖拽手势：
  // 拖到原子=成键，拖到空白=生长新原子；位移不足时由 click 处理器接管）
  const onBondDragStart = useCallback((sourceId: string): boolean => {
    return handleBuilderBondDragStart(store, sourceId, editorStore)
  }, [store, editorStore])

  const onBondDragEnd = useCallback((sourceId: string, targetId: string | null, dropLocal: THREE.Vector3 | null) => {
    handleBuilderBondDragEnd(store, sourceId, targetId, dropLocal, editorStore)
  }, [store, editorStore])

  // 拖出生长的实时预览：返回 VSEPR 吸附后的落点和新原子外观
  const getGrowPreview = useCallback((
    sourceId: string, cursorLocal: THREE.Vector3, freeDirection: boolean,
  ): { pos: THREE.Vector3; radius: number; color: number } | null => {
    return getBuilderGrowPreview(store, sourceId, cursorLocal, freeDirection, editorStore)
  }, [store, editorStore])

  // 拖出生长开始时的候选槽位参考几何（环 / 点）
  const getGrowGuide = useCallback((sourceId: string): GrowGuideSpec => {
    return getBuilderGrowGuide(store, sourceId, editorStore)
  }, [store, editorStore])

  return {
    onAtomClick, onAtomDoubleClick, onBondClick, onBackgroundClick,
    onAtomDragStart, onAtomDrag, onAtomDragEnd,
    onBondDragStart, onBondDragEnd, getGrowPreview, getGrowGuide,
  }
}
