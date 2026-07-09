import { useState } from 'react'
import {
  Atom,
  Hexagon,
  MousePointer2,
  Move,
  Pencil,
  Ruler,
  Shapes,
  Slash,
} from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { placeMoleculeInViewer } from '@/domain/moleculePlacementService'
import { getElementConfig, PERIODIC_TABLE_LAYOUT } from '@retainmol/mol-viewer/core'
import { getFragment } from '@retainmol/mol-viewer/fragments'
import { useEditorStore } from '@/domain/viewerAdapter'
import {
  COMMON_ATOMS,
  COMMON_HYBRID_IDS,
  RING_FRAGMENTS,
  TEMPLATE_MOLECULES,
  createCanvasMoleculeFromTemplate,
  toElementHex,
  type TemplateMoleculeDef,
} from '@/domain/buildTools'
import type { Tool } from '@retainmol/mol-viewer/core'
import { cn } from '@/lib/utils'

type PalettePanel = 'elements' | 'rings' | 'templates' | null

/** RetainMol toolbar: ChemDraw-inspired permanent palette, not a ChemDraw clone. */
export default function ToolStrip() {
  const {
    activeTool,
    setActiveTool,
    activeElement,
    activeFragmentId,
    brushArmed,
    armBrush,
    disarmBrush,
    setActiveElement,
    setAtomClickMode,
    setActiveFragment,
  } = useEditorStore()
  const [panel, setPanel] = useState<PalettePanel>(null)

  const activeFragment = activeFragmentId ? getFragment(activeFragmentId) : undefined
  const activeElementConfig = getElementConfig(activeElement)
  const activeColor = activeFragment ? '#4f46e5' : toElementHex(activeElementConfig.color)

  const pickAtom = (symbol: string) => {
    setAtomClickMode('replace')
    setActiveElement(symbol)
    setActiveTool('select')
    armBrush()
  }

  const pickFragment = (id: string) => {
    const fragment = getFragment(id)
    const symbol = fragment?.atoms[fragment.attachIndex]?.symbol
    if (symbol) setActiveElement(symbol)
    setActiveFragment(id)
    setActiveTool('select')
    setPanel(null)
  }

  const pickTemplate = (id: string) => {
    const molecule = createCanvasMoleculeFromTemplate(id)
    if (molecule) void placeMoleculeInViewer(molecule, { mode: 'replace' })
    setPanel(null)
  }

  const activateBuild = () => {
    setPanel(null)
    setActiveTool('select')
    armBrush()
  }

  const operationItems = [
    {
      key: 'select',
      label: '选择',
      active: activeTool === 'select' && !brushArmed,
      onClick: () => { setPanel(null); setActiveTool('select'); disarmBrush() },
      content: <MousePointer2 size={15} />,
    },
    {
      key: 'build',
      label: '构建',
      active: activeTool === 'select' && brushArmed,
      onClick: activateBuild,
      content: <Pencil size={15} />,
    },
    {
      key: 'move-object',
      label: '移动分子',
      active: activeTool === 'move-object',
      onClick: () => { setPanel(null); setActiveTool('move-object' as Tool); disarmBrush() },
      content: <Move size={15} />,
    },
    {
      key: 'measure',
      label: '测量',
      active: activeTool === 'measure',
      onClick: () => { setPanel(null); setActiveTool('measure' as Tool); disarmBrush() },
      content: <Ruler size={15} />,
    },
  ]

  const primaryMaterialItems = [
    {
      key: 'current',
      label: activeFragment ? activeFragment.name : `${activeElement} 单原子替换`,
      active: brushArmed && activeTool === 'select' && panel !== 'rings' && panel !== 'templates',
      onClick: () => { activateBuild(); setPanel(panel === 'elements' ? null : 'elements') },
      content: <span className="text-[11px] font-bold" style={{ color: activeColor }}>{activeFragment?.short ?? activeElement}</span>,
    },
    {
      key: 'c-sp3',
      label: 'C sp3 桩',
      active: activeFragmentId === 'c-sp3' && brushArmed,
      onClick: () => pickFragment('c-sp3'),
      content: <Slash size={15} />,
    },
  ]

  const libraryItems = [
    {
      key: 'rings',
      label: '环系',
      active: panel === 'rings' || !!activeFragment?.group?.includes('ring'),
      onClick: () => { activateBuild(); setPanel(panel === 'rings' ? null : 'rings') },
      content: <Hexagon size={15} />,
    },
    {
      key: 'templates',
      label: '模板分子',
      active: panel === 'templates',
      onClick: () => { activateBuild(); setPanel(panel === 'templates' ? null : 'templates') },
      content: <Shapes size={15} />,
    },
    {
      key: 'elements',
      label: '更多元素',
      active: panel === 'elements',
      onClick: () => { activateBuild(); setPanel(panel === 'elements' ? null : 'elements') },
      content: <Atom size={15} />,
    },
  ]

  return (
    <TooltipProvider delayDuration={180}>
      <div className="relative h-full w-[92px] border-r border-gray-200 bg-white/90 px-2 py-2 shadow-sm backdrop-blur">
        <div className="flex h-full gap-1.5">
          <div className="flex flex-col gap-1">
            <RailLabel>工具</RailLabel>
            {operationItems.map(item => (
              <ToolCell
                key={item.key}
                label={item.label}
                active={item.active}
                onClick={item.onClick}
              >
                {item.content}
              </ToolCell>
            ))}
          </div>

          <div className="flex h-full flex-col border-l border-gray-200 pl-1.5">
            <div className="flex flex-col gap-1">
              <RailLabel>构建</RailLabel>
              {primaryMaterialItems.map(item => (
                <ToolCell
                  key={item.key}
                  label={item.label}
                  active={item.active}
                  onClick={item.onClick}
                >
                  {item.content}
                </ToolCell>
              ))}
            </div>

            <div className="mt-auto flex flex-col gap-1 pb-1">
              <RailLabel>常用</RailLabel>
              {libraryItems.map(item => (
                <ToolCell
                  key={item.key}
                  label={item.label}
                  active={item.active}
                  onClick={item.onClick}
                >
                  {item.content}
                </ToolCell>
              ))}
            </div>
          </div>
        </div>

        {panel && (
          <div className="absolute left-[98px] top-2 z-30 w-[360px] max-h-[calc(100vh-16px)] overflow-y-auto rounded-xl border border-gray-200 bg-white p-3 shadow-xl">
            {panel === 'elements' && (
              <ElementPanel
                activeElement={activeElement}
                activeFragmentId={activeFragmentId}
                onPickAtom={pickAtom}
                onPickFragment={pickFragment}
              />
            )}
            {panel === 'rings' && <RingPanel activeFragmentId={activeFragmentId} onPickFragment={pickFragment} />}
            {panel === 'templates' && <TemplatePanel onPickTemplate={pickTemplate} />}
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}

function ToolCell({
  children,
  label,
  active,
  onClick,
}: {
  children: React.ReactNode
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={label}
          title={label}
          onClick={onClick}
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-lg border text-gray-500 transition-all',
            active
              ? 'border-gray-900 bg-gray-900 text-white shadow-sm'
              : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-white hover:text-gray-900'
          )}
        >
          {children}
        </button>
      </TooltipTrigger>
      <TooltipContent side="right" className="text-xs bg-gray-800 text-white border-gray-700">
        {label}
      </TooltipContent>
    </Tooltip>
  )
}

function RailLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-4 text-center text-[9px] font-semibold leading-4 text-gray-400">
      {children}
    </div>
  )
}

function ElementPanel({
  activeElement,
  activeFragmentId,
  onPickAtom,
  onPickFragment,
}: {
  activeElement: string
  activeFragmentId: string | null
  onPickAtom: (symbol: string) => void
  onPickFragment: (id: string) => void
}) {
  return (
    <div className="space-y-3">
      <PanelHeader title="元素与杂化" subtitle="默认 C 为 sp3 桩；单原子需要显式选择" />
      <div className="grid grid-cols-5 gap-1.5">
        {COMMON_HYBRID_IDS.map(id => {
          const fragment = getFragment(id)
          if (!fragment) return null
          return (
            <button
              key={id}
              type="button"
              title={fragment.name}
              onClick={() => onPickFragment(id)}
              className={cn(
                'h-11 rounded-lg border text-sm font-semibold transition-all',
                activeFragmentId === id
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-[0_0_0_2px_rgba(99,102,241,0.18)]'
                  : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300 hover:bg-white'
              )}
            >
              {fragment.short}
            </button>
          )
        })}
      </div>

      <div>
        <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">单原子替换</div>
        <div className="grid grid-cols-10 gap-1">
          {COMMON_ATOMS.map(symbol => {
            const config = getElementConfig(symbol)
            const color = toElementHex(config.color)
            const active = activeElement === symbol && !activeFragmentId
            return (
              <button
                key={symbol}
                type="button"
                title={`${symbol} · ${config.name}`}
                onClick={() => onPickAtom(symbol)}
                className={cn(
                  'h-7 rounded-md border text-[11px] font-bold transition-all',
                  active ? 'shadow-[0_0_0_2px_rgba(17,24,39,0.14)]' : 'hover:scale-105'
                )}
                style={{
                  color,
                  background: `${color}${active ? '26' : '12'}`,
                  borderColor: `${color}${active ? '99' : '44'}`,
                }}
              >
                {symbol}
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">周期表</div>
        <div className="flex flex-col gap-px">
          {PERIODIC_TABLE_LAYOUT.map((row, rowIndex) => (
            <div key={rowIndex} className="flex gap-px">
              {row.map((symbol, colIndex) => {
                if (!symbol || symbol === '*') return <div key={colIndex} className="h-[18px] w-[18px] shrink-0" />
                const config = getElementConfig(symbol)
                const configured = config.atomicNumber !== 0
                const color = toElementHex(config.color)
                return (
                  <button
                    key={`${symbol}-${colIndex}`}
                    type="button"
                    title={configured ? `${symbol} · ${config.name}` : symbol}
                    onClick={() => onPickAtom(symbol)}
                    className="h-[18px] w-[18px] shrink-0 rounded text-[9px] font-medium leading-none transition-all hover:scale-105"
                    style={{
                      color: configured ? color : '#b8bcc2',
                      background: configured ? `${color}10` : '#fafafa',
                      border: `1px solid ${configured ? `${color}30` : '#eef0f2'}`,
                    }}
                  >
                    {symbol}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function RingPanel({
  activeFragmentId,
  onPickFragment,
}: {
  activeFragmentId: string | null
  onPickFragment: (id: string) => void
}) {
  return (
    <div className="space-y-3">
      <PanelHeader title="环系" subtitle="点空白放环 · 点键并环 · 点原子接上" />
      <div className="grid grid-cols-2 gap-1.5">
        {RING_FRAGMENTS.map(fragment => (
          <button
            key={fragment.id}
            type="button"
            title={fragment.name}
            onClick={() => onPickFragment(fragment.id)}
            className={cn(
              'flex h-14 flex-col items-center justify-center rounded-lg border transition-all',
              activeFragmentId === fragment.id
                ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-[0_0_0_2px_rgba(99,102,241,0.18)]'
                : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300 hover:bg-white'
            )}
          >
            <span className="text-xs font-semibold">{fragment.name}</span>
            <span className="text-[10px] text-gray-400">{fragment.formula}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function TemplatePanel({
  onPickTemplate,
}: {
  onPickTemplate: (id: TemplateMoleculeDef['id']) => void
}) {
  return (
    <div className="space-y-3">
      <PanelHeader title="模板分子" subtitle="点击模板会替换当前画布" />
      <div className="grid grid-cols-2 gap-1.5">
        {TEMPLATE_MOLECULES.map(template => {
          return (
            <button
              key={template.id}
              type="button"
              title={template.description}
              onClick={() => onPickTemplate(template.id)}
              className="flex h-[52px] flex-col items-center justify-center rounded-lg border border-gray-200 bg-gray-50 px-2 transition-all hover:border-gray-300 hover:bg-white"
            >
              <span className="text-xs font-semibold text-gray-700">{template.name}</span>
              <span className="text-[10px] text-gray-400">{template.formula}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function PanelHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <div className="text-sm font-semibold text-gray-900">{title}</div>
      <div className="mt-0.5 text-[11px] text-gray-400">{subtitle}</div>
    </div>
  )
}
