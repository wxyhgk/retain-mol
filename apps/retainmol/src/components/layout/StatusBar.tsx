import { getFragment } from '@retainmol/mol-viewer/fragments'
import { useEditorStore } from '@/domain/viewer/editorState'
import { deriveWorkspaceTool, useWorkspaceToolStore } from '@/domain/workspaceToolStore'

export function StatusBar() {
  const { activeTool, activeElement, activeFragmentId, atomClickMode, brushArmed } = useEditorStore()
  const activePanel = useWorkspaceToolStore(state => state.activePanel)
  const workspaceTool = deriveWorkspaceTool(activeTool, brushArmed, activePanel)
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
    <div className="absolute bottom-0 left-0 right-0 h-6 flex items-center px-3 text-[11px] text-gray-400 select-none pointer-events-none">
      {toolLabel[workspaceTool]}
    </div>
  )
}
