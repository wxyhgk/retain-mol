import { Suspense, lazy, useState } from 'react'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import { MolViewer } from '@/domain/viewer/viewport'
import { useViewportStore } from '@/domain/viewer/viewportStore'
import { SelectionHud } from '@/components/layout/SelectionHud'
import { activateAppWorkspaceTool } from '@/domain/workspaceToolController'
import { TopBar } from './TopBar'
import { LeftRail, type LeftRailKey } from './LeftRail'
import { RightRail, type RightRailKey } from './RightRail'
import { BottomBar } from './BottomBar'
import { PopoverPanel } from './PopoverPanel'
import { LeftPanels } from './LeftPanels'
import { leftSubtitle, leftTitle } from './leftPanelMeta'
import { RightPanels } from './RightPanels'
import { rightSubtitle, rightTitle } from './rightPanelMeta'
import PubChemSearch from '@/components/search/PubChemSearch'

export type ViewMode = '2d' | '3d' | 'split'

const KetcherPanel = lazy(() => import('@/features/ketcher').then(m => ({ default: m.KetcherPanel })))

function toWorkspaceTool(k: LeftRailKey): 'select' | 'draw' | 'measure' | null {
  if (k === 'select') return 'select'
  if (k === 'draw' || k === 'template') return 'draw'
  if (k === 'measure') return 'measure'
  return null
}

export function ShellFrame() {
  const [view, setView] = useState<ViewMode>('split')
  const [leftOpen, setLeftOpen] = useState<LeftRailKey | null>(null)
  const [rightOpen, setRightOpen] = useState<RightRailKey | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const gridVisible = useViewportStore(s => s.gridVisible)

  const handleLeft = (k: LeftRailKey) => {
    if (k === 'ketcher') {
      setView('2d')
      return
    }
    if (k === 'erase') {
      return
    }
    const tool = toWorkspaceTool(k)
    if (tool) activateAppWorkspaceTool(tool)
    setLeftOpen(prev => (prev === k ? null : k))
  }

  const handleRight = (k: RightRailKey) => {
    setRightOpen(prev => (prev === k ? null : k))
  }

  return (
    <div className="flex h-dvh w-full flex-col overflow-hidden bg-background text-foreground">
      <TopBar view={view} onViewChange={setView} onSearch={() => setSearchOpen(true)} />
      {searchOpen && <PubChemSearch onClose={() => setSearchOpen(false)} />}

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <LeftRail active={leftOpen} onPick={handleLeft} />

        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-muted">
          <div className="relative min-h-0 flex-1 overflow-hidden">
            {view === 'split' ? (
              <PanelGroup direction="horizontal" autoSaveId="editor-shell-demo-split-3" className="h-full">
                <Panel defaultSize={50} minSize={22} className="flex min-h-0 flex-col overflow-hidden bg-white">
                  <div className="flex h-7 shrink-0 items-center justify-between border-b border-border bg-muted/40 px-3 text-xs">
                    <span className="font-medium">2D 草图</span>
                    <span className="text-[11px] text-muted-foreground">可编辑 · 同步到 3D</span>
                  </div>
                  <div className="min-h-0 flex-1 overflow-hidden">
                    <Suspense fallback={<div className="grid h-full place-items-center text-xs text-muted-foreground">加载 2D 编辑器…</div>}>
                      <KetcherPanel />
                    </Suspense>
                  </div>
                </Panel>
                <PanelResizeHandle className="group flex w-2 shrink-0 items-center justify-center bg-transparent focus-visible:outline-none">
                  <div className="h-full w-px bg-border transition-colors group-data-[resize-handle-state=hover]:bg-foreground/30 group-data-[resize-handle-state=drag]:bg-foreground/50" />
                </PanelResizeHandle>
                <Panel minSize={22} className="flex min-h-0 flex-col overflow-hidden bg-muted">
                  <div className="flex h-7 shrink-0 items-center justify-between border-b border-border bg-muted/40 px-3 text-xs">
                    <span className="font-medium">3D 视图</span>
                    <span className="text-[11px] text-muted-foreground">可编辑 · 拖拽旋转</span>
                  </div>
                  <div className="relative min-h-0 flex-1 overflow-hidden">
                    <div className="absolute inset-0">
                      <MolViewer gridVisible={gridVisible} />
                    </div>
                    <SelectionHud />
                  </div>
                </Panel>
              </PanelGroup>
            ) : view === '2d' ? (
              <div className="absolute inset-0 flex flex-col bg-white">
                <div className="flex h-7 shrink-0 items-center justify-between border-b border-border bg-muted/40 px-3 text-xs">
                  <span className="font-medium">2D 草图 · 全屏</span>
                  <span className="text-[11px] text-muted-foreground">可编辑</span>
                </div>
                <div className="min-h-0 flex-1 overflow-hidden">
                  <Suspense fallback={<div className="grid h-full place-items-center text-xs text-muted-foreground">加载 2D 编辑器…</div>}>
                    <KetcherPanel />
                  </Suspense>
                </div>
              </div>
            ) : (
              <div className="absolute inset-0 flex flex-col bg-muted">
                <div className="flex h-7 shrink-0 items-center justify-between border-b border-border bg-muted/40 px-3 text-xs">
                  <span className="font-medium">3D 视图 · 全屏</span>
                  <span className="text-[11px] text-muted-foreground">可编辑 · 拖拽旋转</span>
                </div>
                <div className="relative min-h-0 flex-1 overflow-hidden">
                  <div className="absolute inset-0">
                    <MolViewer gridVisible={gridVisible} />
                  </div>
                  <SelectionHud />
                </div>
              </div>
            )}

            {/* 底栏居中胶囊 */}
            <div className="pointer-events-none absolute inset-x-0 bottom-3 z-[5] flex justify-center">
              <div className="pointer-events-auto">
                <BottomBar />
              </div>
            </div>

            {leftOpen && (
              <div className="absolute inset-0 z-30 pointer-events-none">
                <div className="pointer-events-auto">
                  <PopoverPanel
                    open={!!leftOpen}
                    onClose={() => setLeftOpen(null)}
                    title={leftTitle(leftOpen)}
                    subtitle={leftSubtitle(leftOpen)}
                    side="left"
                    width={360}
                  >
                    <LeftPanels activeKey={leftOpen} ketcherWidth={360} />
                  </PopoverPanel>
                </div>
              </div>
            )}

            {rightOpen && (
              <div className="absolute inset-0 z-30 pointer-events-none">
                <div className="pointer-events-auto">
                  <PopoverPanel open={!!rightOpen} onClose={() => setRightOpen(null)} title={rightTitle(rightOpen)} subtitle={rightSubtitle(rightOpen)} side="right" width={380}>
                    <RightPanels activeKey={rightOpen} />
                  </PopoverPanel>
                </div>
              </div>
            )}
          </div>
        </div>

        <RightRail active={rightOpen} onPick={handleRight} />
      </div>
    </div>
  )
}
