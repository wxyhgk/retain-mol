import { Atom, GitBranch, Replace } from 'lucide-react'
import { getElementConfig, PERIODIC_TABLE_LAYOUT } from '@retainmol/mol-viewer/core'
import { cn } from '@/lib/utils'
import {
  COMMON_ATOMS,
  getHybridFragmentsForElement,
  HYBRID_GROUP_LABEL,
  toElementHex,
} from '../domain/buildCatalog'

interface ElementPaletteProps {
  activeElement: string
  atomClickMode: 'grow' | 'replace'
  inspectedElement: string
  activeFragmentId: string | null
  onInspectElement: (symbol: string) => void
  onPickAtom: (symbol: string) => void
  onPickHydrogenGrow: () => void
  onPickFragment: (id: string) => void
}

export function ElementPalette({
  activeElement,
  atomClickMode,
  inspectedElement,
  activeFragmentId,
  onInspectElement,
  onPickAtom,
  onPickHydrogenGrow,
  onPickFragment,
}: ElementPaletteProps) {
  const config = getElementConfig(inspectedElement)
  const color = toElementHex(config.color)
  const hybrids = getHybridFragmentsForElement(inspectedElement)

  return (
    <div className="space-y-3">
      <section>
        <SectionTitle index="1" label="选择元素" detail="常用" />
        <ElementGrid symbols={COMMON_ATOMS} inspectedElement={inspectedElement} onInspectElement={onInspectElement} />
      </section>

      <section className="border-t border-gray-100 pt-3">
        <SectionTitle index="2" label="操作方式" detail={`${config.name} · ${inspectedElement}`} />
        <div className="rounded-md border border-gray-200 bg-gray-50/80 p-2">
          <div className="mb-2 flex items-center gap-2 border-b border-gray-200/80 pb-2">
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border bg-white text-sm font-bold shadow-sm"
              style={{ color, borderColor: `${color}66` }}
            >
              {inspectedElement}
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-semibold text-gray-900">{config.name}</div>
              <div className="text-[9px] text-gray-400">当前待构建元素</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <BuildChoice
              active={activeElement === inspectedElement && !activeFragmentId && atomClickMode === 'replace'}
              icon={<Replace size={13} />}
              title="替换原子"
              subtitle={`替换为 ${inspectedElement}`}
              onClick={() => onPickAtom(inspectedElement)}
            />
            <BuildChoice
              active={activeElement === 'H' && !activeFragmentId && atomClickMode === 'grow'}
              icon={<Atom size={13} />}
              title="加 H"
              subtitle="H · grow"
              onClick={onPickHydrogenGrow}
            />
          </div>

          {hybrids.length > 0 && (
            <div className="mt-2 border-t border-gray-200/80 pt-2">
              <div className="mb-1.5 flex items-center gap-1 text-[9px] font-medium text-gray-500">
                <GitBranch size={11} />
                成键杂化
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {hybrids.map(fragment => (
                  <BuildChoice
                    key={fragment.id}
                    active={activeFragmentId === fragment.id}
                    title={HYBRID_GROUP_LABEL[fragment.group ?? ''] ?? fragment.short}
                    subtitle="向外成键"
                    onClick={() => onPickFragment(fragment.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="border-t border-gray-100 pt-3">
        <SectionTitle label="完整周期表" detail="点击切换元素" />
        <div className="overflow-hidden rounded-md border border-gray-200 bg-gray-50 p-1.5">
          <div className="grid grid-cols-[repeat(18,minmax(0,1fr))] gap-px">
            {PERIODIC_TABLE_LAYOUT.flatMap((row, rowIndex) =>
              row.map((symbol, colIndex) => {
                if (!symbol || symbol === '*') {
                  return <span key={`${rowIndex}-${colIndex}`} className="aspect-square min-w-0" />
                }
                const element = getElementConfig(symbol)
                const configured = element.atomicNumber !== 0
                const elementColor = toElementHex(element.color)
                const inspected = inspectedElement === symbol
                return (
                  <button
                    key={`${symbol}-${rowIndex}-${colIndex}`}
                    type="button"
                    title={configured ? `${symbol} · ${element.name}` : symbol}
                    aria-label={configured ? `${symbol} ${element.name}` : symbol}
                    aria-pressed={inspected}
                    onClick={() => onInspectElement(symbol)}
                    className={cn(
                      'flex aspect-square min-w-0 items-center justify-center rounded-[3px] border bg-white text-[8px] font-semibold leading-none transition-colors hover:z-10 hover:border-gray-500 hover:bg-white',
                      inspected && 'z-10 border-gray-900 bg-white shadow-[0_0_0_1px_#111827]',
                    )}
                    style={{
                      color: configured ? elementColor : '#9ca3af',
                      borderColor: inspected ? undefined : configured ? `${elementColor}35` : '#e5e7eb',
                      backgroundColor: inspected ? undefined : configured ? `${elementColor}0d` : '#f9fafb',
                    }}
                  >
                    {symbol}
                  </button>
                )
              }),
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

function SectionTitle({ index, label, detail }: { index?: string; label: string; detail?: string }) {
  return (
    <div className="mb-1.5 flex h-5 items-center justify-between gap-2">
      <div className="flex items-center gap-1.5 text-[10px] font-semibold text-gray-700">
        {index && <span className="flex h-4 w-4 items-center justify-center rounded bg-gray-900 text-[9px] text-white">{index}</span>}
        {label}
      </div>
      {detail && <span className="truncate text-[9px] text-gray-400">{detail}</span>}
    </div>
  )
}

function ElementGrid({ symbols, inspectedElement, onInspectElement }: { symbols: readonly string[]; inspectedElement: string; onInspectElement: (symbol: string) => void }) {
  return (
    <div className="grid grid-cols-10 gap-1">
      {symbols.map(symbol => {
        const config = getElementConfig(symbol)
        const color = toElementHex(config.color)
        const inspected = inspectedElement === symbol
        return (
          <button
            key={symbol}
            type="button"
            title={`${symbol} · ${config.name}`}
            aria-pressed={inspected}
            onClick={() => onInspectElement(symbol)}
            className={cn(
              'flex h-8 items-center justify-center rounded-md border bg-white text-[11px] font-bold transition-colors hover:border-gray-400 hover:bg-gray-50',
              inspected && 'border-gray-900 shadow-[0_0_0_1px_#111827]',
            )}
            style={{ color, borderColor: inspected ? undefined : `${color}4d`, backgroundColor: inspected ? `${color}18` : undefined }}
          >
            {symbol}
          </button>
        )
      })}
    </div>
  )
}

function BuildChoice({ icon, active, title, subtitle, onClick }: { icon?: React.ReactNode; active: boolean; title: string; subtitle: string; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'flex h-11 min-w-0 items-center gap-2 rounded-md border px-2 text-left transition-colors',
        active ? 'border-gray-900 bg-gray-900 text-white shadow-sm' : 'border-gray-200 bg-white text-gray-700 hover:border-gray-400',
      )}
    >
      {icon && <span className={cn('shrink-0', active ? 'text-white' : 'text-gray-400')}>{icon}</span>}
      <span className="min-w-0">
        <span className="block truncate text-[10px] font-semibold">{title}</span>
        <span className={cn('block truncate text-[8px]', active ? 'text-white/60' : 'text-gray-400')}>{subtitle}</span>
      </span>
    </button>
  )
}
