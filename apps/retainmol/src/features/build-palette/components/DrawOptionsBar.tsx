import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { PublicFragmentDef } from '@retainmol/mol-viewer/fragments'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { HYBRID_GROUP_LABEL } from '../domain/buildCatalog'
import { QUICK_ELEMENTS } from '../domain/periodicTableLayout'
import type { BuildPaletteController } from '../model/useBuildPaletteController'
import { useDrawWorkspacePanelModel } from '../model/useDrawWorkspacePanelModel'
import { CoordinationSitePicker } from './workspace/CoordinationSitePicker'
import { CoordinationGeometryGlyph } from './workspace/CoordinationSitePicker/Glyph'
import { CompactElementButton, PeriodicTableSheet } from './PeriodicTable'

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
            className="rounded-md px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
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
        <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => scroll(-1)}>
          <ChevronLeft size={14} />
        </Button>
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
              'flex h-7 shrink-0 items-center gap-1 rounded-md border px-2 text-[10px] font-medium transition-colors',
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
                'flex h-7 shrink-0 items-center gap-1 rounded-md border px-2 text-[10px] font-medium transition-colors',
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
                    'flex h-7 shrink-0 items-center gap-1 rounded-md border px-2 text-[10px] font-medium transition-colors',
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
                <Button variant="outline" size="sm" className="h-7 shrink-0 gap-1 px-2 text-[10px]">
                  更多·{overflow.length}
                  <ChevronRight size={12} />
                </Button>
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
        <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => scroll(1)}>
          <ChevronRight size={14} />
        </Button>
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
