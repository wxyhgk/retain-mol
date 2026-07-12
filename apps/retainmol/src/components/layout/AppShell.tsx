import Toolbar from '@/components/toolbar/Toolbar'
import { ToolStrip } from '@/features/build-palette'
import { RightPanel } from '@/components/panels'
import PubChemSearch from '@/components/search/PubChemSearch'
import { MolViewer } from '@/domain/viewer/viewport'
import { BusyOverlay } from './BusyOverlay'
import { SelectionHud } from './SelectionHud'
import { StatusBar } from './StatusBar'
import { ViewportToolbar } from './ViewportToolbar'
import { useCanvasFocusMode } from './useCanvasFocusMode'
import { useUiThemeStore } from '@/domain/uiThemeStore'

interface AppShellProps {
  showInspector: boolean
  searchOpen: boolean
  onToggleInspector: () => void
  onOpenTemplateStudio: () => void
  onOpenSearch: () => void
  onCloseSearch: () => void
}

export function AppShell({
  showInspector,
  searchOpen,
  onToggleInspector,
  onOpenTemplateStudio,
  onOpenSearch,
  onCloseSearch,
}: AppShellProps) {
  const canvasFocus = useCanvasFocusMode()
  const uiTheme = useUiThemeStore(state => state.theme)

  return (
    <div
      className="flex h-dvh w-full flex-col overflow-hidden bg-background text-foreground"
      data-canvas-interacting={canvasFocus.interacting ? 'true' : 'false'}
    >
      <Toolbar
        showInspector={showInspector}
        onToggleInspector={onToggleInspector}
        onOpenTemplateStudio={onOpenTemplateStudio}
        onSearchOpen={onOpenSearch}
      />
      <PubChemSearch open={searchOpen} onClose={onCloseSearch} />

      <div className="relative flex min-h-0 flex-1 overflow-hidden">
        <div className="relative z-30 h-full w-[72px] shrink-0">
          <ToolStrip onToggleInspector={onToggleInspector} />
        </div>
        <main
          className="relative h-full min-w-0 flex-1 overflow-hidden bg-muted"
          onPointerDownCapture={event => canvasFocus.begin(event.target)}
          onPointerUpCapture={canvasFocus.finish}
          onPointerCancelCapture={canvasFocus.finish}
          onWheelCapture={event => canvasFocus.pulse(event.target)}
        >
          <div className="absolute inset-0"><MolViewer appearance={uiTheme} gridVisible={false} /></div>
          <SelectionHud />
          <BusyOverlay />
          <ViewportToolbar />
          <StatusBar />

          {showInspector && (
            <aside
              data-workspace-floating="true"
              className="absolute bottom-3 right-3 top-3 z-30 w-[min(340px,calc(100%-24px))] min-w-0 overflow-hidden rounded-lg border border-border bg-card/95 text-card-foreground shadow-[0_14px_34px_rgba(0,0,0,0.14)] backdrop-blur-md transition-opacity duration-75"
            >
              <RightPanel />
            </aside>
          )}
        </main>
      </div>
    </div>
  )
}
