import {
  forwardRef,
  useId,
  useImperativeHandle,
  useRef,
  type FormEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import type { BondLengthHandle } from '../../lib/builder/geometry/bondLengthHandle'

export interface BondLengthOverlayFrame {
  readonly p1: { readonly x: number; readonly y: number }
  readonly p2: { readonly x: number; readonly y: number }
  readonly length: number
}

export interface BondLengthGizmoViewHandle {
  updateFrame(frame: BondLengthOverlayFrame): void
  getInputValue(): string
  setInputValue(value: number): void
}

export interface BondLengthGizmoPointerHandlers {
  readonly onBeginDrag: (handle: BondLengthHandle, event: ReactPointerEvent<SVGCircleElement>) => void
  readonly onPointerMove: (event: ReactPointerEvent<SVGCircleElement>) => void
  readonly onPointerUp: (event: ReactPointerEvent<SVGCircleElement>) => void
  readonly onPointerCancel: (event: ReactPointerEvent<SVGCircleElement>) => void
}

interface Props extends BondLengthGizmoPointerHandlers {
  readonly editable: boolean
  readonly reason?: string
  readonly onSubmitExactLength: (event: FormEvent) => void
}

export const BondLengthGizmoView = forwardRef<BondLengthGizmoViewHandle, Props>(function BondLengthGizmoView({
  editable,
  reason,
  onBeginDrag,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  onSubmitExactLength,
}, forwardedRef) {
  const rootRef = useRef<HTMLDivElement>(null)
  const lineRef = useRef<SVGLineElement>(null)
  const leftRef = useRef<SVGCircleElement>(null)
  const centerRef = useRef<SVGCircleElement>(null)
  const rightRef = useRef<SVGCircleElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const markerId = `bond-length-arrow-${useId().replace(/:/g, '')}`

  useImperativeHandle(forwardedRef, () => ({
    updateFrame(frame) {
      const centerX = (frame.p1.x + frame.p2.x) / 2
      const centerY = (frame.p1.y + frame.p2.y) / 2
      setLine(lineRef.current, frame.p1.x, frame.p1.y, frame.p2.x, frame.p2.y)
      setPoint(leftRef.current, frame.p1.x, frame.p1.y)
      setPoint(centerRef.current, centerX, centerY)
      setPoint(rightRef.current, frame.p2.x, frame.p2.y)
      if (formRef.current) {
        formRef.current.style.left = `${centerX}px`
        formRef.current.style.top = `${centerY - 34}px`
      }
      if (rootRef.current) rootRef.current.style.visibility = 'visible'
      if (inputRef.current && document.activeElement !== inputRef.current) {
        inputRef.current.value = frame.length.toFixed(3)
      }
    },
    getInputValue() {
      return inputRef.current?.value ?? ''
    },
    setInputValue(value) {
      if (inputRef.current) inputRef.current.value = value.toFixed(3)
    },
  }), [])

  const pointerHandlers = { onPointerMove, onPointerUp, onPointerCancel }
  const stroke = editable ? 'currentColor' : '#8a8a8a'

  return (
    <div
      ref={rootRef}
      aria-label="键长编辑器"
      title={reason}
      style={{ position: 'absolute', inset: 0, zIndex: 18, pointerEvents: 'none', color: 'var(--foreground, #111)', visibility: 'hidden' }}
    >
      <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
        <defs>
          <marker id={markerId} markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto-start-reverse">
            <path d="M 7 1 L 1 4 L 7 7" fill="none" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </marker>
        </defs>
        <line
          ref={lineRef}
          stroke={stroke}
          strokeWidth="1.5"
          strokeDasharray={editable ? undefined : '4 4'}
          markerStart={`url(#${markerId})`}
          markerEnd={`url(#${markerId})`}
        />
        <GizmoHandle
          ref={leftRef}
          ariaLabel="固定右侧，移动左侧片段"
          enabled={editable}
          onPointerDown={event => onBeginDrag('left', event)}
          {...pointerHandlers}
        />
        <GizmoHandle
          ref={centerRef}
          ariaLabel="对称移动两侧片段"
          enabled={editable}
          center
          onPointerDown={event => onBeginDrag('center', event)}
          {...pointerHandlers}
        />
        <GizmoHandle
          ref={rightRef}
          ariaLabel="固定左侧，移动右侧片段"
          enabled={editable}
          onPointerDown={event => onBeginDrag('right', event)}
          {...pointerHandlers}
        />
      </svg>
      <form
        ref={formRef}
        onSubmit={onSubmitExactLength}
        style={{
          position: 'absolute',
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          alignItems: 'center',
          gap: 3,
          padding: '4px 7px',
          border: '1px solid var(--border, #d4d4d4)',
          borderRadius: 6,
          background: 'color-mix(in srgb, var(--card, white) 92%, transparent)',
          boxShadow: '0 4px 14px rgba(0,0,0,.12)',
          pointerEvents: 'auto',
          opacity: editable ? 1 : 0.78,
        }}
      >
        <input
          ref={inputRef}
          aria-label="精确键长"
          disabled={!editable}
          inputMode="decimal"
          style={{ width: 52, border: 0, outline: 0, padding: 0, background: 'transparent', color: 'inherit', font: '600 11px ui-monospace, monospace', textAlign: 'right' }}
        />
        <span style={{ font: '10px ui-monospace, monospace', opacity: 0.68 }}>Å</span>
      </form>
    </div>
  )
})

const GizmoHandle = forwardRef<SVGCircleElement, {
  readonly ariaLabel: string
  readonly enabled: boolean
  readonly center?: boolean
  readonly onPointerDown: (event: ReactPointerEvent<SVGCircleElement>) => void
  readonly onPointerMove: (event: ReactPointerEvent<SVGCircleElement>) => void
  readonly onPointerUp: (event: ReactPointerEvent<SVGCircleElement>) => void
  readonly onPointerCancel: (event: ReactPointerEvent<SVGCircleElement>) => void
}>(function GizmoHandle({
  ariaLabel,
  enabled,
  center = false,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
}, ref) {
  return (
    <circle
      ref={ref}
      role="button"
      aria-label={ariaLabel}
      aria-disabled={!enabled}
      r={center ? 6 : 7}
      fill={center ? 'var(--foreground, #111)' : 'var(--card, white)'}
      stroke="var(--foreground, #111)"
      strokeWidth="1.5"
      style={{ pointerEvents: enabled ? 'all' : 'none', cursor: enabled ? 'ew-resize' : 'not-allowed', touchAction: 'none' }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
    />
  )
})

function setLine(line: SVGLineElement | null, x1: number, y1: number, x2: number, y2: number) {
  if (!line) return
  line.setAttribute('x1', String(x1))
  line.setAttribute('y1', String(y1))
  line.setAttribute('x2', String(x2))
  line.setAttribute('y2', String(y2))
}

function setPoint(point: SVGCircleElement | null, x: number, y: number) {
  if (!point) return
  point.setAttribute('cx', String(x))
  point.setAttribute('cy', String(y))
}
