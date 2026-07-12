import { Link } from 'lucide-react'
import { OptimizationControls } from '@/features/geometry-optimization'
import { useGeometryPanelModel } from '../model/useGeometryPanelModel'
import { SummaryRow } from './GeometryPanelUi'
import { LiveGeometrySection } from './LiveGeometrySection'
import { SelectedAtomsSection } from './SelectedAtomsSection'
import { SelectedBondsSection } from './SelectedBondsSection'

export default function GeometryPanel() {
  const model = useGeometryPanelModel()
  const { molecule } = model

  return (
    <div className="space-y-4 p-3 text-sm text-gray-800">
      <section>
        <div className="mb-2 text-xs font-medium text-gray-700">分子摘要</div>
        <div className="divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white">
          <SummaryRow label="名称" value={molecule.name ?? '—'} />
          <SummaryRow label="分子式" value={model.formula || '—'} />
          <SummaryRow
            label="分子量"
            value={model.molecularWeight === null
              ? '质量未知'
              : model.molecularWeight > 0
                ? `${model.molecularWeight.toFixed(3)} g/mol`
                : '—'}
          />
          <SummaryRow label="原子数" value={String(molecule.atoms.length)} />
          <SummaryRow label="键数" value={String(molecule.bonds.length)} />
        </div>
      </section>

      <OptimizationControls atomCount={molecule.atoms.length} bondCount={molecule.bonds.length} />

      {model.liveGeometry && (
        <LiveGeometrySection geometry={model.liveGeometry} flashHint={model.flashHint} />
      )}

      {model.selectedAtoms.length === 2 && (
        <section>
          <button
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-gray-50 py-2 text-xs font-semibold text-gray-900 transition-colors hover:border-gray-300 hover:bg-gray-100"
            onClick={model.connectSelectedAtoms}
          >
            <Link size={13} />
            连接两原子
          </button>
        </section>
      )}

      <SelectedAtomsSection
        atoms={model.selectedAtoms}
        addHydrogens={model.addHydrogens}
        removeAtoms={model.removeAtoms}
        moveAtom={model.moveAtom}
      />
      <SelectedBondsSection
        bonds={model.selectedBonds}
        atomById={model.atomById}
        cycleBondOrder={model.cycleBondOrder}
        removeBond={model.removeBond}
      />

      {model.selectedAtoms.length === 0 && model.selectedBonds.length === 0 && (
        <div className="mt-8 text-center text-xs leading-relaxed text-gray-400">
          点击原子或键以查看属性
        </div>
      )}
    </div>
  )
}
