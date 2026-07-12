import type { LiveGeometryModel } from '../model/useGeometryPanelModel'
import { ElementBadge, GeometryValueInput } from './GeometryPanelUi'

const TITLES = {
  distance: '距离',
  angle: '键角',
  dihedral: '二面角',
} as const

export function LiveGeometrySection({
  geometry,
  flashHint,
}: {
  geometry: LiveGeometryModel
  flashHint: (message: string) => void
}) {
  return (
    <section>
      <div className="mb-2 text-xs font-medium text-gray-700">
        {TITLES[geometry.kind]}
        <span className="ml-1 font-normal text-gray-400">· 点击数值修改</span>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white p-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1">
            {geometry.atoms.map((atom, index) => (
              <span key={atom.id} className="flex items-center gap-0.5">
                {index > 0 && <span className="text-xs text-gray-400">—</span>}
                <ElementBadge atom={atom} />
              </span>
            ))}
          </div>
          <div className="flex shrink-0 items-center gap-1 font-mono text-xs text-gray-800">
            <GeometryValueInput
              label=""
              value={geometry.value}
              onCommit={value => {
                const result = geometry.commit(value)
                if (!result.ok) flashHint(result.reason ?? '无法调整')
              }}
            />
            <span className="text-gray-400">{geometry.unit}</span>
          </div>
        </div>
        <div className="mt-1 font-mono text-[10px] text-gray-400">{geometry.label}</div>
        <div className="mt-0.5 text-[10px] text-gray-400">{geometry.editHint}</div>
      </div>
    </section>
  )
}
