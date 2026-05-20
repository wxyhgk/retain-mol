import { useEffect, useState } from 'react'
import { useMoleculeStore, selectActiveMoleculeOrEmpty } from '../../store/moleculeStore'
import { MolRenderer } from '../../lib/molRenderer'
import { getElementConfig } from '../../config/elements.config'
import { cn } from '../../lib/utils'

interface Props {
  renderer: MolRenderer | null
}

const QUICK_ELEMENTS = ['C', 'H', 'O', 'N', 'S', 'F', 'Cl', 'Br', 'P', 'I']

// 标准周期表布局（18列×7行），null = 空格
// 只展示前5周期 + 常用重元素，跳过稀有气体
const PERIODS: (string | null)[][] = [
  ['H',  null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,'He'],
  ['Li','Be',null,null,null,null,null,null,null,null,null,null,'B', 'C', 'N', 'O', 'F', 'Ne'],
  ['Na','Mg',null,null,null,null,null,null,null,null,null,null,'Al','Si','P', 'S', 'Cl','Ar'],
  ['K', 'Ca','Sc','Ti','V', 'Cr','Mn','Fe','Co','Ni','Cu','Zn','Ga','Ge','As','Se','Br','Kr'],
  ['Rb','Sr','Y', 'Zr','Nb','Mo','Tc','Ru','Rh','Pd','Ag','Cd','In','Sn','Sb','Te','I', 'Xe'],
]

// 元素分类颜色（用于周期表背景色）
const CATEGORY: Record<string, string> = {
  H:'nonmetal', He:'noble', Li:'alkali', Be:'alkaline',
  B:'metalloid', C:'nonmetal', N:'nonmetal', O:'nonmetal', F:'nonmetal', Ne:'noble',
  Na:'alkali', Mg:'alkaline', Al:'metal', Si:'metalloid', P:'nonmetal', S:'nonmetal', Cl:'nonmetal', Ar:'noble',
  K:'alkali', Ca:'alkaline', Sc:'transition', Ti:'transition', V:'transition', Cr:'transition',
  Mn:'transition', Fe:'transition', Co:'transition', Ni:'transition', Cu:'transition', Zn:'transition',
  Ga:'metal', Ge:'metalloid', As:'metalloid', Se:'nonmetal', Br:'nonmetal', Kr:'noble',
  Rb:'alkali', Sr:'alkaline', Y:'transition', Zr:'transition', Nb:'transition', Mo:'transition',
  Tc:'transition', Ru:'transition', Rh:'transition', Pd:'transition', Ag:'transition', Cd:'transition',
  In:'metal', Sn:'metal', Sb:'metalloid', Te:'metalloid', I:'nonmetal', Xe:'noble',
}
const CAT_BG: Record<string, string> = {
  alkali:'#ff6b6b22', alkaline:'#ffa94d22', transition:'#74c0fc22',
  metal:'#a9e34b22', metalloid:'#da77f222', nonmetal:'#63e6be22', noble:'#e9ecef22',
}
const CAT_BORDER: Record<string, string> = {
  alkali:'#ff6b6b55', alkaline:'#ffa94d55', transition:'#74c0fc55',
  metal:'#a9e34b55', metalloid:'#da77f255', nonmetal:'#63e6be55', noble:'#e9ecef55',
}

export default function AtomContextMenu({ renderer }: Props) {
  const [menu, setMenu]           = useState<{ x: number; y: number } | null>(null)
  const [tableOpen, setTableOpen] = useState(false)

  const commonElement = (() => {
    const { selectedAtomIds } = useMoleculeStore.getState()
    const molecule = selectActiveMoleculeOrEmpty(useMoleculeStore.getState())
    const sel = molecule.atoms.filter(a => selectedAtomIds.has(a.id))
    if (!sel.length) return null
    const first = sel[0].symbol
    return sel.every(a => a.symbol === first) ? first : null
  })()

  // 监听 canvas 右键
  useEffect(() => {
    if (!renderer) return
    const canvas = renderer.canvas
    let downOnAtom = false, downPos = { x: 0, y: 0 }

    const onDown = (e: PointerEvent) => {
      if (e.button !== 2) return
      const { selectedAtomIds } = useMoleculeStore.getState()
      if (!selectedAtomIds.size) return
      const atomId = renderer.pickAtomIdAt(e.clientX, e.clientY)
      if (!atomId || !selectedAtomIds.has(atomId)) return
      e.stopImmediatePropagation()
      downOnAtom = true
      downPos = { x: e.clientX, y: e.clientY }
    }
    const onUp = (e: PointerEvent) => {
      if (e.button !== 2 || !downOnAtom) return
      downOnAtom = false
      if (Math.abs(e.clientX - downPos.x) < 3 && Math.abs(e.clientY - downPos.y) < 3)
        setMenu({ x: e.clientX, y: e.clientY })
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
      setMenu(null); setTableOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setMenu(null); setTableOpen(false) }
    }
    window.addEventListener('pointerdown', onDocDown)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('pointerdown', onDocDown)
      window.removeEventListener('keydown', onKey)
    }
  }, [menu])

  if (!menu) return null

  const handlePick = (sym: string) => {
    const { selectedAtomIds, replaceAtom, beginTransaction, endTransaction } = useMoleculeStore.getState()
    beginTransaction()
    selectedAtomIds.forEach(id => replaceAtom(id, sym))
    endTransaction()
    setMenu(null); setTableOpen(false)
  }

  // 定位：避免越出屏幕
  const BAR_W = 40 + QUICK_ELEMENTS.length * 34 + 16
  const left = Math.min(menu.x, window.innerWidth  - BAR_W - 8)
  const top  = Math.min(menu.y, window.innerHeight - 48    - 8)

  // 周期表展开方向：若下方空间不足则向上展开
  const TABLE_H = 5 * 28 + 24
  const tableTop = top + 48 + 6
  const openUp   = tableTop + TABLE_H > window.innerHeight - 8

  return (
    <div data-atom-ctx className="fixed z-50" style={{ left, top }} onContextMenu={e => e.preventDefault()}>

      {/* ── 快捷行 ── */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl shadow-xl">

        {/* 周期表图标按钮 */}
        <button
          onClick={() => setTableOpen(v => !v)}
          className={cn(
            'w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all mr-1',
            tableOpen
              ? 'bg-[#007AFF]/10 text-[#007AFF] border border-[#007AFF]/30'
              : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100 border border-transparent'
          )}
          title="更多元素"
        >
          ⬡
        </button>

        {/* 常用元素 */}
        {QUICK_ELEMENTS.map(sym => {
          const hex = `#${getElementConfig(sym).color.toString(16).padStart(6, '0')}`
          const isActive = commonElement === sym
          return (
            <button key={sym} onClick={() => handlePick(sym)}
              className="w-8 h-8 rounded-lg text-[11px] font-bold transition-all hover:scale-110 active:scale-95"
              style={{
                background: isActive ? `${hex}30` : `${hex}12`,
                color: hex,
                border: `1.5px solid ${isActive ? hex : `${hex}40`}`,
                boxShadow: isActive ? `0 0 0 2px ${hex}30` : undefined,
              }}
            >
              {sym}
            </button>
          )
        })}
      </div>

      {/* ── 完整周期表 ── */}
      {tableOpen && (
        <div
          className="absolute left-0 bg-white/97 backdrop-blur-sm border border-gray-200 rounded-xl shadow-2xl p-2"
          style={{ [openUp ? 'bottom' : 'top']: 'calc(100% + 6px)', minWidth: 18 * 26 + 16 }}
        >
          <div className="text-[9px] text-gray-400 mb-1.5 px-0.5 flex items-center justify-between">
            <span>选择元素</span>
            <span className="flex gap-2">
              {Object.entries({ '非金属':'#63e6be', '过渡':'#74c0fc', '金属':'#a9e34b', '类金属':'#da77f2' }).map(([k,c]) => (
                <span key={k} className="flex items-center gap-0.5">
                  <span className="inline-block w-2 h-2 rounded-sm" style={{ background: c }} />
                  <span>{k}</span>
                </span>
              ))}
            </span>
          </div>

          {PERIODS.map((row, ri) => (
            <div key={ri} className="flex gap-0.5 mb-0.5">
              {row.map((sym, ci) => {
                if (!sym) return <div key={ci} className="w-6 h-6 shrink-0" />
                const hex   = `#${getElementConfig(sym).color.toString(16).padStart(6, '0')}`
                const cat   = CATEGORY[sym] ?? 'transition'
                const bg    = CAT_BG[cat]   ?? '#f8f9fa22'
                const bdr   = CAT_BORDER[cat] ?? '#dee2e655'
                const isActive = commonElement === sym
                return (
                  <button
                    key={sym}
                    onClick={() => handlePick(sym)}
                    className="w-6 h-6 shrink-0 rounded text-[9px] font-bold transition-all hover:scale-125 hover:z-10 relative active:scale-95"
                    style={{
                      background: isActive ? `${hex}35` : bg,
                      color:      isActive ? hex : '#374151',
                      border:     `1px solid ${isActive ? hex : bdr}`,
                      boxShadow:  isActive ? `0 0 0 1.5px ${hex}40` : undefined,
                    }}
                    title={sym}
                  >
                    {sym}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
