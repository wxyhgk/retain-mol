import Toolbar from '@/components/toolbar/Toolbar'
import ToolStrip from '@/components/toolbar/ToolStrip'
import { RightPanel } from '@/components/panels'
import PubChemSearch from '@/components/search/PubChemSearch'
import { MolViewer } from '@/domain/viewerAdapter'
import { BusyOverlay } from './BusyOverlay'
import { CanvasLabel } from './CanvasLabel'
import { StatusBar } from './StatusBar'

interface AppShellProps {
  showInspector: boolean
  searchOpen: boolean
  onToggleInspector: () => void
  onOpenSearch: () => void
  onCloseSearch: () => void
}

export function AppShell({
  showInspector,
  searchOpen,
  onToggleInspector,
  onOpenSearch,
  onCloseSearch,
}: AppShellProps) {
  return (
    <div className="h-screen w-screen flex flex-col bg-[#EBEBEB] overflow-hidden">
      <Toolbar
        showInspector={showInspector}
        onToggleInspector={onToggleInspector}
        onSearchOpen={onOpenSearch}
      />
      <PubChemSearch open={searchOpen} onClose={onCloseSearch} />

      <div className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0">
          <MolViewer />
        </div>

        <div className="absolute left-0 top-0 bottom-0 z-30">
          <ToolStrip />
        </div>

        <CanvasLabel />

        {showInspector && (
          <div className="absolute right-3 top-3 bottom-3 w-[300px] z-10 rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden flex flex-col">
            <RightPanel />
          </div>
        )}

        <BusyOverlay />
        <StatusBar />
      </div>
    </div>
  )
}
