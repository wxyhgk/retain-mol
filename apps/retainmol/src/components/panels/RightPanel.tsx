import { Tabs, TabsContent, TabsList, TabsTrigger } from '@retainmol/ui-kit'
import { MeasureSection, SelectionInspector } from '@/features/inspector'
import { useEditorStore } from '@/domain/viewer/editorState'
import { WorkspaceDisplayPanel, WorkspaceScenePanel } from '@/features/workspace-panels'
import type { WorkspaceMode } from '@/App'
import { cn } from '@/lib/utils'

export interface RightPanelProps {
  workspaceMode?: WorkspaceMode
}

export default function RightPanel({ workspaceMode }: RightPanelProps) {
  const hasLeftWorkspace = workspaceMode === 'simulate' || workspaceMode === 'analyze'
  return (
    <Tabs defaultValue="inspector" className="flex h-full min-h-0 min-w-0 flex-col bg-transparent text-foreground">
      <div className="shrink-0 border-b border-border px-2">
        <TabsList className={cn('grid h-10 w-full rounded-none bg-transparent p-0', hasLeftWorkspace ? 'grid-cols-2' : 'grid-cols-3')}>
          <PanelTab value="inspector" label="Inspector" />
          {!hasLeftWorkspace && <PanelTab value="scene" label="Scene" />}
          <PanelTab value="display" label="Display" />
        </TabsList>
      </div>

      <div className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden [scrollbar-color:currentColor_transparent] [scrollbar-width:thin]">
        <TabsContent value="inspector" className="mt-0 min-w-0">
          <InspectorContent />
        </TabsContent>
        {!hasLeftWorkspace && (
          <TabsContent value="scene" className="mt-0 min-w-0">
            <WorkspaceScenePanel />
          </TabsContent>
        )}
        <TabsContent value="display" className="mt-0 min-w-0">
          <WorkspaceDisplayPanel />
        </TabsContent>
      </div>
    </Tabs>
  )
}

function InspectorContent() {
  const activeTool = useEditorStore(state => state.activeTool)
  const isMeasureActive = activeTool === 'measure'
  return (
    <div className="min-w-0">
      {isMeasureActive && <MeasureSection />}
      <SelectionInspector />
    </div>
  )
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
