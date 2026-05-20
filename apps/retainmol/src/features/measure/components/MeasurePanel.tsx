import {
  useMoleculeStore, useEditorStore, selectActiveMoleculeOrEmpty,
  DEFAULT_MEASURE_STYLE, MEASURE_ATOM_COUNT,
  calcDistance, calcAngle, calcDihedral,
} from '@retainmol/mol-viewer'
import type { MeasureType } from '@retainmol/mol-viewer'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

function StyleRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500 w-8 shrink-0">{label}</span>
      {children}
    </div>
  )
}

function ColorRow({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex items-center gap-1.5 cursor-pointer">
      <input type="color" value={value} onChange={e => onChange(e.target.value)}
        className="w-6 h-6 rounded border border-gray-200 cursor-pointer p-0.5 bg-white" />
      <span className="text-[11px] text-gray-500">{label}</span>
    </label>
  )
}

export default function MeasurePanel() {
  const {
    measurements, measureType, pendingAtomIds, activeTool,
    removeMeasurement, clearMeasurements, setMeasureType,
    measureStyle, setMeasureStyle,
  } = useEditorStore()
  const molecule = useMoleculeStore(selectActiveMoleculeOrEmpty)

  const atomById = new Map(molecule.atoms.map(a => [a.id, a]))
  const pendingAtoms = pendingAtomIds.map(id => atomById.get(id)).filter(Boolean) as typeof molecule.atoms[number][]
  const needed = MEASURE_ATOM_COUNT[measureType]

  const measureHint = measureType === 'auto'
    ? (pendingAtoms.length === 0
        ? '点原子累积，点背景或 Enter 提交（2=距离 / 3=键角 / 4=二面角）'
        : `已选 ${pendingAtoms.map(a => a.symbol).join('—')}（${pendingAtoms.length} 个）；点背景/Enter 提交，Esc 取消`)
    : (pendingAtoms.length === 0
        ? `点击 ${needed} 个原子开始`
        : `已选 ${pendingAtoms.map(a => a.symbol).join('—')}，还需 ${needed - pendingAtoms.length} 个`)

  return (
    <div className="p-3 space-y-4 text-sm text-gray-800">
      {/* 测量类型选择 */}
      <section className="space-y-2">
        <div className="text-xs font-medium text-gray-700">测量类型</div>
        <div className="grid grid-cols-4 gap-1">
          {(['auto', 'distance', 'angle', 'dihedral'] as MeasureType[]).map(t => (
            <button key={t} onClick={() => setMeasureType(t)}
              className={`py-1 rounded-[8px] text-[11px] font-medium border transition-colors ${measureType === t ? 'bg-[#007AFF] border-[#007AFF] text-white' : 'border-gray-200 text-gray-500 hover:border-[#007AFF]/40'}`}>
              {t === 'auto' ? '自动' : t === 'distance' ? '键长' : t === 'angle' ? '键角' : '二面角'}
            </button>
          ))}
        </div>
        {activeTool === 'measure' && (
          <div className="text-xs text-gray-400 bg-gray-50 rounded px-2 py-1.5 font-mono">
            {measureHint}
          </div>
        )}
      </section>

      {/* 已提交的测量记录 */}
      {measurements.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-medium text-gray-700">测量记录</div>
            <Button variant="ghost" size="icon" className="w-5 h-5 text-gray-400 hover:text-gray-900"
              onClick={clearMeasurements} title="清除全部">
              <X size={11} />
            </Button>
          </div>
          <div className="space-y-1">
            {measurements.map(m => {
              const atoms = m.atomIds.map(id => atomById.get(id)).filter(Boolean) as typeof molecule.atoms[number][]
              if (atoms.length !== m.atomIds.length) return null
              const typeLabel = m.type === 'distance' ? '键长' : m.type === 'angle' ? '键角' : '二面角'
              let value = '—'
              if (m.type === 'distance' && atoms.length === 2)
                value = `${calcDistance(atoms[0], atoms[1]).toFixed(4)} Å`
              else if (m.type === 'angle' && atoms.length === 3)
                value = `${calcAngle(atoms[0], atoms[1], atoms[2]).toFixed(3)}°`
              else if (m.type === 'dihedral' && atoms.length === 4)
                value = `${calcDihedral(atoms[0], atoms[1], atoms[2], atoms[3]).toFixed(3)}°`
              return (
                <div key={m.id} className="flex items-center gap-1 rounded border border-gray-200 bg-gray-50 px-2 py-1">
                  <span className="text-[10px] text-gray-700 font-mono flex-1 truncate">{atoms.map(a => a.symbol).join('—')}</span>
                  <span className="text-[10px] text-gray-500 shrink-0">{typeLabel}</span>
                  <span className="text-[10px] text-gray-900 font-mono shrink-0">{value}</span>
                  <Button variant="ghost" size="icon" className="w-4 h-4 text-gray-300 hover:text-gray-700 shrink-0 ml-1"
                    onClick={() => removeMeasurement(m.id)}>
                    <X size={9} />
                  </Button>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* 标注样式 */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-medium text-gray-700">标注样式</div>
          <button className="text-[10px] text-gray-400 hover:text-gray-900 transition-colors"
            onClick={() => setMeasureStyle(DEFAULT_MEASURE_STYLE)}>重置</button>
        </div>
        <div className="space-y-2">
          <StyleRow label="字号">
            <input type="range" min={9} max={18} step={1} value={measureStyle.fontSize}
              onChange={e => setMeasureStyle({ fontSize: +e.target.value })}
              className="w-full h-1 accent-gray-700" />
            <span className="text-[10px] text-gray-400 w-6 text-right shrink-0">{measureStyle.fontSize}</span>
          </StyleRow>
          <StyleRow label="线宽">
            <input type="range" min={1} max={6} step={0.5} value={measureStyle.lineWidth}
              onChange={e => setMeasureStyle({ lineWidth: +e.target.value })}
              className="w-full h-1 accent-gray-700" />
            <span className="text-[10px] text-gray-400 w-6 text-right shrink-0">{measureStyle.lineWidth}</span>
          </StyleRow>
          <div className="grid grid-cols-2 gap-1.5 pt-1">
            <ColorRow label="连线" value={measureStyle.lineColor} onChange={v => setMeasureStyle({ lineColor: v })} />
            <ColorRow label="角度弧" value={measureStyle.angleColor} onChange={v => setMeasureStyle({ angleColor: v })} />
            <ColorRow label="平面1" value={measureStyle.planeColor1} onChange={v => setMeasureStyle({ planeColor1: v })} />
            <ColorRow label="平面2" value={measureStyle.planeColor2} onChange={v => setMeasureStyle({ planeColor2: v })} />
          </div>
        </div>
      </section>
    </div>
  )
}
