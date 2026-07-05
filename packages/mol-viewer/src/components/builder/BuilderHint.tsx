/**
 * BuilderHint — 根据当前工具显示操作提示 + flashHint 非阻断提示气泡
 */

import { useEffect, useState } from 'react'
import { useEditorStore } from '../../store/editorStore'
import { getElementConfig } from '../../config/elements.config'
import { getFragment } from '../../config/fragments.config'

const HINTS: Record<string, string> = {
  // select 工具按笔刷武装态显示不同提示，见下方组件逻辑
  'select-armed':    '双击空白加原子 · 点 H 生长 · 拖 H 成键 · Esc 切换到选择',
  'select-disarmed': '点击选择 · Shift 多选 · 双击选片段 · 选元素开始构建',
  'measure':         '点击两原子测距 · 三原子测键角 · 四原子测二面角',
  'move-object':     '拖动平移分子 · Alt+拖动旋转',
}

export default function BuilderHint() {
  const activeTool       = useEditorStore(s => s.activeTool)
  const activeElement    = useEditorStore(s => s.activeElement)
  const activeFragmentId = useEditorStore(s => s.activeFragmentId)
  const brushArmed       = useEditorStore(s => s.brushArmed)
  const sketchPlane      = useEditorStore(s => s.sketchPlane)
  const hint             = useEditorStore(s => s.hint)
  const el = getElementConfig(activeElement)
  const fragment = activeFragmentId ? getFragment(activeFragmentId) : undefined

  // flashHint 气泡：显示 2.5s 后淡出
  const [flashVisible, setFlashVisible] = useState(false)
  useEffect(() => {
    if (!hint) return
    setFlashVisible(true)
    const t = setTimeout(() => setFlashVisible(false), 2500)
    return () => clearTimeout(t)
  }, [hint])

  if (hint && flashVisible) {
    return (
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-gray-900/90 text-white text-xs px-4 py-1.5 rounded-full pointer-events-none shadow-lg">
        {hint.text}
      </div>
    )
  }

  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-white/80 backdrop-blur-sm text-gray-400 text-[10px] px-2.5 py-1 rounded-full pointer-events-none border border-gray-200/80 shadow-sm">
      {sketchPlane && (
        <span className="font-bold text-[10px] text-indigo-500 bg-indigo-50 px-1.5 py-px rounded-full">平面</span>
      )}
      {activeTool === 'select' && brushArmed && (
        <span className="font-bold text-xs text-gray-600">{fragment ? fragment.name : el.symbol}</span>
      )}
      <span>
        {activeTool === 'select'
          ? (brushArmed
              ? (fragment
                  ? '双击空白放置 · 点 H/原子接上 · 点键并环 · Esc 切换到选择'
                  : HINTS['select-armed'])
              : HINTS['select-disarmed'])
          : HINTS[activeTool] ?? ''}
      </span>
    </div>
  )
}
