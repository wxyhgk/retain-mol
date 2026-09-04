import { getFragment } from '@retainmol/mol-viewer/fragments'
import { useEditorStore } from '@/domain/viewer/editorState'
import {
  deriveWorkspaceTool,
  selectWorkspacePanel,
  useWorkspaceToolStore,
} from '@/domain/workspaceToolStore'

export function StatusBar() {
  const { activeTool, activeElement, activeFragmentId, atomClickMode, brushArmed } = useEditorStore()
  const panel = useWorkspaceToolStore(selectWorkspacePanel)
  const workspaceTool = deriveWorkspaceTool(panel, activeTool)
  const fragment = activeFragmentId ? getFragment(activeFragmentId) : undefined

  const toolLabel = {
    select: '选择',
    draw: brushArmed
      ? (fragment
          ? `绘制  ·  ${fragment.name}（${fragment.short}）`
          : `绘制  ·  ${activeElement}${atomClickMode === 'replace' ? '（原子替换）' : activeElement === 'H' ? '（加 H）' : ''}`)
      : '绘制',
    template: fragment && brushArmed
      ? `模板  ·  ${fragment.name}（${fragment.short}）`
      : '模板  ·  选择模板与连接位点',
    move: '移动  ·  Alt + 拖拽 = 旋转',
    measure: '测量  ·  点击原子  ·  Enter 提交  ·  Esc 取消',
  }

  return (
    <div className="absolute bottom-0 left-0 right-0 flex h-6 items-center border-t border-border/50 bg-[hsl(var(--card)/0.9)] px-4 text-xs text-muted-foreground backdrop-blur-sm select-none pointer-events-none">
      {toolLabel[workspaceTool]}
    </div>
  )
}
