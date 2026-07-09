/**
 * useBuilder — 分子建模交互 hook
 * 连接 builder commands（纯编辑命令）和 Zustand store（状态）
 */

import { useCallback, useRef } from 'react'
import * as THREE from 'three'
import { useMoleculeStore } from '../store/moleculeStore'
import type { GrowGuideSpec } from '../lib/types'
import type { Molecule } from '../lib/molecule'
import { createAtomDragEditSession } from './editSessionFactory'
import {
  getBuilderPlacementPreview,
  getBuilderGrowGuide,
  getBuilderGrowPreview,
  handleBuilderAtomClick,
  handleBuilderAtomDoubleClick,
  handleBuilderBackgroundClick,
  handleBuilderBackgroundDoubleClick,
  handleBuilderBondClick,
  handleBuilderBondDragEnd,
  handleBuilderBondDragStart,
} from './builderPointerHandlers'

export interface BuilderHandlers {
  onAtomClick: (atomId: string, event: MouseEvent) => void
  onAtomDoubleClick: (atomId: string, event: MouseEvent) => void
  onBondClick: (bondId: string, event: MouseEvent) => void
  onBackgroundClick: (worldPos: THREE.Vector3, event: MouseEvent, viewDirLocal?: THREE.Vector3) => void
  onBackgroundDoubleClick: (worldPos: THREE.Vector3, event: MouseEvent, viewDirLocal?: THREE.Vector3) => void
  onAtomDragStart: (id: string) => void
  onAtomDrag: (id: string, x: number, y: number, z: number) => void
  onAtomDragEnd: (id: string) => void
  onBondDragStart: (sourceId: string) => boolean
  onBondDragEnd: (sourceId: string, targetId: string | null, dropLocal: THREE.Vector3 | null) => void
  getGrowPreview: (sourceId: string, cursorLocal: THREE.Vector3, freeDirection: boolean)
    => { pos: THREE.Vector3; radius: number; color: number } | null
  getGrowGuide: (sourceId: string) => GrowGuideSpec
  getPlacementPreview: (worldPos: THREE.Vector3, viewDirLocal?: THREE.Vector3) => Molecule | null
}

export function useBuilder(): BuilderHandlers {
  const store = useMoleculeStore
  const atomDragSessionRef = useRef<ReturnType<typeof createAtomDragEditSession> | null>(null)
  if (!atomDragSessionRef.current) {
    atomDragSessionRef.current = createAtomDragEditSession(store)
  }

  const onAtomClick = useCallback((atomId: string, event: MouseEvent) => {
    handleBuilderAtomClick(store, atomId, event)
  }, [store])

  const onBondClick = useCallback((bondId: string, event: MouseEvent) => {
    handleBuilderBondClick(store, bondId, event)
  }, [store])

  // 单击空白只做无害操作（清除选择/提交测量），放置一律走双击 ——
  // 转视角和点击共用左键，误触不能产生编辑
  const onBackgroundClick = useCallback((_worldPos: THREE.Vector3, event: MouseEvent) => {
    handleBuilderBackgroundClick(store, event)
  }, [store])

  // 双击空白 = 放置（仅构建态）：片段笔刷放完整片段，否则放单个光原子（单原子就是单原子）
  const onBackgroundDoubleClick = useCallback((worldPos: THREE.Vector3, _event: MouseEvent, viewDirLocal?: THREE.Vector3) => {
    handleBuilderBackgroundDoubleClick(store, worldPos, viewDirLocal)
  }, [store])

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
    handleBuilderAtomDoubleClick(store, atomId)
  }, [store])

  // 返回 true 则 InteractionHandler 进入 bond-drag 候选模式（智能指针的拖拽手势：
  // 拖到原子=成键，拖到空白=生长新原子；位移不足时由 click 处理器接管）
  const onBondDragStart = useCallback((sourceId: string): boolean => {
    return handleBuilderBondDragStart(store, sourceId)
  }, [store])

  const onBondDragEnd = useCallback((sourceId: string, targetId: string | null, dropLocal: THREE.Vector3 | null) => {
    handleBuilderBondDragEnd(store, sourceId, targetId, dropLocal)
  }, [store])

  // 拖出生长的实时预览：返回 VSEPR 吸附后的落点和新原子外观
  const getGrowPreview = useCallback((
    sourceId: string, cursorLocal: THREE.Vector3, freeDirection: boolean,
  ): { pos: THREE.Vector3; radius: number; color: number } | null => {
    return getBuilderGrowPreview(store, sourceId, cursorLocal, freeDirection)
  }, [store])

  // 拖出生长开始时的候选槽位参考几何（环 / 点）
  const getGrowGuide = useCallback((sourceId: string): GrowGuideSpec => {
    return getBuilderGrowGuide(store, sourceId)
  }, [store])

  const getPlacementPreview = useCallback((worldPos: THREE.Vector3, viewDirLocal?: THREE.Vector3): Molecule | null => {
    return getBuilderPlacementPreview(store, worldPos, viewDirLocal)
  }, [store])

  return {
    onAtomClick, onAtomDoubleClick, onBondClick, onBackgroundClick, onBackgroundDoubleClick,
    onAtomDragStart, onAtomDrag, onAtomDragEnd,
    onBondDragStart, onBondDragEnd, getGrowPreview, getGrowGuide, getPlacementPreview,
  }
}
