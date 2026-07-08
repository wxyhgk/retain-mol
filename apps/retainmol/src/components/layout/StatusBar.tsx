import { getFragment } from '@retainmol/mol-viewer/fragments'
import { useEditorStore } from '@/domain/viewerAdapter'

export function StatusBar() {
  const { activeTool, activeElement, activeFragmentId, brushArmed } = useEditorStore()
  const fragment = activeFragmentId ? getFragment(activeFragmentId) : undefined

  const toolLabel: Record<string, string> = {
    select: brushArmed
      ? (fragment
          ? `编辑  ·  ${fragment.name}（${fragment.short}）`
          : `编辑  ·  ${activeElement}`)
      : '选择',
    'move-object': '移动  ·  Alt + 拖拽 = 旋转',
    measure: '测量  ·  点击原子  ·  Enter 提交  ·  Esc 取消',
  }

  return (
    <div className="absolute bottom-0 left-0 right-0 h-6 flex items-center px-3 text-[11px] text-gray-400 select-none pointer-events-none">
      {toolLabel[activeTool] ?? activeTool}
    </div>
  )
}
