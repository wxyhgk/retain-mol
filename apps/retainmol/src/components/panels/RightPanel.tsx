import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SelectionInspector } from '@/features/selection-inspector'
import { MeasurePanel } from '@/features/measure'
import { useEditorStore } from '@/domain/viewer/editorState'
import { WorkspaceDisplayPanel, WorkspaceScenePanel } from '@/features/workspace-panels'

export default function RightPanel() {
  return (
    <Tabs defaultValue="inspector" className="flex h-full min-h-0 min-w-0 flex-col bg-transparent text-foreground">
      <div className="shrink-0 border-b border-border px-2">
        <TabsList className="grid h-10 w-full grid-cols-3 rounded-none bg-transparent p-0">
          <PanelTab value="inspector" label="Inspector" />
          <PanelTab value="scene" label="Scene" />
          <PanelTab value="display" label="Display" />
        </TabsList>
      </div>

      <div className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden [scrollbar-color:currentColor_transparent] [scrollbar-width:thin]">
        <TabsContent value="inspector" className="mt-0 min-w-0">
          <InspectorContent />
        </TabsContent>
        <TabsContent value="scene" className="mt-0 min-w-0">
          <WorkspaceScenePanel />
        </TabsContent>
        <TabsContent value="display" className="mt-0 min-w-0">
          <WorkspaceDisplayPanel />
        </TabsContent>
      </div>
    </Tabs>
  )
}

function InspectorContent() {
  const activeTool = useEditorStore(state => state.activeTool)
  return activeTool === 'measure' ? <MeasurePanel /> : <SelectionInspector />
}

function PanelTab({ value, label }: { value: string; label: string }) {
  return (
    <TabsTrigger
      value={value}
      className="relative h-10 min-w-0 rounded-none border-b-2 border-transparent px-1 text-[11px] font-medium text-muted-foreground shadow-none transition-colors hover:text-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"
    >
      <span>{label}</span>
    </TabsTrigger>
  )
}
