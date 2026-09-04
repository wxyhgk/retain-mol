import type { CSSProperties } from 'react'
import { SidebarProvider } from '@retainmol/ui-kit'
import { ToolRail } from './components/ToolRail'
import { PaletteDrawer } from './components/PaletteDrawer'
import { useBuildPaletteController } from './model/useBuildPaletteController'

export default function ToolStrip({ onToggleInspector = () => {} }: { onToggleInspector?: () => void }) {
  const controller = useBuildPaletteController()
  return (
    <SidebarProvider
      defaultOpen
      className="relative h-full min-h-0 w-[72px] bg-white"
      style={{ '--sidebar-width': '72px', '--sidebar-width-icon': '72px' } as CSSProperties}
    >
      <div className="relative h-full w-[72px] shadow-[4px_0_16px_rgba(15,23,42,0.14)]">
        <ToolRail controller={controller} onToggleInspector={onToggleInspector} />
        <PaletteDrawer controller={controller} />
      </div>
    </SidebarProvider>
  )
}
