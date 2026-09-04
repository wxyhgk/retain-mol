import { Axis3d, Focus, Grid3x3, Maximize2, MousePointer2, Pencil, RotateCcw } from 'lucide-react'
import { fitViewport, focusViewportSelection, resetViewport } from '@/domain/viewer/viewport'
import { useViewportStore } from '@/domain/viewer/viewportStore'
import { useMoleculeStore } from '@/domain/viewer/moleculeState'
import { useEditorStore } from '@/domain/viewer/editorState'
import { deriveWorkspaceTool, selectWorkspacePanel, useWorkspaceToolStore } from '@/domain/workspaceToolStore'
import { activateAppWorkspaceTool } from '@/domain/workspaceToolController'
import { cn } from '@/lib/utils'

export function BottomBar() {
  const hasSelection = useMoleculeStore(s => s.selectedAtomIds.size > 0 || s.selectedBondIds.size > 0)
  const axesVisible = useViewportStore(s => s.axesVisible)
  const gridVisible = useViewportStore(s => s.gridVisible)
  const setAxesVisible = useViewportStore(s => s.setAxesVisible)
  const setGridVisible = useViewportStore(s => s.setGridVisible)
  const panel = useWorkspaceToolStore(selectWorkspacePanel)
  const editorTool = useEditorStore(s => s.activeTool)
  const workspaceTool = deriveWorkspaceTool(panel, editorTool)

  return (
    <div className="flex items-center gap-1 rounded-full border border-border bg-card/95 px-2 py-1 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-card/90">
      <div className="flex items-center gap-1 pr-1">
        <SegButton active={workspaceTool === 'select'} onClick={() => activateAppWorkspaceTool('select')}>
          <MousePointer2 size={13} /> 选择
        </SegButton>
        <SegButton active={workspaceTool === 'draw'} onClick={() => activateAppWorkspaceTool('draw')}>
          <Pencil size={13} /> 绘制
        </SegButton>
      </div>
      <span className="h-6 w-px bg-border" aria-hidden />
      <div className="flex items-center gap-1 px-1">
        <BarButton label="适配分子" onClick={() => fitViewport()}><Maximize2 size={14} /></BarButton>
        <BarButton label="聚焦选择" disabled={!hasSelection} onClick={() => focusViewportSelection()}><Focus size={14} /></BarButton>
        <BarButton label="重置视角" onClick={() => resetViewport()}><RotateCcw size={14} /></BarButton>
      </div>
      <span className="h-6 w-px bg-border" aria-hidden />
      <div className="flex items-center gap-1 pl-1">
        <BarButton label={axesVisible ? '隐藏坐标轴' : '显示坐标轴'} pressed={axesVisible} onClick={() => setAxesVisible(!axesVisible)}><Axis3d size={14} /></BarButton>
        <BarButton label={gridVisible ? '隐藏网格' : '显示网格'} pressed={gridVisible} onClick={() => setGridVisible(!gridVisible)}><Grid3x3 size={14} /></BarButton>
      </div>
    </div>
  )
}

function SegButton({ active, onClick, children }: { active?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'inline-flex h-7 items-center gap-1 rounded-full border px-2.5 text-xs font-medium transition-colors',
        active ? 'bg-primary text-primary-foreground border-primary shadow-sm' : 'border-transparent bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground',
      )}
    >
      {children}
    </button>
  )
}

function BarButton({ label, children, disabled, pressed, onClick }: { label: string; children: React.ReactNode; disabled?: boolean; pressed?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'inline-flex h-7 w-7 items-center justify-center rounded-full border text-muted-foreground transition-colors',
        'hover:bg-accent hover:text-accent-foreground',
        'disabled:opacity-40 disabled:pointer-events-none',
        pressed ? 'bg-primary text-primary-foreground border-primary' : 'border-transparent bg-transparent',
      )}
    >
      {children}
    </button>
  )
}
