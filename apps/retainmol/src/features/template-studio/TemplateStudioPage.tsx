import { MolViewer } from '@/domain/viewer/viewport'
import { ToolStrip } from '@/features/build-palette'
import { TemplateStudioHeader } from './components/TemplateStudioHeader'
import { TemplateLibraryPanel } from './components/TemplateLibraryPanel'
import { TemplateInspectorPanel } from './components/TemplateInspectorPanel'
import { useTemplateStudioController } from './model/useTemplateStudioController'
import { useUiThemeStore } from '@/domain/uiThemeStore'

interface TemplateStudioPageProps {
  onClose: () => void
}

export default function TemplateStudioPage({ onClose }: TemplateStudioPageProps) {
  const controller = useTemplateStudioController()
  const uiTheme = useUiThemeStore(state => state.theme)

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-background text-foreground">
      <TemplateStudioHeader controller={controller} onClose={onClose} />
      <div className="flex min-h-0 flex-1">
        <TemplateLibraryPanel controller={controller} />
        <main className="relative min-w-0 flex-1 bg-muted">
          <MolViewer appearance={uiTheme} />
          <div className="absolute bottom-3 left-1/2 z-20 -translate-x-1/2 rounded-md border border-border bg-card/95 px-3 py-1.5 text-[10px] text-muted-foreground shadow-sm backdrop-blur">
            在画布中构建分子，或从 XYZ / MOL / SDF 导入结构
          </div>
          <div className="absolute inset-y-0 left-0 z-30">
            <ToolStrip />
          </div>
        </main>
        <TemplateInspectorPanel controller={controller} />
      </div>
    </div>
  )
}
