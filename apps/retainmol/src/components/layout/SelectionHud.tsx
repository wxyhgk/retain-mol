import { useMoleculeStore } from '@/domain/viewer/moleculeState'

export function SelectionHud() {
  const atomCount = useMoleculeStore(state => state.selectedAtomIds.size)
  const bondCount = useMoleculeStore(state => state.selectedBondIds.size)
  if (atomCount === 0 && bondCount === 0) return null

  return (
    <div className="pointer-events-none absolute left-1/2 top-3 z-20 -translate-x-1/2 rounded-md border border-border bg-white/90 px-3 py-1.5 text-[11px] font-medium text-foreground shadow-lg backdrop-blur-md">
      选择：{atomCount} 原子{bondCount > 0 ? ` · ${bondCount} 键` : ''}
    </div>
  )
}
