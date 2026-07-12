import { ArrowUpDown, Trash2 } from 'lucide-react'
import type { Atom, Bond } from '@retainmol/mol-viewer/core'
import { Button } from '@/components/ui/button'

interface Props {
  readonly bonds: Bond[]
  readonly atomById: Map<string, Atom>
  readonly cycleBondOrder: (bondId: string) => void
  readonly removeBond: (bondId: string) => void
}

export function SelectedBondsSection({ bonds, atomById, cycleBondOrder, removeBond }: Props) {
  if (bonds.length === 0) return null
  return (
    <section>
      <div className="mb-2 text-xs font-medium text-gray-700">选中键 ({bonds.length})</div>
      <div className="space-y-2">
        {bonds.map(bond => {
          const atom1 = atomById.get(bond.atomId1)
          const atom2 = atomById.get(bond.atomId2)
          if (!atom1 || !atom2) return null
          const distance = Math.hypot(atom1.x - atom2.x, atom1.y - atom2.y, atom1.z - atom2.z)
          const orderLabel = bond.order === 1 ? '单键' : bond.order === 2 ? '双键' : '三键'
          return (
            <div key={bond.id} className="rounded-lg border border-gray-200 bg-white p-2.5">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="font-semibold text-gray-800">{atom1.symbol} — {atom2.symbol}</span>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-500 hover:bg-gray-100 hover:text-gray-900" onClick={() => cycleBondOrder(bond.id)} title="切换键级">
                    <ArrowUpDown size={12} />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-500 hover:bg-gray-100 hover:text-gray-900" onClick={() => removeBond(bond.id)}>
                    <Trash2 size={12} />
                  </Button>
                </div>
              </div>
              <div className="flex gap-3 text-xs text-gray-500">
                <span className="rounded bg-gray-100 px-1.5 py-0.5">{orderLabel}</span>
                <span className="font-mono">{distance.toFixed(3)} Å</span>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
