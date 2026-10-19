import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Command, PanelRight, Save, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import type { ToolbarModel } from './useToolbarModel'
import { editorHostPort } from '@/domain/viewer/editorHostPort'
import { useLocalSaveStore } from '@/domain/localMoleculeSave'
import { isEmbedded, requestHostSave } from '@/app/embed'
import { useUiPaletteStore } from '@/domain/uiPaletteStore'
import { selectActiveMoleculeOrEmpty, useMoleculeStore } from '@/domain/viewer/moleculeState'
import { INSPECTOR_ID, INSPECTOR_TOGGLE_ID } from '@/domain/inspectorStore'
import { isWorkspaceShortcutBlocked } from '@/domain/shortcutScope'
import { isMoleculeHistoryTracking } from '@/domain/viewer/history'
import { selectAppBusyMessage, useAppTaskStore } from '@/store/appTaskStore'

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
  history,
  fileIO,
}: ToolbarViewProps) {
  const [paletteOpen, setPaletteOpen] = useState(false)
  const paletteTriggerRef = useRef<HTMLButtonElement>(null)
  const openPalette = () => {
    if (!isMoleculeHistoryTracking()) return
    setPaletteOpen(true)
  }

  // Ctrl+K / Cmd+K 打开命令面板；Ctrl+S 保存到浏览器（编辑器唯一的保存位置）
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (isWorkspaceShortcutBlocked(event) || !isMoleculeHistoryTracking()) return
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
        event.preventDefault()
        // 嵌入模式：分子归宿主页面，由它保存
        if (isEmbedded()) requestHostSave()
        else saveActiveMoleculeToBrowser()
        return
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setPaletteOpen(true)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <TooltipProvider delayDuration={300}>
      {/* 顶栏已去掉：命令/搜索、检查器开关（单独打开时还有保存）浮在 3D 视图右上角 */}
      <div className="absolute right-2 top-2 z-30 flex select-none items-center gap-1 rounded-lg border border-border bg-[hsl(var(--card)/0.92)] p-1 text-card-foreground shadow-sm backdrop-blur">
        {!isEmbedded() && (
          <Tip label="保存到浏览器 (Ctrl+S)" side="bottom">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 rounded-md p-0 text-muted-foreground"
              aria-label="保存到浏览器"
              onClick={() => saveActiveMoleculeToBrowser()}
            >
              <Save size={14} />
            </Button>
          </Tip>
        )}
        <Tip label="命令面板与搜索 (⌘K)" side="bottom">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1 rounded-md px-2 text-xs font-medium text-muted-foreground"
            ref={paletteTriggerRef}
            aria-label="命令面板"
            aria-haspopup="dialog"
            aria-expanded={paletteOpen}
            onClick={openPalette}
          >
            <Search size={14} />
            <kbd className="hidden rounded bg-background px-1 py-0.5 font-sans text-[10px] text-muted-foreground md:inline">⌘K</kbd>
          </Button>
        </Tip>
        <Tip label={showInspector ? '收起检查器' : '展开检查器'} side="bottom">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'h-7 w-7 rounded-md p-0 transition-all',
              showInspector
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
            )}
            id={INSPECTOR_TOGGLE_ID}
            aria-label="检查器"
            aria-controls={INSPECTOR_ID}
            aria-expanded={showInspector}
            onClick={() => { if (isMoleculeHistoryTracking()) onToggleInspector() }}
          >
            <PanelRight size={14} />
          </Button>
        </Tip>
      </div>

      <EditorCommandPalette
        onRestoreFocus={() => paletteTriggerRef.current?.focus()}
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

/**
 * 显式保存入口：当前活动分子写入浏览器本地（localStorage），成功回提示。
 * Ctrl+S、工具栏按钮、命令面板共用此唯一入口。
 */
function saveActiveMoleculeToBrowser(): void {
  const molecule = selectActiveMoleculeOrEmpty(useMoleculeStore.getState())
  const ok = useLocalSaveStore.getState().recordSave(molecule)
  editorHostPort.notify(ok ? '已保存到浏览器' : '画布为空，无需保存')
}

function EditorCommandPalette({
  onRestoreFocus,
  open,
  onOpenChange,
  history,
  fileIO,
  onSearchOpen,
}: {
  onRestoreFocus: () => void
  open: boolean
  onOpenChange: (open: boolean) => void
  history: ToolbarModel['history']
  fileIO: ToolbarModel['fileIO']
  onOpenTemplateStudio: () => void
  onSearchOpen: () => void
}) {
  const [query, setQuery] = useState('')
  const commandListRef = useRef<HTMLDivElement>(null)
  const queryRef = useRef<HTMLInputElement>(null)
  const [nextCommandOpensSurface, setNextCommandOpensSurface] = useState(false)
  const palette = useUiPaletteStore(state => state.palette)
  const setPalette = useUiPaletteStore(state => state.setPalette)
  const molecule = useMoleculeStore(selectActiveMoleculeOrEmpty)
  const isEmpty = molecule.atoms.length === 0
  const busyMessage = useAppTaskStore(selectAppBusyMessage)
  const isBusy = Boolean(busyMessage)

  const run = useCallback((item: CommandItem) => {
    setNextCommandOpensSurface(item.opensSurface === true)
    onOpenChange(false)
    setQuery('')
    item.onRun()
  }, [onOpenChange])
  type CommandItem = { label: string; hint?: string; disabled?: boolean; opensSurface?: boolean; onRun: () => void }
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
          { label: '导入 MOL/SDF（替换当前）', onRun: () => void fileIO.importMolSdf() },
          { label: '导入 MOL/SDF（添加到场景）', onRun: () => void fileIO.importMolSdfToScene() },
          { label: '导出 XYZ', disabled: isEmpty, onRun: () => fileIO.exportCurrentXYZ() },
          { label: '导出 MOL', disabled: isEmpty, onRun: () => fileIO.exportCurrentMol() },
          { label: '导出 SDF', disabled: isEmpty, onRun: () => fileIO.exportCurrentSdf() },
          { label: '导出 GJF', disabled: isEmpty, onRun: () => fileIO.exportCurrentGJF() },
          { label: '导出 PNG 截图', disabled: isEmpty, onRun: () => fileIO.exportPNG() },
        ].filter(item => filter(item.label)),
      },
      {
        title: '分子与搜索',
        items: [
          { label: '螺芴碰撞避让 Demo', opensSurface: true, onRun: () => { window.open('/?demo=steric', '_blank', 'noopener,noreferrer') } },
          { label: '闭环约束变形 Demo', opensSurface: true, onRun: () => { window.open('/?demo=constraints', '_blank', 'noopener,noreferrer') } },
          { label: '运动路径与扭曲环带 Demo', opensSurface: true, onRun: () => { window.open('/?demo=geometry-paths', '_blank', 'noopener,noreferrer') } },
          { label: 'PubChem 搜索', opensSurface: true, onRun: onSearchOpen },
          { label: '保存到浏览器 (Ctrl+S)', hint: 'Ctrl+S', disabled: isEmpty, onRun: () => saveActiveMoleculeToBrowser() },
        ]
          // 嵌入模式：不存浏览器，也不开演示页
          .filter(item => !isEmbedded() || !(item.label.includes('Demo') || item.label.startsWith('保存到浏览器')))
          .filter(item => filter(item.label)),
      },
      {
        title: '视图与主题',
        items: [
          { label: palette === 'heritage' ? '切换到默认主题' : '切换到古建筑主题', onRun: () => setPalette(palette === 'heritage' ? 'default' : 'heritage') },
        ].filter(item => filter(item.label)),
      },
    ].filter(group => group.items.length > 0)
  }, [query, history, fileIO, onSearchOpen, palette, setPalette, isEmpty])

  return (
    <Dialog open={open} onOpenChange={value => { onOpenChange(value); if (!value) setQuery('') }}>
      <DialogContent
        onCloseAutoFocus={event => {
          event.preventDefault()
          if (!nextCommandOpensSurface) onRestoreFocus()
          setNextCommandOpensSurface(false)
        }}
        onKeyDown={event => {
          if (event.defaultPrevented || (event.key !== 'ArrowDown' && event.key !== 'ArrowUp')) return
          const buttons = Array.from(commandListRef.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)') ?? [])
          if (!buttons.length) return
          event.preventDefault()
          const current = buttons.indexOf(document.activeElement as HTMLButtonElement)
          const next = current < 0 ? (event.key === 'ArrowDown' ? 0 : buttons.length - 1) : current + (event.key === 'ArrowDown' ? 1 : -1)
          if (next < 0) queryRef.current?.focus()
          else buttons[next % buttons.length]?.focus()
        }}
        aria-busy={isBusy || undefined} className="max-w-lg gap-0 overflow-hidden p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>命令面板</DialogTitle>
          <DialogDescription>搜索并执行编辑器命令</DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-2 border-b border-border px-3 py-2">
          <Command size={14} className="shrink-0 text-muted-foreground" />
          <Input
            ref={queryRef}
            aria-label="搜索命令"
            autoFocus
            placeholder="输入命令，如 导入、导出、撤销…"
            value={query}
            onChange={event => setQuery(event.target.value)}
            onKeyDown={event => {
              if (event.key !== 'Enter' || event.nativeEvent.isComposing) return
              const first = groups.flatMap(group => group.items).find(item => !item.disabled)
              if (first) { event.preventDefault(); run(first) }
            }}
            className="h-8 border-0 bg-transparent px-1 text-sm shadow-none focus-visible:ring-0"
          />
        </div>
        <ScrollArea className="max-h-[50vh]">
          <div ref={commandListRef} className="p-2">
            {groups.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">无匹配命令</div>
            ) : (
              groups.map(group => (
                <div key={group.title} className="mb-3 last:mb-0">
                  <div className="px-2 py-1 text-xs font-semibold tracking-widest text-muted-foreground">{group.title}</div>
                  <div className="space-y-0.5">
                    {group.items.map(item => (
                      <button
                        key={item.label}
                        type="button"
                        disabled={item.disabled}
                        aria-disabled={item.disabled || undefined}
                        aria-busy={isBusy || undefined}
                        onClick={() => run(item)}
                        className="flex w-full items-center justify-between rounded-md px-2.5 py-2 text-left text-xs transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:outline focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <span>{item.label}</span>
                        {item.hint && <span className="ml-2 shrink-0 font-mono text-xs text-muted-foreground">{item.hint}</span>}
                      </button>
                    ))}
                  </div>
                  <Separator className="mt-2 last:hidden" />
                </div>
              ))
            )}
          </div>
        </ScrollArea>
        <div className="flex items-center justify-between border-t border-border bg-background px-4 py-2 text-xs text-muted-foreground">
          <span>↑↓ / Tab 选择 · 回车 执行 · Esc 关闭</span>
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
