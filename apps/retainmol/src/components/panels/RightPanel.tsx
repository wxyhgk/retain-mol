import { useState } from 'react'
import { Atom, Ruler, Layers } from 'lucide-react'
import { GeometryPanel } from '@/features/geometry'
import { MeasurePanel } from '@/features/measure'
import ScenePanel from '@/features/scene/components/ScenePanel'
import { cn } from '@retainmol/mol-viewer'

type TabId = 'scene' | 'geometry' | 'measure'

const TABS: { id: TabId; icon: React.ReactNode; label: string }[] = [
  { id: 'scene',    icon: <Layers size={16} />, label: '场景' },
  { id: 'geometry', icon: <Atom size={16} />,   label: '几何' },
  { id: 'measure',  icon: <Ruler size={16} />,  label: '测量' },
]

export default function RightPanel() {
  const [active, setActive] = useState<TabId>('scene')

  return (
    <div className="flex h-full overflow-hidden">
      {/* ── 竖排 Tab 栏 ── */}
      <div className="w-10 shrink-0 flex flex-col items-center py-1 gap-0.5 bg-gray-50 border-r border-gray-200">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            title={t.label}
            className={cn(
              'w-8 flex flex-col items-center gap-0.5 py-2 rounded-lg transition-all text-[9px] font-medium leading-none',
              active === t.id
                ? 'bg-[#007AFF] text-white'
                : 'text-gray-400 hover:bg-gray-200 hover:text-gray-700'
            )}
          >
            {t.icon}
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* ── 内容区 ── */}
      <div className="flex-1 overflow-y-auto min-w-0">
        {active === 'scene'    && <ScenePanel />}
        {active === 'geometry' && <GeometryPanel />}
        {active === 'measure'  && <MeasurePanel />}
      </div>
    </div>
  )
}
