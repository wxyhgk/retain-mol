import { useCallback, useEffect, useMemo, useRef, type FormEvent, type PointerEvent as ReactPointerEvent } from 'react'
import type { ThreeRendererPort } from '../../lib/molRenderer'
import { Phase } from '../../lib/animation'
import { selectActiveMoleculeOrEmpty } from '../../store/moleculeStore'
import {
  createBondLengthEditPlan,
  createBondLengthPositions,
  type BondLengthEditPlan,
  type BondLengthHandle,
} from '../../lib/builder/geometry/bondLengthHandle'
import { useViewerRuntimeServices } from '../../runtime/ViewerRuntime'
import { createBondLengthEditSession } from '../../hooks/editSessionFactory'
import type { BondLengthGizmoViewHandle } from './BondLengthGizmoView'

interface Options {
  readonly renderer: ThreeRendererPort | null
  readonly visible: boolean
  readonly readOnly: boolean
  readonly atomIds: readonly [string, string] | null
}

interface DragSession {
  readonly pointerId: number
  readonly handle: BondLengthHandle
  readonly startClientX: number
  readonly startClientY: number
  readonly plan: BondLengthEditPlan
  readonly editSession: ReturnType<typeof createBondLengthEditSession>
}

const MIN_LENGTH = 0.1
const MAX_LENGTH = 10

export function useBondLengthGizmoController({ renderer, visible, readOnly, atomIds }: Options) {
  const { moleculeStore, editorStore, ticker } = useViewerRuntimeServices()
  const viewRef = useRef<BondLengthGizmoViewHandle>(null)
  const dragRef = useRef<DragSession | null>(null)
  const atomId1 = atomIds?.[0] ?? null
  const atomId2 = atomIds?.[1] ?? null
  const active = Boolean(renderer && visible && !readOnly && atomId1 && atomId2)
  const availability = useMemo(() => {
    if (!atomId1 || !atomId2) return null
    return createBondLengthEditPlan(selectActiveMoleculeOrEmpty(moleculeStore.getState()), atomId1, atomId2)
  }, [atomId1, atomId2, moleculeStore])

  useEffect(() => {
    if (!renderer || !active || !atomId1 || !atomId2) return
    const updateView = () => {
      const molecule = selectActiveMoleculeOrEmpty(moleculeStore.getState())
      const atom1 = molecule.atoms.find(atom => atom.id === atomId1)
      const atom2 = molecule.atoms.find(atom => atom.id === atomId2)
      if (!atom1 || !atom2) return
      const p1 = renderer.projectAtomToScreen(atomId1, renderer.canvas.clientWidth, renderer.canvas.clientHeight)
      const p2 = renderer.projectAtomToScreen(atomId2, renderer.canvas.clientWidth, renderer.canvas.clientHeight)
      if (!p1 || !p2) return
      viewRef.current?.updateFrame({
        p1,
        p2,
        length: Math.hypot(atom2.x - atom1.x, atom2.y - atom1.y, atom2.z - atom1.z),
      })
    }

    const key = `bond-length-gizmo:${atomId1}:${atomId2}`
    const unsubscribe = ticker.subscribe(key, Phase.Overlay, updateView)
    const unsubscribePositions = moleculeStore.subscribe(state => state.atomPositionVersion, () => ticker.invalidate())
    const unsubscribeCameraStart = renderer.controls.on('interactionstart', () => ticker.startContinuous(`${key}:camera`))
    const unsubscribeCameraEnd = renderer.controls.on('interactionend', () => {
      ticker.stopContinuous(`${key}:camera`)
      ticker.invalidate()
    })
    const unsubscribeWheel = renderer.controls.on('wheel', () => ticker.invalidate())
    ticker.invalidate()

    return () => {
      unsubscribe()
      unsubscribePositions()
      unsubscribeCameraStart()
      unsubscribeCameraEnd()
      unsubscribeWheel()
      ticker.stopContinuous(`${key}:camera`)
    }
  }, [renderer, active, atomId1, atomId2, moleculeStore, ticker])

  const stopDrag = useCallback((cancel: boolean) => {
    const drag = dragRef.current
    if (!drag) return
    if (cancel) drag.editSession.cancel()
    else drag.editSession.end()
    dragRef.current = null
    ticker.stopContinuous('bond-length-drag')
    ticker.invalidate()
  }, [ticker])

  useEffect(() => {
    const cancelOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || !dragRef.current) return
      event.preventDefault()
      stopDrag(true)
    }
    window.addEventListener('keydown', cancelOnEscape)
    return () => window.removeEventListener('keydown', cancelOnEscape)
  }, [stopDrag])

  useEffect(() => () => stopDrag(true), [stopDrag])

  const onBeginDrag = useCallback((handle: BondLengthHandle, event: ReactPointerEvent<SVGCircleElement>) => {
    if (!atomId1 || !atomId2 || dragRef.current) return
    const result = createBondLengthEditPlan(selectActiveMoleculeOrEmpty(moleculeStore.getState()), atomId1, atomId2)
    if (result.ok === false) {
      editorStore.getState().flashHint(result.reason)
      return
    }
    event.preventDefault()
    event.stopPropagation()
    try {
      const editSession = createBondLengthEditSession(moleculeStore)
      editSession.start()
      dragRef.current = {
        pointerId: event.pointerId,
        handle,
        startClientX: event.clientX,
        startClientY: event.clientY,
        plan: result.plan,
        editSession,
      }
      event.currentTarget.setPointerCapture(event.pointerId)
      ticker.startContinuous('bond-length-drag')
    } catch (error) {
      editorStore.getState().flashHint(error instanceof Error ? error.message : '当前无法开始键长编辑')
    }
  }, [atomId1, atomId2, moleculeStore, editorStore, ticker])

  const onPointerMove = useCallback((event: ReactPointerEvent<SVGCircleElement>) => {
    const drag = dragRef.current
    if (!renderer || !drag || drag.pointerId !== event.pointerId) return
    event.preventDefault()
    event.stopPropagation()
    const localDelta = renderer.screenDeltaToModelLocal(
      event.clientX - drag.startClientX,
      event.clientY - drag.startClientY,
    )
    const projected = (
      localDelta.x * drag.plan.axis.x
      + localDelta.y * drag.plan.axis.y
      + localDelta.z * drag.plan.axis.z
    ) * (event.shiftKey ? 0.2 : 1)
    const rawTarget = drag.plan.initialLength + (drag.handle === 'left' ? -projected : projected)
    const step = event.shiftKey ? 0.005 : 0.02
    const target = clamp(Math.round(rawTarget / step) * step, MIN_LENGTH, MAX_LENGTH)
    moleculeStore.getState().setAtomPositions(createBondLengthPositions(drag.plan, target, drag.handle))
  }, [renderer, moleculeStore])

  const onPointerUp = useCallback((event: ReactPointerEvent<SVGCircleElement>) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    event.preventDefault()
    event.stopPropagation()
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
    stopDrag(false)
  }, [stopDrag])

  const onPointerCancel = useCallback((event: ReactPointerEvent<SVGCircleElement>) => {
    if (dragRef.current?.pointerId === event.pointerId) stopDrag(true)
  }, [stopDrag])

  const onSubmitExactLength = useCallback((event: FormEvent) => {
    event.preventDefault()
    if (!atomId1 || !atomId2) return
    const target = Number.parseFloat(viewRef.current?.getInputValue() ?? '')
    if (!Number.isFinite(target) || target < MIN_LENGTH || target > MAX_LENGTH) {
      editorStore.getState().flashHint(`键长需在 ${MIN_LENGTH}–${MAX_LENGTH} Å 之间`)
      const molecule = selectActiveMoleculeOrEmpty(moleculeStore.getState())
      const a = molecule.atoms.find(atom => atom.id === atomId1)
      const b = molecule.atoms.find(atom => atom.id === atomId2)
      if (a && b) viewRef.current?.setInputValue(Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z))
      return
    }
    const result = createBondLengthEditPlan(selectActiveMoleculeOrEmpty(moleculeStore.getState()), atomId1, atomId2)
    if (result.ok === false) {
      editorStore.getState().flashHint(result.reason)
      return
    }
    moleculeStore.getState().runTransaction('bond-length-input', () => {
      moleculeStore.getState().setAtomPositions(createBondLengthPositions(result.plan, target, 'center'))
    })
    editorStore.getState().flashHint(`键长已设为 ${target.toFixed(3)} Å`)
  }, [atomId1, atomId2, moleculeStore, editorStore])

  return {
    active,
    editable: availability?.ok === true,
    reason: availability?.ok === false ? availability.reason : undefined,
    viewRef,
    onBeginDrag,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
    onSubmitExactLength,
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}
