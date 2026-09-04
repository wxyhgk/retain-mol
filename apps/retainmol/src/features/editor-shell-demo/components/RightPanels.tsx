import { SelectionInspector, MeasureSection } from '@/features/inspector'
import { WorkspaceDisplayPanel, WorkspaceScenePanel } from '@/features/workspace-panels'
import { useEditorStore } from '@/domain/viewer/editorState'
import { PeriodicTableSheet, useBuildPaletteController } from '@/features/build-palette'
import type { RightRailKey } from './RightRail'

export function RightPanels({ activeKey }: { activeKey: RightRailKey }) {
  if (activeKey === 'elements') return <ElementsContent />
  if (activeKey === 'inspector') return <InspectorContent />
  if (activeKey === 'scene') return <WorkspaceScenePanel />
  if (activeKey === 'display') return <WorkspaceDisplayPanel />
  return null
}

const QUICK = [
  { sym: 'C', label: '碳' },
  { sym: 'H', label: '氢' },
  { sym: 'O', label: '氧' },
  { sym: 'N', label: '氮' },
  { sym: 'B', label: '硼' },
  { sym: 'F', label: '氟' },
  { sym: 'Cl', label: '氯' },
  { sym: 'Br', label: '溴' },
  { sym: 'I', label: '碘' },
  { sym: 'S', label: '硫' },
] as const

const HYBRIDS = [
  { id: 'atom', label: '原子', desc: 'C' },
  { id: 'sp3', label: 'sp³', desc: '四面体' },
  { id: 'sp2', label: 'sp²', desc: '平面' },
  { id: 'sp', label: 'sp', desc: '直线' },
] as const

function ElementsContent() {
  const c = useBuildPaletteController()
  const active = c.activeElement

  return (
    <div className="space-y-4">
      <div>
        <div className="mb-2 flex items-center justify-between">
          <div className="text-xs font-semibold">常用元素</div>
          <PeriodicTableSheet activeElement={active} onSelect={sym => c.pickAtom(sym)} />
        </div>
        <div className="grid grid-cols-5 gap-1.5">
          {QUICK.map(e => {
            const isActive = active === e.sym
            return (
              <button
                key={e.sym}
                type="button"
                aria-pressed={isActive}
                onClick={() => c.pickAtom(e.sym)}
                className={`flex flex-col items-center justify-center rounded-md border px-1 py-2 text-xs transition-colors ${isActive ? 'bg-primary text-primary-foreground border-primary shadow-sm' : 'bg-card hover:bg-accent border-border'}`}
              >
                <span className="text-[13px] font-semibold leading-none">{e.sym}</span>
                <span className={`text-[10px] leading-none mt-1 ${isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>{e.label}</span>
              </button>
            )
          })}
        </div>
        <div className="mt-1 text-[11px] text-muted-foreground">当前：{active} · 点击切换，自动进入绘制</div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <div className="text-xs font-semibold">杂化</div>
          <span className="text-[10px] text-muted-foreground">4 项</span>
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {HYBRIDS.map(h => {
            const isActive = (h.id === 'sp3' && active === 'C') // 简化：C 默认 sp3 高亮，实际由 controller 杂化态驱动后续细化
            return (
              <button
                key={h.id}
                type="button"
                aria-pressed={isActive}
                onClick={() => {
                  if (h.id === 'atom') c.pickAtom(active)
                  // sp 切换由 DrawPanel 的 fragment 逻辑承载，这里先保持元素选中
                }}
                className={`rounded-md border px-2 py-2 text-center transition-colors ${isActive ? 'bg-primary text-primary-foreground border-primary' : 'bg-card hover:bg-accent border-border'}`}
              >
                <div className="text-xs font-semibold leading-none">{h.label}</div>
                <div className={`text-[10px] leading-none mt-1 ${isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>{h.desc}</div>
              </button>
            )
          })}
        </div>
      </div>

      <div className="rounded-md border border-dashed bg-muted/30 p-3 text-xs text-muted-foreground">
        提示：右侧选 <b className="text-foreground">C/H/O/N</b> 后，左侧绘制弹层会自动同步杂化与键级；按 <kbd className="rounded border bg-card px-1 text-[10px]">D</kbd> 返回绘制。
      </div>
    </div>
  )
}

function InspectorContent() {
  const activeTool = useEditorStore(s => s.activeTool)
  const isMeasureActive = activeTool === 'measure'
  return (
    <div className="min-w-0">
      {isMeasureActive && <MeasureSection />}
      <SelectionInspector />
    </div>
  )
}
