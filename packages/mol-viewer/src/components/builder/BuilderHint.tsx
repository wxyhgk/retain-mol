/**
 * BuilderHint — 根据当前工具显示操作提示
 */

import { useEditorStore } from '../../store/editorStore'
import { getElementConfig } from '../../config/elements.config'

const HINTS: Record<string, string> = {
  'select':   '点击选择原子或键 · Shift 多选 · Shift+点击键切换键级',
  'add-atom': '点击已有原子按键长自动成键 · 点击空白放置起始原子',
  'add-bond': '点击第一个原子 → 再点击第二个原子成键',
  'delete':   '点击原子或键进行删除',
  'measure':  '点击两原子测距 · 三原子测键角 · 四原子测二面角',
}

export default function BuilderHint() {
  const { activeTool, activeElement, bondingAtomId } = useEditorStore()
  const el = getElementConfig(activeElement)

  if (bondingAtomId) {
    return (
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-gray-900/90 text-white text-xs px-4 py-1.5 rounded-full pointer-events-none shadow-lg">
        点击第二个原子成键 · 点击空白取消
      </div>
    )
  }

  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-white/80 backdrop-blur-sm text-gray-400 text-[10px] px-2.5 py-1 rounded-full pointer-events-none border border-gray-200/80 shadow-sm">
      {activeTool === 'add-atom' && (
        <span className="font-bold text-xs text-gray-600">{el.symbol}</span>
      )}
      <span>{HINTS[activeTool] ?? ''}</span>
    </div>
  )
}
