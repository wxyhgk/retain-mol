import type { ReactNode } from 'react'
import { Atom, RotateCcw, Download, Upload, Search, LibraryBig, PanelRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import type { ToolbarModel } from './useToolbarModel'

export interface ToolbarProps {
  showInspector: boolean
  onToggleInspector: () => void
  onOpenTemplateStudio: () => void
  onSearchOpen: () => void
}

type ToolbarViewProps = ToolbarProps & ToolbarModel

export function ToolbarView({
  showInspector,
  onToggleInspector,
  onOpenTemplateStudio,
  onSearchOpen,
  moleculeName,
  formula,
  history,
  fileIO,
}: ToolbarViewProps) {
  return (
    <TooltipProvider delayDuration={300}>
      <header className="relative z-50 flex h-14 shrink-0 select-none items-center gap-2 border-b border-border bg-card px-3 text-card-foreground shadow-sm">

        <WorkspaceModeSwitch />

        {/* 品牌 */}
        <span className="flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground"><span className="flex h-7 w-7 items-center justify-center rounded-md border border-primary bg-primary text-primary-foreground"><Atom size={16} /></span><span className="hidden sm:inline">RetainMol</span></span>

        <div className="mx-1 h-5 w-px bg-border" />

        <div className="hidden min-w-0 items-center gap-2 md:flex">
          <span className="max-w-40 truncate text-xs font-semibold text-foreground" title={moleculeName}>
            {moleculeName}
          </span>
          {formula && <span className="font-mono text-[10px] text-muted-foreground">{formula}</span>}
        </div>

        <div className="mx-1 hidden h-5 w-px bg-border md:block" />

        {/* 撤销 / 重做 */}
        <Tip label="撤销 (Ctrl+Z)" side="bottom">
          <Button variant="ghost" size="icon"
            className="h-8 w-8 rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground disabled:opacity-30"
            onClick={() => history.undo()} disabled={!history.canUndo}>
            <RotateCcw size={14} />
          </Button>
        </Tip>
        <Tip label="重做 (Ctrl+Y)" side="bottom">
          <Button variant="ghost" size="icon"
            className="h-8 w-8 rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground disabled:opacity-30"
            onClick={() => history.redo()} disabled={!history.canRedo}>
            <RotateCcw size={14} className="scale-x-[-1]" />
          </Button>
        </Tip>

        <div className="mx-1 h-5 w-px bg-border" />

        {/* 导入 */}
        <DropdownMenu>
          <Tip label="导入文件" side="bottom">
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground">
                <Upload size={14} />
              </Button>
            </DropdownMenuTrigger>
          </Tip>
          <DropdownMenuContent side="bottom" className="border-border bg-popover text-popover-foreground shadow-lg">
            <div className="px-2 py-1 text-[10px] text-gray-400 uppercase tracking-wider">替换当前</div>
            <DropdownMenuItem className="text-xs text-gray-700 cursor-pointer" onClick={fileIO.importXYZ}>XYZ</DropdownMenuItem>
            <DropdownMenuItem className="text-xs text-gray-700 cursor-pointer" onClick={fileIO.importMolSdf}>MOL / SDF</DropdownMenuItem>
            <DropdownMenuSeparator />
            <div className="px-2 py-1 text-[10px] text-gray-400 uppercase tracking-wider">添加到场景</div>
            <DropdownMenuItem className="text-xs text-gray-700 cursor-pointer" onClick={fileIO.importXYZToScene}>XYZ</DropdownMenuItem>
            <DropdownMenuItem className="text-xs text-gray-700 cursor-pointer" onClick={fileIO.importMolSdfToScene}>MOL / SDF</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* 导出 */}
        <DropdownMenu>
          <Tip label="导出文件" side="bottom">
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground">
                <Download size={14} />
              </Button>
            </DropdownMenuTrigger>
          </Tip>
          <DropdownMenuContent side="bottom" className="border-border bg-popover text-popover-foreground shadow-lg">
            <DropdownMenuItem className="text-xs text-gray-700 cursor-pointer" onClick={fileIO.exportCurrentXYZ}>导出 XYZ</DropdownMenuItem>
            <DropdownMenuItem className="text-xs text-gray-700 cursor-pointer" onClick={fileIO.exportCurrentGJF}>导出 Gaussian (.gjf)</DropdownMenuItem>
            <DropdownMenuItem className="text-xs text-gray-700 cursor-pointer" onClick={fileIO.exportCurrentMol}>导出 MOL</DropdownMenuItem>
            <DropdownMenuItem className="text-xs text-gray-700 cursor-pointer" onClick={fileIO.exportCurrentSdf}>导出 SDF</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-xs text-gray-700 cursor-pointer" onClick={fileIO.exportPNG}>导出 PNG 截图</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* 搜索 */}
        <Tip label="从 PubChem 搜索分子 (Ctrl+K)" side="bottom">
          <button
            onClick={onSearchOpen}
            className="flex h-8 items-center gap-1.5 rounded-md border border-border bg-muted px-2.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground xl:hidden"
          >
            <Search size={12} />
            <span className="hidden sm:inline">搜索分子…</span>
            <kbd className="ml-1 hidden font-sans text-[10px] text-slate-500 md:inline">⌘K</kbd>
          </button>
        </Tip>

        {/* 右侧：检查器切换 */}
        <div className="ml-auto flex items-center gap-1">
          <Tip label="打开模板工作台" side="bottom">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              onClick={onOpenTemplateStudio}
            >
              <LibraryBig size={14} />
            </Button>
          </Tip>
          <Tip label={showInspector ? '收起检查器' : '展开检查器'} side="bottom">
            <Button variant="ghost" size="sm"
              className={cn(
                'h-8 gap-1.5 rounded-md px-2.5 text-xs font-medium transition-all',
                showInspector
                  ? 'bg-primary text-primary-foreground ring-1 ring-primary hover:bg-primary/90'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
              aria-expanded={showInspector}
              onClick={onToggleInspector}>
              <PanelRight size={13} /><span className="hidden sm:inline">检查器</span>
            </Button>
          </Tip>
        </div>

      </header>
    </TooltipProvider>
  )
}

function WorkspaceModeSwitch() {
  return (
    <nav
      aria-label="工作模式"
      className="absolute left-1/2 top-1/2 hidden h-9 w-[330px] -translate-x-1/2 -translate-y-1/2 items-center rounded-full border border-border bg-muted p-1 shadow-inner xl:flex"
    >
      <button
        type="button"
        aria-current="page"
        className="flex h-7 flex-1 items-center justify-center rounded-full border border-primary bg-primary text-[11px] font-semibold text-primary-foreground shadow-sm"
      >
        Build
      </button>
      <button
        type="button"
        disabled
        title="Analyze 工作区规划中"
        className="flex h-7 flex-1 cursor-not-allowed items-center justify-center rounded-full text-[11px] font-medium text-muted-foreground"
      >
        Analyze
      </button>
      <button
        type="button"
        disabled
        title="Simulate 工作区规划中"
        className="flex h-7 flex-1 cursor-not-allowed items-center justify-center rounded-full text-[11px] font-medium text-muted-foreground"
      >
        Simulate
      </button>
    </nav>
  )
}

function Tip({ label, children, side = 'right' }: { label: string; children: ReactNode; side?: 'right' | 'bottom' | 'left' | 'top' }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side={side} className="border-primary bg-primary text-xs text-primary-foreground">{label}</TooltipContent>
    </Tooltip>
  )
}
