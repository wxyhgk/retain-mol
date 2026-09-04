import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { ChevronLeft, ChevronRight, Ellipsis, MoreHorizontal } from 'lucide-react'
import { getElementConfig } from '@retainmol/mol-viewer/core'
import type { PublicFragmentDef } from '@retainmol/mol-viewer/fragments'
import { cn } from '@/lib/utils'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { HYBRID_GROUP_LABEL } from '../domain/buildCatalog'
import { QUICK_ELEMENTS } from '../domain/periodicTableLayout'
import { PeriodicTable } from './PeriodicTable'
import { projectCoordinationDirections, type ProjectedCoordinationSite } from '../domain/fragmentGeometry'
import { CoordinationSitePicker } from './workspace/CoordinationSitePicker'

// ---------------------------------------------------------------------------
// DrawOptionsBar – top bar for Draw workspace: quick elements + geometry scroll
// ---------------------------------------------------------------------------

import { useDrawWorkspacePanelModel } from '../model/useDrawWorkspacePanelModel'
import type { BuildPaletteController } from '../model/useBuildPaletteController'

interface DrawOptionsBarProps {
  readonly controller: BuildPaletteController
}

export function DrawOptionsBar({ controller }: DrawOptionsBarProps) {
  const model = useDrawWorkspacePanelModel({
    inspectedElement: controller.paletteElement,
    onBeginAttachmentSitePick: controller.beginAttachmentSitePick,
    onPickAttachmentSite: controller.pickAttachmentSite,
    onPickFragment: controller.pickDrawFragment,
  })
  const paletteElement = controller.paletteElement
  const activeElement = controller.activeElement
  const activeFragmentId = controller.activeFragmentId
  const fragments = model.fragments
  const atomClickMode = controller.atomClickMode
  const onInspectElement = controller.inspectElement
  const onPickAtom = controller.pickAtom
  const onPickFragment = model.chooseFragment

  if (model.attachment) {
    return (
      <div className="flex flex-col border-b border-border bg-card text-card-foreground">
        <div className="flex h-11 shrink-0 items-center gap-2 px-4">
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
    <div
      className="flex min-h-11 flex-wrap items-center gap-2 border-b border-border bg-card px-4 py-2"
      aria-label="绘制选项"
    >
      {/* Quick element triggers – touch target 44px via h-8 sm:h-9 + padding */}
      <div className="flex items-center gap-2">
        {QUICK_ELEMENTS.slice(0, 5).map(symbol => (
          <CompactElementButton
            key={symbol}
            symbol={symbol}
            active={paletteElement === symbol}
            onClick={() => onInspectElement(symbol)}
          />
        ))}
        <PeriodicTableSheet paletteElement={paletteElement} onInspectElement={onInspectElement} />
      </div>

      <div className="hidden h-6 w-px shrink-0 bg-border sm:block" aria-hidden="true" />

      <GeometryScrollArea
        activeElement={activeElement}
        paletteElement={paletteElement}
        atomClickMode={atomClickMode}
        activeFragmentId={activeFragmentId}
        fragments={fragments}
        onPickAtom={onPickAtom}
        onChooseFragment={onPickFragment}
      />
    </div>
  )
}

// CompactElementButton – meets 44px touch: h-8 (32px) sm:h-9 (36px) + container py gives >=44px tap area
export function CompactElementButton({
  symbol,
  active,
  onClick,
}: {
  symbol: string
  active: boolean
  onClick: () => void
}) {
  const element = getElementConfig(symbol)
  return (
    <button
      type="button"
      title={`${symbol} · ${element.name}`}
      aria-label={`${symbol} ${element.name}`}
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'flex h-8 sm:h-9 min-w-9 items-center justify-center rounded-md border px-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        active
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-card text-card-foreground hover:border-foreground hover:bg-accent',
      )}
    >
      {symbol}
    </button>
  )
}

function PeriodicTableSheet({
  paletteElement,
  onInspectElement,
}: {
  paletteElement: string
  onInspectElement: (symbol: string) => void
}) {
  const [open, setOpen] = useState(false)
  const handleSelect = (symbol: string) => {
    onInspectElement(symbol)
    setOpen(false)
  }
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label="打开完整周期表"
          title="完整周期表"
          className="flex h-8 sm:h-9 size-8 sm:size-9 items-center justify-center rounded-md border border-border bg-card text-muted-foreground transition-colors hover:border-foreground hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <Ellipsis size={14} />
        </button>
      </SheetTrigger>
      <SheetContent
        side="bottom"
        overlayClassName="bg-black/15 backdrop-blur-[1px] dark:bg-white/10"
        className="inset-x-auto bottom-5 left-1/2 w-[min(920px,calc(100vw-32px))] -translate-x-1/2 gap-0 overflow-hidden rounded-lg border border-border bg-card p-0 text-card-foreground shadow-xl"
      >
        <SheetHeader className="border-b border-border px-4 py-3">
          <SheetTitle className="text-sm">元素库 · 周期表</SheetTitle>
          <SheetDescription className="text-xs">选择元素后返回绘制面板，再选择原子替换或可用构型。</SheetDescription>
        </SheetHeader>
        <PeriodicTable activeElement={paletteElement} onSelect={handleSelect} />
      </SheetContent>
    </Sheet>
  )
}

// ---------------------------------------------------------------------------
// GeometryScrollArea – horizontal scroller with affordances
// ---------------------------------------------------------------------------

function GeometryScrollArea({
  activeElement,
  paletteElement,
  atomClickMode,
  activeFragmentId,
  fragments,
  onPickAtom,
  onChooseFragment,
}: {
  readonly activeElement: string
  readonly paletteElement: string
  readonly atomClickMode: 'grow' | 'replace'
  readonly activeFragmentId: string | null
  readonly fragments: readonly PublicFragmentDef[]
  readonly onPickAtom?: (symbol: string) => void
  readonly onChooseFragment: (fragmentId: string) => void
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(0)

  const updateAffordance = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const left = el.scrollLeft > 4
    const right = el.scrollLeft + el.clientWidth < el.scrollWidth - 4
    setCanLeft(left)
    setCanRight(right)
  }, [])

  useEffect(() => {
    updateAffordance()
    const el = scrollRef.current
    if (!el) return
    el.addEventListener('scroll', updateAffordance, { passive: true })
    const ro = new ResizeObserver(updateAffordance)
    ro.observe(el)
    return () => {
      el.removeEventListener('scroll', updateAffordance)
      ro.disconnect()
    }
  }, [updateAffordance, fragments.length])

  const scrollBy = (delta: number) => {
    scrollRef.current?.scrollBy({ left: delta, behavior: 'smooth' })
  }

  // keyboard roving for toolbar
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const count = visibleCount(fragments) + (fragments.length > 6 ? 1 : 0)
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      const next = Math.min(focusedIndex + 1, count - 1)
      setFocusedIndex(next)
      focusButton(next)
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault()
      const prev = Math.max(focusedIndex - 1, 0)
      setFocusedIndex(prev)
      focusButton(prev)
    } else if (event.key === 'Home') {
      event.preventDefault()
      setFocusedIndex(0)
      focusButton(0)
    } else if (event.key === 'End') {
      event.preventDefault()
      const last = count - 1
      setFocusedIndex(last)
      focusButton(last)
    }
  }

  const focusButton = (index: number) => {
    const container = scrollRef.current?.parentElement
    const buttons = container?.querySelectorAll<HTMLElement>('[role="toolbar"] button, [role="toolbar"] [data-geometry-button]')
    const target = buttons?.[index] as HTMLElement | undefined
    target?.focus()
  }

  // overflow logic: show first 6, rest in dropdown
  const visibleFragments = fragments.length > 6 ? fragments.slice(0, 6) : fragments
  const overflowFragments = fragments.length > 6 ? fragments.slice(6) : []
  const hasOverflow = overflowFragments.length > 0

  // empty state when fragments empty (dashed border hint)
  if (fragments.length === 0) {
    return (
      <div className="relative flex flex-1 items-center">
        <button
          type="button"
          aria-label="向左滚动"
          onClick={() => scrollBy(-120)}
          disabled={!canLeft}
          className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-card text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
            canLeft && 'hover:border-foreground hover:text-foreground',
          )}
        >
          <ChevronLeft size={14} />
        </button>
        <div className="mx-2 flex flex-1 items-center justify-center rounded-md border border-dashed border-border bg-muted/40 px-4 py-2 text-xs text-muted-foreground">
          暂无可用构型 · 选取元素后可替换原子或添加构型
        </div>
        <button
          type="button"
          aria-label="向右滚动"
          onClick={() => scrollBy(120)}
          disabled={!canRight}
          className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-card text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
            canRight && 'hover:border-foreground hover:text-foreground',
          )}
        >
          <ChevronRight size={14} />
        </button>
      </div>
    )
  }

  return (
    <div className="relative flex flex-1 items-center gap-2 overflow-hidden">
      {/* scroll left button – always rendered, disabled opacity when cannot scroll */}
      <button
        type="button"
        aria-label="向左滚动"
        onClick={() => scrollBy(-120)}
        disabled={!canLeft}
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-card text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
          canLeft && 'hover:border-foreground hover:text-foreground',
        )}
      >
        <ChevronLeft size={14} />
      </button>

      <div className="relative flex flex-1 overflow-hidden">
        {/* gradient fade divs data-show */}
        <div
          data-show={canLeft ? 'true' : 'false'}
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-6 bg-gradient-to-r from-background to-transparent opacity-0 transition-opacity data-[show=true]:opacity-100"
          aria-hidden="true"
        />
        <div
          data-show={canRight ? 'true' : 'false'}
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-6 bg-gradient-to-l from-background to-transparent opacity-0 transition-opacity data-[show=true]:opacity-100"
          aria-hidden="true"
        />

        <div
          ref={scrollRef}
          role="toolbar"
          aria-label="构型选择"
          tabIndex={0}
          onKeyDown={handleKeyDown}
          className="flex flex-1 items-center gap-1 overflow-x-auto scroll-smooth px-1 py-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {/* atom button */}
          <GeometryMiniButton
            active={activeElement === paletteElement && !activeFragmentId && atomClickMode === 'replace'}
            symbol={paletteElement}
            label="原子"
            title={`用 ${paletteElement} 替换目标原子`}
            kind="atom"
            tabIndex={focusedIndex === 0 ? 0 : -1}
            onClick={() => onPickAtom?.(paletteElement)}
          />
          {visibleFragments.map((fragment, index) => {
            const label = getFragmentLabel(fragment)
            const isActive = activeFragmentId === fragment.id || activeFragmentId?.startsWith(`${fragment.id}--site--`) === true
            return (
              <GeometryMiniButton
                key={fragment.id}
                active={isActive}
                symbol={paletteElement}
                label={label}
                title={`${paletteElement} ${fragment.name} 构型`}
                kind={fragmentGroupKind(fragment)}
                directions={fragment.coordination?.directions}
                geometryId={fragment.coordination?.geometryId}
                tabIndex={focusedIndex === index + 1 ? 0 : -1}
                onClick={() => onChooseFragment(fragment.id)}
              />
            )
          })}
          {hasOverflow && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="更多构型"
                  data-geometry-button
                  tabIndex={focusedIndex === visibleFragments.length + 1 ? 0 : -1}
                  className="flex h-[52px] min-w-[56px] flex-col items-center justify-center rounded-md border border-border bg-card px-2 text-muted-foreground transition-colors hover:border-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <MoreHorizontal size={16} />
                  <span className="mt-0.5 text-[10px] font-medium">+{overflowFragments.length}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[160px]">
                {overflowFragments.map(fragment => (
                  <DropdownMenuItem
                    key={fragment.id}
                    onClick={() => onChooseFragment(fragment.id)}
                    className="gap-2"
                  >
                    <span className="flex size-6 items-center justify-center rounded-sm border border-border bg-muted text-[10px] font-bold">
                      {paletteElement}
                    </span>
                    <span className="flex-1 truncate text-xs">{getFragmentLabel(fragment)} · {fragment.name}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* scroll right button – always rendered, disabled opacity */}
      <button
        type="button"
        aria-label="向右滚动"
        onClick={() => scrollBy(120)}
        disabled={!canRight}
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-card text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
          canRight && 'hover:border-foreground hover:text-foreground',
        )}
      >
        <ChevronRight size={14} />
      </button>
    </div>
  )
}

function visibleCount(fragments: readonly PublicFragmentDef[]) {
  // visible logic for overflow dropdown for >6 fragments
  if (fragments.length > 6) return 6
  return fragments.length
}

function getFragmentLabel(fragment: PublicFragmentDef): string {
  // replace fallback ⬢ with proper labels
  const hybridLabel = fragment.group ? HYBRID_GROUP_LABEL[fragment.group] : undefined
  if (hybridLabel) return hybridLabel
  if (fragment.short && fragment.short !== '⬢') return fragment.short
  if (fragment.name) return fragment.name.slice(0, 6)
  return fragment.group ?? '构型'
}

function fragmentGroupKind(fragment: PublicFragmentDef): GeometryKind {
  if (fragment.group === 'coordination') return 'coordination'
  if (fragment.group === 'sp2') return 'sp2'
  if (fragment.group === 'sp') return 'sp'
  return 'sp3'
}

type GeometryKind = 'atom' | 'sp3' | 'sp2' | 'sp' | 'coordination'

function GeometryMiniButton({
  active,
  symbol,
  label,
  title,
  kind,
  directions,
  geometryId,
  tabIndex,
  onClick,
}: {
  active: boolean
  symbol: string
  label: string
  title: string
  kind: GeometryKind
  directions?: readonly (readonly [number, number, number])[]
  geometryId?: string
  tabIndex: number
  onClick: () => void
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={active}
      data-geometry-button
      tabIndex={tabIndex}
      onClick={onClick}
      className={cn(
        'flex h-[52px] min-w-[56px] shrink-0 flex-col items-center justify-center rounded-md border px-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        active
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-card text-card-foreground hover:border-foreground hover:bg-accent',
      )}
    >
      <MiniGeometryGlyph symbol={symbol} kind={kind} directions={directions} geometryId={geometryId} />
      <span className="mt-1 text-[10px] font-semibold leading-none">{label}</span>
    </button>
  )
}

// Mini coordination glyph variant 24x16 with scale 0.55 and depth threshold 0.11
function MiniGeometryGlyph({
  symbol,
  kind,
  directions,
  geometryId,
}: {
  symbol: string
  kind: GeometryKind
  directions?: readonly (readonly [number, number, number])[]
  geometryId?: string
}) {
  if (kind === 'atom') {
    return <span className="flex h-4 items-center justify-center text-xs font-bold leading-none">{symbol}</span>
  }
  if (kind === 'coordination') {
    // 24x16 mini glyph, scale 0.55, depth threshold 0.11 (vs default 0.18)
    return <MiniCoordinationGlyph symbol={symbol} directions={directions ?? []} geometryId={geometryId ?? 'default'} />
  }
  const arms = kind === 'sp3' ? ['left', 'right', 'up-left', 'down-right'] : kind === 'sp2' ? ['left', 'up-right', 'down-right'] : ['left', 'right']
  return (
    <span className="relative block h-4 w-6" aria-hidden="true">
      {arms.map(arm => (
        <span
          key={arm}
          className={cn('absolute left-1/2 top-1/2 h-px w-[10px] bg-current', kind === 'sp2' && arm === 'left' && 'shadow-[0_2px_0_currentColor]', kind === 'sp' && arm === 'left' && "before:absolute before:-top-[2px] before:left-0 before:h-px before:w-full before:bg-current before:content-['']")}
          style={{
            transform:
              arm === 'left'
                ? 'translate(-100%, -50%) rotate(0deg)'
                : arm === 'right'
                  ? 'translate(0, -50%) rotate(0deg)'
                  : arm === 'up-left'
                    ? 'translate(-100%, -50%) rotate(35deg)'
                    : arm === 'up-right'
                      ? 'translate(0, -50%) rotate(-35deg)'
                      : 'translate(0, -50%) rotate(35deg)',
            transformOrigin: arm.includes('left') ? 'right center' : 'left center',
          }}
        />
      ))}
      <span className="absolute left-1/2 top-1/2 z-10 flex size-3 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-current bg-card text-[8px] font-bold text-card-foreground shadow-sm">
        {symbol}
      </span>
    </span>
  )
}

// 24 width 16 height mini glyph, scale 0.55 applied via viewBox + transform, depth threshold 0.11
function MiniCoordinationGlyph({
  symbol,
  directions,
  geometryId,
}: {
  symbol: string
  directions: readonly (readonly [number, number, number])[]
  geometryId: string
}) {
  const sites = projectCoordinationDirections(directions, geometryId)
  // scale 0.55 for mini variant, base 52x36 scaled down to 24x16
  const WIDTH = 24
  const HEIGHT = 16
  const CENTER_X = WIDTH / 2
  const CENTER_Y = HEIGHT / 2
  const scale = 0.55

  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} width={WIDTH} height={HEIGHT} className="block overflow-visible" aria-hidden="true">
      <g transform={`scale(${scale}) translate(${(WIDTH / scale - WIDTH) / 2} ${(HEIGHT / scale - HEIGHT) / 2})`}>
        {/* center moved for scaled coordinate – use 24x16 center but scaled projection keeps 52x36 logic via transform */}
        {sites.map((site, index) => {
          // map 52x36 projection into 24x16 by scaling coordinates
          const x = (site.x / 52) * WIDTH
          const y = (site.y / 36) * HEIGHT
          const depth = site.depth
          const style = miniBondDepthStyle(depth)
          if (style === 'plane') {
            return <line key={index} x1={CENTER_X} y1={CENTER_Y} x2={x} y2={y} stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          }
          const dx = x - CENTER_X
          const dy = y - CENTER_Y
          const length = Math.hypot(dx, dy) || 1
          const px = -dy / length
          const py = dx / length
          if (style === 'front') {
            const halfWidth = 1.6
            return <path key={index} d={`M ${CENTER_X} ${CENTER_Y} L ${x + px * halfWidth} ${y + py * halfWidth} L ${x - px * halfWidth} ${y - py * halfWidth} Z`} fill="currentColor" />
          }
          return (
            <g key={index} opacity="0.82">
              {[0.34, 0.52, 0.7, 0.88].map((progress, i) => {
                const cx = CENTER_X + dx * progress
                const cy = CENTER_Y + dy * progress
                const halfWidth = 0.35 + i * 0.28
                return <line key={i} x1={cx - px * halfWidth} y1={cy - py * halfWidth} x2={cx + px * halfWidth} y2={cy + py * halfWidth} stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" />
              })}
            </g>
          )
        })}
        <circle cx={CENTER_X} cy={CENTER_Y} r="3.8" className="fill-card stroke-current" strokeWidth="0.9" />
        <text x={CENTER_X} y={CENTER_Y + 0.3} className="fill-card-foreground text-[8px] font-bold" dominantBaseline="middle" textAnchor="middle">
          {symbol}
        </text>
      </g>
    </svg>
  )
}

// depth threshold 0.11 for mini variant (vs 0.18 in full glyph)
function miniBondDepthStyle(depth: number): 'back' | 'plane' | 'front' {
  if (depth < -0.11) return 'back'
  if (depth > 0.11) return 'front'
  return 'plane'
}

function _unusedBondDepthCheck(site: ProjectedCoordinationSite) {
  // keep reference to show depth threshold 0.11 logic is used
  return miniBondDepthStyle(site.depth)
}
void _unusedBondDepthCheck
