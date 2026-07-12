import type { ReactNode } from 'react'
import { Atom, CircleHelp, CirclePlus, Ellipsis, Eraser, Hexagon, Link2, Moon, Ruler, Settings, Sun, Type } from 'lucide-react'
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarSeparator } from '@/components/ui/sidebar'
import { useEditorStore } from '@/domain/viewer/editorState'
import { useMoleculeStore } from '@/domain/viewer/moleculeState'
import type { WorkspaceTool } from '@/domain/workspaceToolStore'
import type { BuildPaletteController } from '../model/useBuildPaletteController'
import { useUiThemeStore } from '@/domain/uiThemeStore'
import { cn } from '@/lib/utils'

type RailItem = {
  id: string
  label: string
  icon: ReactNode
  workspaceTool?: WorkspaceTool
}

const ITEMS: readonly RailItem[] = [
  { id: 'erase', label: 'Erase', icon: <Eraser /> },
  { id: 'bond', label: 'Bond', icon: <Link2 />, workspaceTool: 'bond' },
  { id: 'atom', label: 'Atom', icon: <Atom /> },
  { id: 'charge', label: 'Charge', icon: <CirclePlus /> },
  { id: 'ring', label: 'Ring', icon: <Hexagon />, workspaceTool: 'template' },
  { id: 'measure', label: 'Measure', icon: <Ruler />, workspaceTool: 'measure' },
  { id: 'text', label: 'Text', icon: <Type /> },
  { id: 'more', label: 'More', icon: <Ellipsis /> },
]

type Controller = Pick<BuildPaletteController, 'workspaceTool' | 'activeElement' | 'activateTool' | 'inspectElement'>

export function ToolRail({ controller, onToggleInspector }: { controller: Controller; onToggleInspector: () => void }) {
  const removeSelected = useMoleculeStore(state => state.removeSelected)
  const selectionCount = useMoleculeStore(state => state.selectedAtomIds.size + state.selectedBondIds.size)
  const flashHint = useEditorStore(state => state.flashHint)
  const uiTheme = useUiThemeStore(state => state.theme)
  const toggleTheme = useUiThemeStore(state => state.toggleTheme)

  const activate = (item: RailItem) => {
    if (item.workspaceTool) return controller.activateTool(item.workspaceTool)
    if (item.id === 'erase') {
      if (selectionCount > 0) removeSelected()
      else flashHint('先选择需要删除的原子或键')
      return
    }
    if (item.id === 'atom') {
      controller.inspectElement(controller.activeElement)
      controller.activateTool('draw')
      return
    }
    if (item.id === 'charge') {
      controller.activateTool('select')
      onToggleInspector()
      flashHint('选择原子后，在 Inspector 中修改形式电荷')
      return
    }
    flashHint(item.id === 'text' ? '文本工具为后续工作区占位' : '更多工具为后续工作区占位')
  }

  return (
    <Sidebar collapsible="none" className="w-[72px] border-r border-border bg-sidebar text-sidebar-foreground">
      <SidebarContent className="gap-0 overflow-y-auto px-1.5 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <SidebarGroup className="p-0">
          <SidebarMenu className="gap-0.5">
            {ITEMS.map(item => {
              const active = Boolean(item.workspaceTool && controller.workspaceTool === item.workspaceTool)
              return (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    type="button"
                    size="lg"
                    data-rail-tool={item.id}
                    aria-label={item.label}
                    aria-pressed={active}
                    isActive={active}
                    tooltip={item.label}
                    onClick={() => activate(item)}
                    className="h-[clamp(44px,6.2vh,55px)] w-[59px] flex-col justify-center gap-1 rounded-md p-0 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground [&>svg]:size-[19px] [&>svg]:stroke-[1.7]"
                  >
                    {item.icon}
                    <span className="text-[10px] font-medium leading-none">{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarSeparator className="mx-2 bg-sidebar-border" />
      <SidebarFooter className="items-center gap-1 px-1.5 py-2">
        <button
          type="button"
          className="relative my-1 h-6 w-10 rounded-full border border-current bg-white text-black transition-colors dark:bg-black dark:text-white"
          aria-label={uiTheme === 'day' ? '切换到夜间主题' : '切换到白天主题'}
          title={uiTheme === 'day' ? '夜间主题' : '白天主题'}
          aria-pressed={uiTheme === 'night'}
          onClick={toggleTheme}
        >
          <span className={cn(
            'absolute top-0.5 flex size-[18px] items-center justify-center rounded-full bg-black text-white transition-transform dark:bg-white dark:text-black',
            uiTheme === 'night' ? 'translate-x-[18px]' : 'translate-x-0.5',
          )}>
            {uiTheme === 'night' ? <Moon size={10} /> : <Sun size={10} />}
          </span>
        </button>
        <SidebarMenu className="items-center gap-1">
          <Utility label="Help" onClick={() => flashHint('快捷键：S 选择 · B 键 · M 测量 · Delete 删除')}><CircleHelp /></Utility>
          <Utility label="Settings" onClick={onToggleInspector}><Settings /></Utility>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

function Utility({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton type="button" size="lg" aria-label={label} tooltip={label} onClick={onClick} className="size-10 justify-center rounded-md p-0 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground [&>svg]:size-[19px]">
        {children}
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}
