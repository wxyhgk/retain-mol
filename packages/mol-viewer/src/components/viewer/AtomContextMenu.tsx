import { useEffect, useState } from 'react'
import { useMoleculeStore, selectActiveMoleculeOrEmpty } from '../../store/moleculeStore'
import { MolRenderer } from '../../lib/molRenderer'
import { getElementConfig } from '../../config/elements.config'
import { cn } from '../../lib/utils'

interface Props {
  renderer: MolRenderer | null
}

const COMMON_ELEMENTS = ['C', 'H', 'O', 'N', 'S', 'P', 'F', 'Cl', 'Br', 'I', 'Si', 'B']

interface MenuState { x: number; y: number; atomId: string }

export default function AtomContextMenu({ renderer }: Props) {
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
      const { selectedAtomIds, selectAtom } = useMoleculeStore.getState()
      if (!selectedAtomIds.has(id)) selectAtom(id)
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
  }, [renderer])

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

  const mol = selectActiveMoleculeOrEmpty(useMoleculeStore.getState())
  const atom = mol.atoms.find(a => a.id === menu.atomId)
  if (!atom) return null

  const close = () => { setMenu(null); setShowPicker(false) }

  // 用连接数判断，不依赖键级（SDF 键级仅供参考）
  const el = getElementConfig(atom.symbol)
  const connCount = mol.bonds.filter(b => b.atomId1 === atom.id || b.atomId2 === atom.id).length
  const isHAtom = atom.symbol === 'H'
  const canAddH = !isHAtom && el.maxBonds > 0 && connCount < el.maxBonds

  const handleAddH = () => {
    useMoleculeStore.getState().addOneHydrogen(menu.atomId)
    close()
  }

  const handleReplace = (sym: string) => {
    const { selectedAtomIds, replaceAtom, beginTransaction, endTransaction } = useMoleculeStore.getState()
    // 如果多选了，批量替换；否则只替换右键原子
    const ids = selectedAtomIds.size > 1 && selectedAtomIds.has(menu.atomId)
      ? [...selectedAtomIds]
      : [menu.atomId]
    beginTransaction()
    ids.forEach(id => replaceAtom(id, sym))
    endTransaction()
    close()
  }

  const handleDelete = () => {
    const { selectedAtomIds, removeAtom, beginTransaction, endTransaction } = useMoleculeStore.getState()
    const ids = selectedAtomIds.size > 1 && selectedAtomIds.has(menu.atomId)
      ? [...selectedAtomIds]
      : [menu.atomId]
    beginTransaction()
    ids.forEach(id => removeAtom(id))
    endTransaction()
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
        <MenuItem onClick={canAddH ? handleAddH : close} disabled={!canAddH}>
          {canAddH ? '加一个 H' : '已满键，无法加 H'}
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
