import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { Atom, Command, PanelRight, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import type { ToolbarModel } from './useToolbarModel'
import type { WorkspaceMode } from '@/App'
import { useUiPaletteStore } from '@/domain/uiPaletteStore'

export interface ToolbarProps {
  showInspector: boolean
  workspaceMode: WorkspaceMode
  onToggleInspector: () => void
  onWorkspaceModeChange: (mode: WorkspaceMode) => void
  onOpenTemplateStudio: () => void
  onSearchOpen: () => void
}

type ToolbarViewProps = ToolbarProps & ToolbarModel

export function ToolbarView({
  showInspector,
  workspaceMode,
  onToggleInspector,
  onWorkspaceModeChange,
  onOpenTemplateStudio,
  onSearchOpen,
  history,
  fileIO,
}: ToolbarViewProps) {
  const [paletteOpen, setPaletteOpen] = useState(false)

  // Ctrl+K / Cmd+K 打开命令面板
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setPaletteOpen(value => !value)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <TooltipProvider delayDuration={300}>
      <header className="relative z-50 flex h-14 shrink-0 select-none items-center gap-2 border-b border-border bg-card px-3 text-card-foreground shadow-sm">
        {/* 品牌：仅保留 Logo，分子信息移至画布/状态栏 */}
        <span className="flex shrink-0 items-center gap-2 text-sm font-semibold tracking-tight text-foreground">
          <span className="flex h-7 w-7 items-center justify-center rounded-md border border-primary bg-primary text-primary-foreground">
            <Atom size={16} />
          </span>
          <span className="hidden sm:inline">RetainMol</span>
        </span>

        {/* 居中：工作模式 */}
        <div className="hidden flex-1 justify-center md:flex">
          <WorkspaceModeSwitch value={workspaceMode} onChange={onWorkspaceModeChange} />
        </div>
        <div className="flex flex-1 justify-center md:hidden">
          <WorkspaceModeDropdown value={workspaceMode} onChange={onWorkspaceModeChange} />
        </div>

        {/* 右侧：命令面板 + 检查器 */}
        <div className="ml-auto flex shrink-0 items-center gap-1.5">
          <Tip label="命令面板 (⌘K)" side="bottom">
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 rounded-md px-2.5 text-xs font-medium text-muted-foreground"
              onClick={() => setPaletteOpen(true)}
            >
              <Search size={13} />
              <span className="hidden sm:inline">搜索</span>
              <kbd className="ml-1 hidden rounded bg-muted px-1 py-0.5 font-sans text-[10px] text-muted-foreground md:inline">⌘K</kbd>
            </Button>
          </Tip>
          <Tip label={showInspector ? '收起检查器' : '展开检查器'} side="bottom">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                'h-8 gap-1.5 rounded-md px-2.5 text-xs font-medium transition-all',
                showInspector
                  ? 'bg-primary text-primary-foreground ring-1 ring-primary hover:bg-primary/90'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              )}
              aria-expanded={showInspector}
              onClick={onToggleInspector}
            >
              <PanelRight size={13} />
              <span className="hidden sm:inline">检查器</span>
            </Button>
          </Tip>
        </div>
      </header>

      <EditorCommandPalette
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        history={history}
        fileIO={fileIO}
        onOpenTemplateStudio={onOpenTemplateStudio}
        onSearchOpen={onSearchOpen}
      />
    </TooltipProvider>
  )
}

const WORKSPACE_MODES: Array<{ id: WorkspaceMode; label: string; title?: string }> = [
  { id: 'build', label: 'Build' },
  { id: 'analyze', label: 'Analyze', title: 'Analyze 工作区即将接入分析结果与可视化' },
  { id: 'simulate', label: 'Simulate', title: '打开计算任务工作区' },
]

function WorkspaceModeSwitch({
  value,
  onChange,
}: {
  value: WorkspaceMode
  onChange: (mode: WorkspaceMode) => void
}) {
  return (
    <nav
      aria-label="工作模式"
      className="flex h-9 w-[300px] items-center rounded-full border border-border bg-muted p-1 shadow-inner xl:w-[330px]"
    >
      {WORKSPACE_MODES.map(mode => (
        <button
          key={mode.id}
          type="button"
          aria-current={value === mode.id ? 'page' : undefined}
          title={mode.title}
          onClick={() => onChange(mode.id)}
          className={cn(
            'flex h-7 flex-1 items-center justify-center rounded-full text-[11px] font-medium transition-colors',
            value === mode.id
              ? 'border border-primary bg-primary font-semibold text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:bg-background hover:text-foreground',
          )}
        >
          {mode.label}
        </button>
      ))}
    </nav>
  )
}

function WorkspaceModeDropdown({
  value,
  onChange,
}: {
  value: WorkspaceMode
  onChange: (mode: WorkspaceMode) => void
}) {
  const current = WORKSPACE_MODES.find(m => m.id === value) ?? WORKSPACE_MODES[0]
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1.5 rounded-full px-3 text-xs font-medium">
          {current.label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-32">
        {WORKSPACE_MODES.map(mode => (
          <DropdownMenuItem
            key={mode.id}
            onClick={() => onChange(mode.id)}
            className={cn('text-xs', value === mode.id && 'bg-accent font-semibold')}
          >
            {mode.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function EditorCommandPalette({
  open,
  onOpenChange,
  history,
  fileIO,
  onOpenTemplateStudio,
  onSearchOpen,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  history: ToolbarModel['history']
  fileIO: ToolbarModel['fileIO']
  onOpenTemplateStudio: () => void
  onSearchOpen: () => void
}) {
  const [query, setQuery] = useState('')
  const palette = useUiPaletteStore(state => state.palette)
  const setPalette = useUiPaletteStore(state => state.setPalette)

  const run = useCallback((fn: () => void) => {
    onOpenChange(false)
    setQuery('')
    fn()
  }, [onOpenChange])

  type CommandItem = { label: string; hint?: string; disabled?: boolean; onRun: () => void }
  const groups = useMemo<Array<{ title: string; items: CommandItem[] }>>(() => {
    const q = query.trim().toLowerCase()
    const filter = (label: string) => !q || label.toLowerCase().includes(q)
    return [
      {
        title: '编辑',
        items: [
          { label: '撤销', hint: 'Ctrl+Z', disabled: !history.canUndo, onRun: () => history.undo() },
          { label: '重做', hint: 'Ctrl+Y', disabled: !history.canRedo, onRun: () => history.redo() },
        ].filter(item => filter(item.label)),
      },
      {
        title: '文件',
        items: [
          { label: '导入分子（替换当前）', onRun: () => void fileIO.importXYZ() },
          { label: '导入分子（添加到场景）', onRun: () => void fileIO.importXYZToScene() },
          { label: '导出 XYZ', onRun: () => fileIO.exportCurrentXYZ() },
          { label: '导出 MOL', onRun: () => fileIO.exportCurrentMol() },
          { label: '导出 SDF', onRun: () => fileIO.exportCurrentSdf() },
          { label: '导出 GJF', onRun: () => fileIO.exportCurrentGJF() },
          { label: '导出 PNG 截图', onRun: () => fileIO.exportPNG() },
        ].filter(item => filter(item.label)),
      },
      {
        title: '分子与搜索',
        items: [
          { label: 'PubChem 搜索', hint: '⌘K', onRun: () => run(onSearchOpen) },
          { label: '打开模板工作台', onRun: () => run(onOpenTemplateStudio) },
          { label: '保存分子 (Ctrl+S)', hint: 'Ctrl+S', onRun: () => window.dispatchEvent(new KeyboardEvent('keydown', { key: 's', ctrlKey: true })) },
        ].filter(item => filter(item.label)),
      },
      {
        title: '视图与主题',
        items: [
          { label: palette === 'heritage' ? '切换到默认主题' : '切换到古建筑主题', onRun: () => setPalette(palette === 'heritage' ? 'default' : 'heritage') },
        ].filter(item => filter(item.label)),
      },
    ].filter(group => group.items.length > 0)
  }, [query, history, fileIO, onOpenTemplateStudio, onSearchOpen, palette, setPalette, run])

  return (
    <Dialog open={open} onOpenChange={value => { onOpenChange(value); if (!value) setQuery('') }}>
      <DialogContent className="max-w-lg gap-0 overflow-hidden p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>命令面板</DialogTitle>
          <DialogDescription>搜索并执行编辑器命令</DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-2 border-b border-border px-3 py-2">
          <Command size={14} className="shrink-0 text-muted-foreground" />
          <Input
            autoFocus
            placeholder="输入命令，如 导入、导出、撤销…"
            value={query}
            onChange={event => setQuery(event.target.value)}
            className="h-8 border-0 bg-transparent px-1 text-sm shadow-none focus-visible:ring-0"
          />
        </div>
        <ScrollArea className="max-h-[50vh]">
          <div className="p-2">
            {groups.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">无匹配命令</div>
            ) : (
              groups.map(group => (
                <div key={group.title} className="mb-3 last:mb-0">
                  <div className="px-2 py-1 text-[10px] font-semibold tracking-widest text-muted-foreground">{group.title}</div>
                  <div className="space-y-0.5">
                    {group.items.map(item => (
                      <button
                        key={item.label}
                        type="button"
                        disabled={item.disabled}
                        onClick={() => run(item.onRun)}
                        className="flex w-full items-center justify-between rounded-md px-2.5 py-2 text-left text-xs transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-40"
                      >
                        <span>{item.label}</span>
                        {item.hint && <span className="ml-2 shrink-0 font-mono text-[10px] text-muted-foreground">{item.hint}</span>}
                      </button>
                    ))}
                  </div>
                  <Separator className="mt-2 last:hidden" />
                </div>
              ))
            )}
          </div>
        </ScrollArea>
        <div className="flex items-center justify-between border-t border-border bg-muted/50 px-3 py-2 text-[10px] text-muted-foreground">
          <span>↑↓ 选择 · 回车 执行 · Esc 关闭</span>
          <span>⌘K 快速打开</span>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function Tip({ label, children, side = 'right' }: { label: string; children: ReactNode; side?: 'right' | 'bottom' | 'left' | 'top' }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side={side} className="border bg-popover text-xs text-popover-foreground shadow-md">{label}</TooltipContent>
    </Tooltip>
  )
}
