import { Link2, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type BondOrder = 1 | 2 | 3

interface SelectedBondSummary {
  readonly id: string
  readonly order: BondOrder
  readonly atomSymbols: readonly string[]
}

interface BondPaletteProps {
  selectedAtomCount: number
  selectedBond: SelectedBondSummary | null
  onConnectSelectedAtoms: () => void
  onSetBondOrder: (order: BondOrder) => void
  onDeleteSelectedBond: () => void
}

export function BondPalette({
  selectedAtomCount,
  selectedBond,
  onConnectSelectedAtoms,
  onSetBondOrder,
  onDeleteSelectedBond,
}: BondPaletteProps) {
  const canConnect = selectedAtomCount === 2

  return (
    <div className="space-y-4">
      <section>
        <SectionHeading label="连接原子" value={`${selectedAtomCount} / 2`} />
        <button
          type="button"
          disabled={!canConnect}
          onClick={onConnectSelectedAtoms}
          className={cn(
            'flex h-10 w-full items-center justify-center gap-2 rounded-md border text-xs font-semibold transition-colors',
            canConnect
              ? 'border-gray-900 bg-gray-900 text-white hover:bg-gray-800'
              : 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400',
          )}
        >
          <Link2 size={14} />
          连接两个已选原子
        </button>
      </section>

      <section className="border-t border-gray-100 pt-4">
        <SectionHeading
          label="选中键"
          value={selectedBond ? selectedBond.atomSymbols.join(' - ') : '0 / 1'}
        />
        {selectedBond ? (
          <div className="space-y-2">
            <div
              role="group"
              aria-label="键级"
              className="grid grid-cols-3 overflow-hidden rounded-md border border-gray-200 bg-gray-50 p-1"
            >
              {([1, 2, 3] as const).map(order => (
                <button
                  key={order}
                  type="button"
                  aria-label={`设为${order === 1 ? '单' : order === 2 ? '双' : '三'}键`}
                  aria-pressed={selectedBond.order === order}
                  onClick={() => onSetBondOrder(order)}
                  className={cn(
                    'h-9 rounded text-xs font-semibold transition-colors',
                    selectedBond.order === order
                      ? 'bg-white text-gray-950 shadow-sm ring-1 ring-gray-200'
                      : 'text-gray-500 hover:bg-white/70 hover:text-gray-900',
                  )}
                >
                  {order}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={onDeleteSelectedBond}
              className="flex h-9 w-full items-center justify-center gap-2 rounded-md border border-foreground text-xs font-medium text-foreground transition-colors hover:bg-foreground hover:text-background"
            >
              <Trash2 size={13} />
              删除选中键
            </button>
          </div>
        ) : (
          <div className="flex h-20 items-center justify-center border-y border-gray-100 text-[11px] text-gray-400">
            未选中单根键
          </div>
        )}
      </section>
    </div>
  )
}

function SectionHeading({ label, value }: { label: string; value: string }) {
  return (
    <div className="mb-2 flex h-5 items-center justify-between gap-2">
      <h3 className="text-[10px] font-semibold text-gray-700">{label}</h3>
      <span className="font-mono text-[9px] text-gray-400">{value}</span>
    </div>
  )
}
