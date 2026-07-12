import { FlaskRound, Trash2 } from 'lucide-react'
import { getElementConfig } from '@retainmol/mol-viewer/core'
import type { Atom } from '@retainmol/mol-viewer/core'
import { Button } from '@/components/ui/button'
import { ElementBadge, GeometryValueInput } from './GeometryPanelUi'

interface Props {
  readonly atoms: Atom[]
  readonly addHydrogens: (atomId: string) => void
  readonly removeAtoms: (atomIds: string[]) => void
  readonly moveAtom: (atomId: string, x: number, y: number, z: number) => void
}

export function SelectedAtomsSection({ atoms, addHydrogens, removeAtoms, moveAtom }: Props) {
  if (atoms.length === 0) return null
  return (
    <section>
      <div className="mb-2 text-xs font-medium text-gray-700">选中原子 ({atoms.length})</div>
      <div className="space-y-2">
        {atoms.map(atom => {
          const element = getElementConfig(atom.symbol)
          return (
            <div key={atom.id} className="rounded-lg border border-gray-200 bg-white p-2.5">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ElementBadge atom={atom} size="large" />
                  <span className="font-semibold text-gray-800">{element.name}</span>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-500 hover:bg-gray-100 hover:text-gray-900" onClick={() => addHydrogens(atom.id)} title="补氢">
                    <FlaskRound size={12} />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-500 hover:bg-gray-100 hover:text-gray-900" onClick={() => removeAtoms([atom.id])}>
                    <Trash2 size={12} />
                  </Button>
                </div>
              </div>
              <div className="space-y-0.5 rounded bg-gray-50 p-1.5 font-mono text-xs text-gray-500">
                <GeometryValueInput label="x" value={atom.x} onCommit={value => moveAtom(atom.id, value, atom.y, atom.z)} />
                <GeometryValueInput label="y" value={atom.y} onCommit={value => moveAtom(atom.id, atom.x, value, atom.z)} />
                <GeometryValueInput label="z" value={atom.z} onCommit={value => moveAtom(atom.id, atom.x, atom.y, value)} />
              </div>
              <div className="mt-1.5 text-xs text-gray-400">
                Z={element.atomicNumber || '—'} M={element.atomicMass !== null && element.atomicMass > 0 ? element.atomicMass : '未知'}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
