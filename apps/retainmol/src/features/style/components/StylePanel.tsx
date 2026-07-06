import { useEditorStore, useMoleculeStore, listThemes, centerMolecule, SAMPLE_MOLECULES, cn } from '@retainmol/mol-viewer'
import type { DisplayMode } from '@retainmol/mol-viewer'
import { Hash, FlaskConical } from 'lucide-react'

const DISPLAY_MODES: { id: DisplayMode; label: string; desc: string }[] = [
  { id: 'ball-stick', label: '球棍',  desc: 'Ball & Stick' },
  { id: 'spacefill',  label: '空填',  desc: 'Space Fill'   },
  { id: 'stick',      label: '棍棒',  desc: 'Stick'        },
  { id: 'tube',       label: '管状',  desc: 'Tube'         },
  { id: 'wireframe',  label: '线框',  desc: 'Wireframe'    },
]

export default function StylePanel() {
  const { displayMode, setDisplayMode, renderStyle, setRenderStyle, showAtomLabels, toggleAtomLabels, themeId, setTheme } = useEditorStore()
  const { setMolecule } = useMoleculeStore()
  const themes = listThemes()

  return (
    <div className="p-3 space-y-5">

      {/* 渲染模式 */}
      <section>
        <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">渲染模式</div>
        <div className="grid grid-cols-2 gap-1.5">
          {DISPLAY_MODES.map(m => (
            <button
              key={m.id}
              onClick={() => setDisplayMode(m.id)}
              className={cn(
                'flex flex-col items-start px-2.5 py-2 rounded-lg border text-left transition-all',
                displayMode === m.id
                  ? 'bg-gray-900 border-gray-900 text-white'
                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-100'
              )}
            >
              <span className="text-xs font-medium">{m.label}</span>
              <span className={cn('text-[10px]', displayMode === m.id ? 'opacity-50' : 'opacity-60')}>{m.desc}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 渲染风格 */}
      <section>
        <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">渲染风格</div>
        <div className="grid grid-cols-2 gap-1.5">
          {([
            { id: 'realistic',   label: '写实', desc: 'Realistic'   },
            { id: 'publication', label: '论文', desc: 'Publication' },
          ] as const).map(s => (
            <button
              key={s.id}
              onClick={() => setRenderStyle(s.id)}
              className={cn(
                'flex flex-col items-start px-2.5 py-2 rounded-lg border text-left transition-all',
                renderStyle === s.id
                  ? 'bg-gray-900 border-gray-900 text-white'
                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-100'
              )}
            >
              <span className="text-xs font-medium">{s.label}</span>
              <span className={cn('text-[10px]', renderStyle === s.id ? 'opacity-50' : 'opacity-60')}>{s.desc}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 标注 */}
      <section>
        <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">标注</div>
        <button
          onClick={toggleAtomLabels}
          className={cn(
            'w-full flex items-center gap-2 px-3 py-2 rounded-lg border text-xs transition-all',
            showAtomLabels
              ? 'bg-gray-900 border-gray-900 text-white'
              : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-100'
          )}
        >
          <Hash size={13} />
          <span>显示原子编号</span>
          <span className={cn('ml-auto text-[10px] px-1.5 py-0.5 rounded font-medium',
            showAtomLabels ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-400'
          )}>
            {showAtomLabels ? '开' : '关'}
          </span>
        </button>
      </section>

      {/* 主题 */}
      <section>
        <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">主题</div>
        <div className="space-y-0.5">
          {themes.map(t => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={cn(
                'w-full flex items-center px-3 py-1.5 rounded-lg text-xs text-left transition-all',
                themeId === t.id
                  ? 'bg-gray-100 text-gray-900 font-semibold'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
              )}
            >
              {t.name}
              {themeId === t.id && <span className="ml-auto text-gray-400 text-[10px]">✓</span>}
            </button>
          ))}
        </div>
      </section>

      {/* 示例分子 */}
      <section>
        <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
          <FlaskConical size={11} />示例分子
        </div>
        <div className="space-y-0.5">
          {SAMPLE_MOLECULES.map(s => (
            <button
              key={s.name}
              onClick={() => setMolecule(centerMolecule(s.mol()))}
              className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-all"
            >
              {s.name}
            </button>
          ))}
        </div>
      </section>

    </div>
  )
}
