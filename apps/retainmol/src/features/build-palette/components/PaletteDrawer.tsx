import { X } from 'lucide-react'
import type { BuildPaletteController } from '../model/useBuildPaletteController'
import { TemplateWorkspacePanel } from './workspace/TemplateWorkspacePanel'

const PANEL_META = {
  template: { title: '模板', subtitle: '环系、连接模板与起始结构' },
} as const

export function PaletteDrawer({ controller }: { controller: BuildPaletteController }) {
  const panel = controller.panel
  if (panel !== 'template') return null
  const meta = PANEL_META[panel]

  return (
    <aside
      aria-label={`${meta.title}上下文面板`}
      data-workspace-floating="true"
      className="absolute left-[84px] top-3 z-30 flex w-[340px] max-w-[calc(100vw-96px)] flex-col overflow-hidden rounded-lg border border-border bg-card/95 text-card-foreground shadow-[0_14px_34px_rgba(0,0,0,0.14)] backdrop-blur-md transition-opacity duration-75"
      style={{ height: 'calc(100% - 24px)' }}
    >
      <div className="flex items-start justify-between border-b border-border px-3 py-2.5">
        <div className="min-w-0">
          <div className="text-xs font-semibold text-foreground">{meta.title}</div>
          <div className="mt-0.5 truncate text-[10px] text-muted-foreground">{meta.subtitle}</div>
        </div>
        <button
          type="button"
          aria-label="关闭上下文面板"
          title="关闭"
          onClick={controller.closePanel}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          <X size={14} />
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-hidden p-3">
        <div className="h-full overflow-y-auto [scrollbar-color:currentColor_transparent] [scrollbar-width:thin]">
          <TemplateWorkspacePanel
            activeFragmentId={controller.activeFragmentId}
            onPickTemplate={controller.pickTemplate}
            onPickFragment={controller.pickTemplateFragment}
            onPickRuntimeSite={controller.pickRuntimeTemplateSite}
          />
        </div>
      </div>
    </aside>
  )
}
