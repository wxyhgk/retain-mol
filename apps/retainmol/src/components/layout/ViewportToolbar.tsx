import { type ReactNode } from 'react'
import { Axis3d, Focus, Grid3x3, Maximize2, MousePointer2, Pencil, RotateCcw } from 'lucide-react'
import {
  fitViewport,
  focusViewportSelection,
  resetViewport,
} from '@/domain/viewer/viewport'
import { useViewportStore } from '@/domain/viewer/viewportStore'
import { useMoleculeStore } from '@/domain/viewer/moleculeState'
import {
  deriveWorkspaceTool,
  selectWorkspacePanel,
  useWorkspaceToolStore,
} from '@/domain/workspaceToolStore'
import { useEditorStore } from '@/domain/viewer/editorState'
import { activateAppWorkspaceTool } from '@/domain/workspaceToolController'
import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export function ViewportToolbar() {
  const hasSelection = useMoleculeStore(
    state => state.selectedAtomIds.size > 0 || state.selectedBondIds.size > 0,
  )
  const axesVisible = useViewportStore(state => state.axesVisible)
  const gridVisible = useViewportStore(state => state.gridVisible)
  const setAxesVisible = useViewportStore(state => state.setAxesVisible)
  const setGridVisible = useViewportStore(state => state.setGridVisible)
  const panel = useWorkspaceToolStore(selectWorkspacePanel)
  const editorTool = useEditorStore(state => state.activeTool)
  const workspaceTool = deriveWorkspaceTool(panel, editorTool)
  const toggleAxes = () => {
    setAxesVisible(!axesVisible)
  }

  const toggleGrid = () => {
    setGridVisible(!gridVisible)
  }

  return (
    <TooltipProvider delayDuration={250}>
      <nav
        aria-label="视图控制"
        data-workspace-control="true"
        className="absolute bottom-8 left-1/2 z-20 flex h-14 max-w-[calc(100%-16px)] -translate-x-1/2 items-center overflow-x-auto gap-1 rounded-lg border border-border bg-[hsl(var(--card)/0.9)] p-1 text-card-foreground opacity-90 shadow-lg backdrop-blur-md transition-opacity hover:opacity-100 focus-within:opacity-100"
      >
        <ViewportButton
          label="选择"
          pressed={workspaceTool === 'select'}
          onClick={() => activateAppWorkspaceTool('select')}
        >
          <MousePointer2 size={16} />
        </ViewportButton>
        <ViewportButton
          label="绘制"
          pressed={workspaceTool === 'draw'}
          onClick={() => activateAppWorkspaceTool('draw')}
        >
          <Pencil size={16} />
        </ViewportButton>
        <span aria-hidden="true" className="mx-0.5 h-8 w-px bg-border" />
        <ViewportButton label="适配分子" onClick={() => fitViewport()}>
          <Maximize2 size={16} />
        </ViewportButton>
        <ViewportButton
          label="聚焦选择"
          disabled={!hasSelection}
          onClick={() => focusViewportSelection()}
        >
          <Focus size={16} />
        </ViewportButton>
        <ViewportButton label="重置视角" onClick={() => resetViewport()}>
          <RotateCcw size={16} />
        </ViewportButton>
        <span aria-hidden="true" className="mx-0.5 h-8 w-px bg-border" />
        <ViewportButton
          label={axesVisible ? '隐藏坐标轴' : '显示坐标轴'}
          pressed={axesVisible}
          onClick={toggleAxes}
        >
          <Axis3d size={16} />
        </ViewportButton>
        <ViewportButton
          label={gridVisible ? '隐藏网格' : '显示网格'}
          pressed={gridVisible}
          onClick={toggleGrid}
        >
          <Grid3x3 size={16} />
        </ViewportButton>
      </nav>
    </TooltipProvider>
  )
}

interface ViewportButtonProps {
  label: string
  children: ReactNode
  disabled?: boolean
  pressed?: boolean
  onClick: () => void
}

function ViewportButton({ label, children, disabled, pressed, onClick }: ViewportButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={label}
          aria-pressed={pressed}
          disabled={disabled}
          onClick={onClick}
          className={cn(
            'flex h-12 w-10 shrink-0 flex-col items-center justify-center gap-0.5 rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
            pressed && 'bg-primary text-primary-foreground ring-1 ring-inset ring-primary',
          )}
        >
          {children}
          <span className="text-[10px] font-medium leading-none">{shortLabel(label)}</span>
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="border bg-popover text-xs text-popover-foreground shadow-md">
        {label}
      </TooltipContent>
    </Tooltip>
  )
}

function shortLabel(label: string) {
  if (label.includes('选择')) return 'Select'
  if (label.includes('绘制')) return 'Draw'
  if (label.includes('适配')) return '适配'
  if (label.includes('聚焦')) return '聚焦'
  if (label.includes('重置')) return '重置'
  if (label.includes('坐标轴')) return '坐标轴'
  return '网格'
}
