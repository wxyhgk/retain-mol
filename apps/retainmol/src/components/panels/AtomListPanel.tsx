import { useMoleculeStore, selectActiveMoleculeOrEmpty, getElementConfig as getElement, cn } from '@retainmol/mol-viewer'
import { ScrollArea } from '@/components/ui/scroll-area'

function colorHexToCss(hex: number) {
  return `#${hex.toString(16).padStart(6, '0')}`
}

export default function AtomListPanel() {
  const { selectedAtomIds, selectAtom } = useMoleculeStore()
  const molecule = useMoleculeStore(selectActiveMoleculeOrEmpty)

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-1.5 text-[11px] text-gray-400 tabular-nums">
        {molecule.atoms.length} 个原子
      </div>
      <ScrollArea className="flex-1 bg-gray-50">
        <div className="p-2 space-y-0.5">
          {molecule.atoms.length === 0 && (
            <div className="text-xs text-gray-400 text-center py-6">暂无原子</div>
          )}
          {molecule.atoms.map((a, i) => {
            const el = getElement(a.symbol)
            const selected = selectedAtomIds.has(a.id)
            return (
              <button
                key={a.id}
                onClick={(e) => selectAtom(a.id, e.shiftKey)}
                className={cn(
                  'w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left transition-colors text-xs border',
                  selected
                    ? 'bg-[#007AFF] border-[#007AFF] text-white'
                    : 'bg-white border-transparent hover:bg-gray-100 hover:border-gray-200 text-gray-700'
                )}
              >
                <span className="text-gray-400 w-5 text-right shrink-0 tabular-nums">{i + 1}</span>
                <span
                  className="w-5 h-5 rounded-full shrink-0 flex items-center justify-center font-bold text-[9px] text-white"
                  style={{ backgroundColor: colorHexToCss(el.color) }}
                >
                  {a.symbol}
                </span>
                <span className="flex-1 font-medium">{el.name}</span>
                <span className="text-gray-400 font-mono tabular-nums text-[10px]">
                  ({a.x.toFixed(2)}, {a.y.toFixed(2)})
                </span>
              </button>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}
