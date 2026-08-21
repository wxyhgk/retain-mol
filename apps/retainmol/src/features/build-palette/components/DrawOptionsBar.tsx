import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Ellipsis } from 'lucide-react'
import { getElementConfig } from '@retainmol/mol-viewer/core'
import type { PublicFragmentDef } from '@retainmol/mol-viewer/fragments'
import { cn } from '@/lib/utils'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { HYBRID_GROUP_LABEL } from '../domain/buildCatalog'
import type { BuildPaletteController } from '../model/useBuildPaletteController'
import { useDrawWorkspacePanelModel } from '../model/useDrawWorkspacePanelModel'
import { CoordinationSitePicker } from './workspace/CoordinationSitePicker'
import { CoordinationGeometryGlyph } from './workspace/CoordinationSitePicker/Glyph'

const QUICK_ELEMENTS = ['C', 'H', 'O', 'N', 'B', 'F', 'Cl', 'Br', 'I', 'S'] as const

const FULL_PERIODIC_TABLE_LAYOUT = [
  ['H', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'He'],
  ['Li', 'Be', '', '', '', '', '', '', '', '', '', '', 'B', 'C', 'N', 'O', 'F', 'Ne'],
  ['Na', 'Mg', '', '', '', '', '', '', '', '', '', '', 'Al', 'Si', 'P', 'S', 'Cl', 'Ar'],
  ['K', 'Ca', 'Sc', 'Ti', 'V', 'Cr', 'Mn', 'Fe', 'Co', 'Ni', 'Cu', 'Zn', 'Ga', 'Ge', 'As', 'Se', 'Br', 'Kr'],
  ['Rb', 'Sr', 'Y', 'Zr', 'Nb', 'Mo', 'Tc', 'Ru', 'Rh', 'Pd', 'Ag', 'Cd', 'In', 'Sn', 'Sb', 'Te', 'I', 'Xe'],
  ['Cs', 'Ba', '*', 'Hf', 'Ta', 'W', 'Re', 'Os', 'Ir', 'Pt', 'Au', 'Hg', 'Tl', 'Pb', 'Bi', 'Po', 'At', 'Rn'],
  ['Fr', 'Ra', '*', 'Rf', 'Db', 'Sg', 'Bh', 'Hs', 'Mt', 'Ds', 'Rg', 'Cn', 'Nh', 'Fl', 'Mc', 'Lv', 'Ts', 'Og'],
  ['', '', 'La', 'Ce', 'Pr', 'Nd', 'Pm', 'Sm', 'Eu', 'Gd', 'Tb', 'Dy', 'Ho', 'Er', 'Tm', 'Yb', 'Lu', ''],
  ['', '', 'Ac', 'Th', 'Pa', 'U', 'Np', 'Pu', 'Am', 'Cm', 'Bk', 'Cf', 'Es', 'Fm', 'Md', 'No', 'Lr', ''],
] as const

function CompactElementButton({ symbol, active, onClick }: { symbol: string; active: boolean; onClick: () => void }) {
  const element = getElementConfig(symbol)
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      title={`${symbol} · ${element.name}`}
      className={cn(
        'flex h-7 min-w-7 items-center justify-center rounded-md border px-1.5 text-[11px] font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        active ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-foreground hover:bg-accent',
      )}
    >
      {symbol}
    </button>
  )
}

function PeriodicTableSheet({ activeElement, onSelect }: { activeElement: string; onSelect: (symbol: string) => void }) {
  const [open, setOpen] = useState(false)
  const handleSelect = (symbol: string) => {
    onSelect(symbol)
    setOpen(false)
  }
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label="打开完整周期表"
          title="完整周期表"
          className="flex size-7 items-center justify-center rounded-md border border-border bg-card text-muted-foreground hover:border-foreground hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <Ellipsis size={15} />
        </button>
      </SheetTrigger>
      <SheetContent
        side="bottom"
        overlayClassName="bg-black/15 backdrop-blur-[1px] dark:bg-white/10"
        className="inset-x-auto bottom-5 left-1/2 w-[min(920px,calc(100vw-32px))] -translate-x-1/2 gap-0 overflow-hidden rounded-lg border border-border bg-card p-0 text-card-foreground shadow-[0_18px_50px_rgba(0,0,0,0.22)]"
      >
        <SheetHeader className="border-b border-border px-4 py-3">
          <SheetTitle className="text-sm">元素库 · 周期表</SheetTitle>
          <SheetDescription className="text-[10px]">选择元素后返回绘制面板，再选择原子替换或可用构型。</SheetDescription>
        </SheetHeader>
        <div className="overflow-x-auto px-4 py-4">
          <div className="mx-auto grid min-w-[680px] max-w-[860px] grid-cols-[repeat(18,minmax(0,1fr))] gap-1">
            {FULL_PERIODIC_TABLE_LAYOUT.flatMap((row, rowIndex) => row.map((symbol, colIndex) => {
              if (!symbol || symbol === '*') return <span key={`${rowIndex}-${colIndex}`} className="h-10 min-w-0" />
              const element = getElementConfig(symbol)
              const configured = element.atomicNumber !== 0
              const isActive = activeElement === symbol
              return (
                <button
                  key={`${symbol}-${rowIndex}-${colIndex}`}
                  type="button"
                  title={configured ? `${symbol} · ${element.name}` : symbol}
                  aria-label={configured ? `${symbol} ${element.name}` : symbol}
                  aria-pressed={isActive}
                  onClick={() => handleSelect(symbol)}
                  className={cn(
                    'flex h-10 min-w-0 flex-col items-center justify-center rounded-[3px] border text-[10px] font-semibold leading-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                    isActive
                      ? 'z-10 border-primary bg-primary text-primary-foreground shadow-[0_0_0_1px_currentColor]'
                      : 'border-border bg-card text-card-foreground hover:z-10 hover:border-foreground hover:bg-accent',
                  )}
                >
                  <span>{symbol}</span>
                  <span className={cn('mt-0.5 max-w-full truncate text-[7px] font-normal', isActive ? 'text-primary-foreground/65' : 'text-muted-foreground')}>
                    {element.name}
                  </span>
                </button>
              )
            }))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export function DrawOptionsBar({ controller }: { controller: BuildPaletteController }) {
  const model = useDrawWorkspacePanelModel({
    inspectedElement: controller.paletteElement,
    onBeginAttachmentSitePick: controller.beginAttachmentSitePick,
    onPickAttachmentSite: controller.pickAttachmentSite,
    onPickFragment: controller.pickDrawFragment,
  })

  if (model.attachment) {
    return (
      <div className="flex flex-col border-b border-border bg-card text-card-foreground">
        <div className="flex h-11 shrink-0 items-center gap-2 px-3">
          <button
            type="button"
            onClick={model.closeAttachmentPicker}
            className="rounded-md px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            ← 返回绘制
          </button>
          <span className="text-xs text-muted-foreground">
            选择 {model.attachment.model.name} 的连接位点（{model.attachment.siteOptions.length} 个）
          </span>
        </div>
        <div className="h-[360px] border-t border-border">
          <CoordinationSitePicker
            model={model.attachment.model}
            siteOptions={model.attachment.siteOptions}
            selectedSiteId={model.selectedAttachmentSiteId}
            onSelect={model.chooseAttachmentSite}
            onBack={model.closeAttachmentPicker}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-11 shrink-0 items-center gap-3 overflow-hidden border-b border-border bg-card px-2 text-card-foreground">
      {/* 常用元素：横排 10 + 周期表入口 */}
      <div className="flex shrink-0 items-center gap-1">
        <span className="hidden text-[10px] font-semibold text-muted-foreground lg:inline">元素</span>
        <div className="flex items-center gap-1">
          {QUICK_ELEMENTS.map(symbol => (
            <CompactElementButton
              key={symbol}
              symbol={symbol}
              active={controller.paletteElement === symbol}
              onClick={() => controller.inspectElement(symbol)}
            />
          ))}
          <PeriodicTableSheet activeElement={controller.paletteElement} onSelect={controller.inspectElement} />
        </div>
        <span className="ml-1 hidden font-mono text-[10px] text-muted-foreground xl:inline">
          {model.element.name} · {controller.paletteElement}
        </span>
      </div>

      <div className="h-6 w-px shrink-0 bg-border" />

      {/* 构型：横向滚动 + 溢出收纳 */}
      <GeometryScrollArea controller={controller} fragments={model.fragments} onChoose={model.chooseFragment} />
    </div>
  )
}

function GeometryScrollArea({
  controller,
  fragments,
  onChoose,
}: {
  controller: BuildPaletteController
  fragments: readonly PublicFragmentDef[]
  onChoose: (id: string) => void
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(false)

  const update = () => {
    const el = scrollRef.current
    if (!el) return
    setCanLeft(el.scrollLeft > 2)
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2)
  }

  useEffect(() => {
    update()
    const el = scrollRef.current
    if (!el) return
    el.addEventListener('scroll', update, { passive: true })
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => {
      el.removeEventListener('scroll', update)
      ro.disconnect()
    }
  }, [fragments.length])

  const scroll = (dir: number) => scrollRef.current?.scrollBy({ left: dir * 140, behavior: 'smooth' })

  // 溢出收纳：超过 6 个构型时，后续进“更多”下拉，避免横向无限拉长
  const VISIBLE_COUNT = 6
  const visible = fragments.slice(0, VISIBLE_COUNT)
  const overflow = fragments.slice(VISIBLE_COUNT)

  return (
    <div className="flex min-w-0 flex-1 items-center gap-1">
      <span className="hidden shrink-0 text-[10px] font-semibold text-muted-foreground lg:inline">构型</span>

      {canLeft && (
        <button
          type="button"
          aria-label="向左滚动"
          onClick={() => scroll(-1)}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <ChevronLeft size={14} />
        </button>
      )}

      <div
        ref={scrollRef}
        className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <TooltipProvider delayDuration={300}>
          <button
            type="button"
            aria-pressed={controller.activeElement === controller.paletteElement && !controller.activeFragmentId && controller.atomClickMode === 'replace'}
            onClick={() => controller.pickAtom(controller.paletteElement)}
            className={cn(
              'flex h-7 shrink-0 items-center gap-1 rounded-md border px-2 text-[10px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              controller.activeElement === controller.paletteElement && !controller.activeFragmentId && controller.atomClickMode === 'replace'
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-card text-foreground hover:bg-accent',
            )}
          >
            <span className="flex size-4 items-center justify-center rounded-full border border-current text-[9px] font-bold">{controller.paletteElement}</span>
            原子
          </button>

          {controller.paletteElement === 'H' && (
            <button
              type="button"
              aria-pressed={controller.activeElement === 'H' && !controller.activeFragmentId && controller.atomClickMode === 'grow'}
              onClick={() => controller.pickHydrogenGrow()}
              className={cn(
                'flex h-7 shrink-0 items-center gap-1 rounded-md border px-2 text-[10px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                controller.activeElement === 'H' && !controller.activeFragmentId && controller.atomClickMode === 'grow'
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-card text-foreground hover:bg-accent',
              )}
            >
              H+
            </button>
          )}

          {visible.map(fragment => (
            <Tooltip key={fragment.id}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  aria-pressed={controller.activeFragmentId === fragment.id || controller.activeFragmentId?.startsWith(`${fragment.id}--site--`) === true}
                  onClick={() => onChoose(fragment.id)}
                  className={cn(
                    'flex h-7 shrink-0 items-center gap-1 rounded-md border px-2 text-[10px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                    controller.activeFragmentId === fragment.id || controller.activeFragmentId?.startsWith(`${fragment.id}--site--`) === true
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-card text-foreground hover:bg-accent',
                  )}
                >
                  <span className="flex h-4 w-6 items-center justify-center">
                    <MiniGlyph symbol={controller.paletteElement} fragment={fragment} />
                  </span>
                  {HYBRID_GROUP_LABEL[fragment.group ?? ''] ?? fragment.short}
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-48 text-xs">
                <div className="font-medium">{fragment.name}</div>
                <div className="text-[10px] text-muted-foreground">{controller.paletteElement} · {fragment.group ?? 'fragment'} {fragment.coordination?.geometryId ? `· ${fragment.coordination.geometryId}` : ''}</div>
              </TooltipContent>
            </Tooltip>
          ))}

          {overflow.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex h-7 shrink-0 items-center gap-1 rounded-md border border-input bg-background px-2 text-[10px] font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  更多·{overflow.length}
                  <ChevronRight size={12} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="bottom" align="end" className="max-h-64 w-56 overflow-y-auto">
                {overflow.map(fragment => (
                  <DropdownMenuItem
                    key={fragment.id}
                    onClick={() => onChoose(fragment.id)}
                    className={cn('gap-2 text-xs', (controller.activeFragmentId === fragment.id || controller.activeFragmentId?.startsWith(`${fragment.id}--site--`)) && 'bg-accent font-semibold')}
                  >
                    <span className="flex h-4 w-6 shrink-0 items-center justify-center">
                      <MiniGlyph symbol={controller.paletteElement} fragment={fragment} />
                    </span>
                    <span className="min-w-0 flex-1 truncate">{fragment.name}</span>
                    <span className="shrink-0 text-[10px] text-muted-foreground">{HYBRID_GROUP_LABEL[fragment.group ?? ''] ?? fragment.short}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </TooltipProvider>
      </div>

      {canRight && (
        <button
          type="button"
          aria-label="向右滚动"
          onClick={() => scroll(1)}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <ChevronRight size={14} />
        </button>
      )}
    </div>
  )
}

function MiniGlyph({ symbol, fragment }: { symbol: string; fragment: PublicFragmentDef }) {
  if (fragment.group === 'coordination') {
    return <CoordinationGeometryGlyph symbol={symbol} directions={fragment.coordination?.directions ?? []} geometryId={fragment.coordination?.geometryId ?? 'default'} />
  }
  if (fragment.group === 'sp3') return <span className="text-[9px] font-bold">⬢</span>
  if (fragment.group === 'sp2') return <span className="text-[9px] font-bold">⬣</span>
  if (fragment.group === 'sp') return <span className="text-[9px] font-bold">─</span>
  return <span className="text-[9px] font-bold">{symbol}</span>
}
