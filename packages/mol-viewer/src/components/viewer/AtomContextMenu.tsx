import { useEffect, useState } from 'react'
import { selectActiveMoleculeOrEmpty } from '../../store/moleculeStore'
import type { ThreeRendererPort } from '../../lib/molRenderer'
import { cn } from '../../lib/utils'
import {
  commitContextAtomCharge,
  commitContextAtomHydrogen,
  commitContextAtomRadical,
  commitContextAtomRemoval,
  commitContextAtomReplacement,
  selectContextAtomIfNeeded,
} from './atomContextMenuEffects'
import { useViewerRuntimeServices } from '../../runtime/ViewerRuntime'

interface Props {
  renderer: ThreeRendererPort | null
}

const COMMON_ELEMENTS = ['C', 'H', 'O', 'N', 'S', 'P', 'F', 'Cl', 'Br', 'I', 'Si', 'B']

interface MenuState { x: number; y: number; atomId: string }

export default function AtomContextMenu({ renderer }: Props) {
  const { moleculeStore } = useViewerRuntimeServices()
  const [menu, setMenu]       = useState<MenuState | null>(null)
  const [showPicker, setShowPicker] = useState(false)

  // 监听 canvas 右键：右键任意原子即可打开，同时自动选中它
  useEffect(() => {
    if (!renderer) return
    const canvas = renderer.canvas
    let downAtomId: string | null = null
    let downPos = { x: 0, y: 0 }

    const onDown = (e: PointerEvent) => {
      if (e.button !== 2) return
      const id = renderer.pickAtomIdAt(e.clientX, e.clientY)
      if (!id) return
      e.stopImmediatePropagation()
      // 右键点中的原子没选中时，先选中它
      selectContextAtomIfNeeded(id, moleculeStore.getState)
      downAtomId = id
      downPos = { x: e.clientX, y: e.clientY }
    }
    const onUp = (e: PointerEvent) => {
      if (e.button !== 2 || !downAtomId) return
      const id = downAtomId; downAtomId = null
      if (Math.abs(e.clientX - downPos.x) < 3 && Math.abs(e.clientY - downPos.y) < 3)
        setMenu({ x: e.clientX, y: e.clientY, atomId: id })
    }

    canvas.addEventListener('pointerdown', onDown, { capture: true })
    window.addEventListener('pointerup', onUp)
    return () => {
      canvas.removeEventListener('pointerdown', onDown, { capture: true })
      window.removeEventListener('pointerup', onUp)
    }
  }, [renderer, moleculeStore])

  // 点击外部 / Esc 关闭
  useEffect(() => {
    if (!menu) return
    const onDocDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest('[data-atom-ctx]')) return
      setMenu(null); setShowPicker(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setMenu(null); setShowPicker(false) }
    }
    window.addEventListener('pointerdown', onDocDown)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('pointerdown', onDocDown)
      window.removeEventListener('keydown', onKey)
    }
  }, [menu])

  if (!menu) return null

  const mol = selectActiveMoleculeOrEmpty(moleculeStore.getState())
  const atom = mol.atoms.find(a => a.id === menu.atomId)
  if (!atom) return null

  const close = () => { setMenu(null); setShowPicker(false) }

  const isHAtom = atom.symbol === 'H'
  const addHAvailability = moleculeStore.getState().canAddOneHydrogen(menu.atomId)

  const handleAddH = () => {
    commitContextAtomHydrogen(menu.atomId, moleculeStore.getState)
    close()
  }

  const handleReplace = (sym: string) => {
    commitContextAtomReplacement(menu.atomId, sym, moleculeStore.getState)
    close()
  }

  const handleDelete = () => {
    commitContextAtomRemoval(menu.atomId, moleculeStore.getState)
    close()
  }

  const charge = atom.charge ?? 0
  const radical = atom.radical ?? 0
  const chargeLabel = charge === 0 ? '0' : charge > 0 ? `+${charge}` : `${charge}`
  const bumpCharge = (d: number) => {
    commitContextAtomCharge(menu.atomId, charge + d, moleculeStore.getState)
  }
  const toggleRadical = () => {
    commitContextAtomRadical(menu.atomId, radical > 0 ? 0 : 1, moleculeStore.getState)
    close()
  }

  // 定位：避免越出屏幕
  const MENU_W = 160
  const left = Math.min(menu.x, window.innerWidth  - MENU_W - 8)
  const top  = Math.min(menu.y, window.innerHeight - 200   - 8)

  return (
    <div
      data-atom-ctx
      className="fixed z-50 w-40 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden text-xs"
      style={{ left, top }}
      onContextMenu={e => e.preventDefault()}
    >
      {/* 原子信息头 */}
      <div className="px-3 py-2 border-b border-gray-100 flex items-center gap-2">
        <span className="font-semibold text-gray-900">{atom.symbol}</span>
        <span className="text-gray-400 text-[10px]">
          ({atom.x.toFixed(2)}, {atom.y.toFixed(2)})
        </span>
      </div>

      {/* 操作列表 */}
      <div className="py-1">
        <MenuItem onClick={addHAvailability.ok ? handleAddH : close} disabled={!addHAvailability.ok}>
          {addHAvailability.ok ? '加一个 H' : (addHAvailability.reason ?? '无法加 H')}
        </MenuItem>

        <MenuItem onClick={() => setShowPicker(v => !v)}>
          <span>替换元素</span>
          <span className={cn('ml-auto text-gray-400 transition-transform', showPicker && 'rotate-90')}>›</span>
        </MenuItem>

        {showPicker && (
          <div className="px-2 py-1.5 border-t border-b border-gray-100">
            <div className="grid grid-cols-4 gap-0.5">
              {COMMON_ELEMENTS.map(sym => (
                <button
                  key={sym}
                  onClick={() => handleReplace(sym)}
                  className={cn(
                    'h-7 rounded text-[11px] font-medium transition-all',
                    sym === atom.symbol
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  )}
                >
                  {sym}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="my-1 border-t border-gray-100" />

        {/* 形式电荷 +/−（改变有效价态并增删 H） */}
        {!isHAtom && (
          <div className="px-3 py-1.5 flex items-center gap-2">
            <span className="text-gray-600">电荷</span>
            <div className="ml-auto flex items-center gap-1">
              <button onClick={() => bumpCharge(-1)}
                className="w-5 h-5 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 leading-none">−</button>
              <span className="w-6 text-center font-mono text-gray-900">{chargeLabel}</span>
              <button onClick={() => bumpCharge(1)}
                className="w-5 h-5 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 leading-none">+</button>
            </div>
          </div>
        )}

        {!isHAtom && (
          <MenuItem onClick={toggleRadical}>
            <span>自由基</span>
            <span className="ml-auto text-gray-400">{radical > 0 ? '● 开' : '○ 关'}</span>
          </MenuItem>
        )}

        <div className="my-1 border-t border-gray-100" />

        <MenuItem onClick={handleDelete} danger>
          删除
        </MenuItem>
      </div>
    </div>
  )
}

function MenuItem({ children, onClick, danger = false, disabled = false }: {
  children: React.ReactNode
  onClick: () => void
  danger?: boolean
  disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'w-full flex items-center px-3 py-1.5 text-left transition-colors',
        disabled
          ? 'text-gray-300 cursor-not-allowed'
          : danger
            ? 'text-red-500 hover:bg-red-50'
            : 'text-gray-700 hover:bg-gray-100'
      )}
    >
      {children}
    </button>
  )
}
