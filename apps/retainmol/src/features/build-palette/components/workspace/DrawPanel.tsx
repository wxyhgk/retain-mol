import { useState } from 'react'
import { Ellipsis, Link2, MousePointer2, Trash2 } from 'lucide-react'
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
import { HYBRID_GROUP_LABEL } from '../../domain/buildCatalog'
import type { BuildPaletteController } from '../../model/useBuildPaletteController'
import { useDrawWorkspacePanelModel } from '../../model/useDrawWorkspacePanelModel'
import { CoordinationSitePicker } from './CoordinationSitePicker'
import { CoordinationGeometryGlyph } from './CoordinationSitePicker/Glyph'
import { WorkspaceSection } from './WorkspacePanelUi'

export function DrawPanel({ controller }: { controller: BuildPaletteController }) {
  const model = useDrawWorkspacePanelModel({
    inspectedElement: controller.paletteElement,
    onBeginAttachmentSitePick: controller.beginAttachmentSitePick,
    onPickAttachmentSite: controller.pickAttachmentSite,
    onPickFragment: controller.pickDrawFragment,
  })

  if (model.attachment) {
    return (
      <CoordinationSitePicker
        model={model.attachment.model}
        siteOptions={model.attachment.siteOptions}
        selectedSiteId={model.selectedAttachmentSiteId}
        onSelect={model.chooseAttachmentSite}
        onBack={model.closeAttachmentPicker}
      />
    )
  }

  return (
    <div className="h-full space-y-3 overflow-y-auto [scrollbar-color:currentColor_transparent] [scrollbar-width:thin]">
      <ElementPickerSection
        inspectedElement={controller.paletteElement}
        elementName={model.element.name}
        onInspectElement={controller.inspectElement}
      />

      <ElementGeometrySection
        activeElement={controller.activeElement}
        atomClickMode={controller.atomClickMode}
        inspectedElement={controller.paletteElement}
        elementName={model.element.name}
        activeFragmentId={controller.activeFragmentId}
        fragments={model.fragments}
        onPickAtom={controller.pickAtom}
        onPickHydrogenGrow={controller.pickHydrogenGrow}
        onChooseFragment={model.chooseFragment}
      />

      <section aria-label="键编辑" className="border-t border-border pt-3">
        <BondSection
          selectedAtomCount={controller.selectedAtomCount}
          selectedBond={controller.selectedBond}
          onConnectSelectedAtoms={controller.connectSelectedAtoms}
          onSetBondOrder={controller.setSelectedBondOrder}
          onDeleteSelectedBond={controller.deleteSelectedBond}
        />
      </section>
    </div>
  )
}

// Private subcomponent: ElementPickerSection (formerly components/workspace/ElementPickerSection.tsx)

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

function ElementPickerSection({
  inspectedElement,
  elementName,
  onInspectElement,
}: {
  readonly inspectedElement: string
  readonly elementName: string
  readonly onInspectElement: (symbol: string) => void
}) {
  const [libraryOpen, setLibraryOpen] = useState(false)
  const inspectFromLibrary = (symbol: string) => {
    onInspectElement(symbol)
    setLibraryOpen(false)
  }

  return (
    <section aria-label="常用元素">
      <div className="mb-2 flex items-center gap-2">
        <h3 className="text-[10px] font-semibold text-foreground">常用元素</h3>
        <span className="ml-auto font-mono text-[9px] text-muted-foreground">{elementName} · {inspectedElement}</span>
        <Sheet open={libraryOpen} onOpenChange={setLibraryOpen}>
          <SheetTrigger asChild>
            <button
              type="button"
              aria-label="打开完整周期表"
              title="完整周期表"
              className="flex size-7 items-center justify-center rounded-md border border-border bg-card text-muted-foreground hover:border-foreground hover:bg-accent hover:text-foreground"
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
            <PeriodicTable activeElement={inspectedElement} onSelect={inspectFromLibrary} />
          </SheetContent>
        </Sheet>
      </div>
      <div className="grid grid-cols-5 gap-1.5">
        {QUICK_ELEMENTS.map(symbol => (
          <QuickElementButton
            key={symbol}
            symbol={symbol}
            active={inspectedElement === symbol}
            onClick={() => onInspectElement(symbol)}
          />
        ))}
      </div>
    </section>
  )
}

function PeriodicTable({ activeElement, onSelect }: { activeElement: string; onSelect: (symbol: string) => void }) {
  return (
    <div className="overflow-x-auto px-4 py-4">
      <div className="mx-auto grid min-w-[680px] max-w-[860px] grid-cols-[repeat(18,minmax(0,1fr))] gap-1">
        {FULL_PERIODIC_TABLE_LAYOUT.flatMap((row, rowIndex) => row.map((symbol, colIndex) => {
          if (!symbol || symbol === '*') return <span key={`${rowIndex}-${colIndex}`} className="h-10 min-w-0" />
          return (
            <ElementButton
              key={`${symbol}-${rowIndex}-${colIndex}`}
              symbol={symbol}
              active={activeElement === symbol}
              onClick={() => onSelect(symbol)}
            />
          )
        }))}
      </div>
    </div>
  )
}

function ElementButton({ symbol, active, onClick }: { symbol: string; active: boolean; onClick: () => void }) {
  const element = getElementConfig(symbol)
  const configured = element.atomicNumber !== 0
  return (
    <button
      type="button"
      title={configured ? `${symbol} · ${element.name}` : symbol}
      aria-label={configured ? `${symbol} ${element.name}` : symbol}
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'flex h-10 min-w-0 flex-col items-center justify-center rounded-[3px] border text-[10px] font-semibold leading-none transition-colors',
        active
          ? 'z-10 border-primary bg-primary text-primary-foreground shadow-[0_0_0_1px_currentColor]'
          : 'border-border bg-card text-card-foreground hover:z-10 hover:border-foreground hover:bg-accent',
      )}
    >
      <span>{symbol}</span>
      <span className={cn('mt-0.5 max-w-full truncate text-[7px] font-normal', active ? 'text-primary-foreground/65' : 'text-muted-foreground')}>
        {element.name}
      </span>
    </button>
  )
}

function QuickElementButton({ symbol, active, onClick }: { symbol: string; active: boolean; onClick: () => void }) {
  const element = getElementConfig(symbol)
  return (
    <button
      type="button"
      title={`${symbol} · ${element.name}`}
      aria-label={`${symbol} ${element.name}`}
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'flex h-12 min-w-0 flex-col items-center justify-center rounded-md border transition-colors',
        active
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-card text-card-foreground hover:border-foreground hover:bg-accent',
      )}
    >
      <span className="text-[12px] font-bold leading-none">{symbol}</span>
      <span className={cn('mt-1 text-[8px]', active ? 'text-primary-foreground/65' : 'text-muted-foreground')}>{element.name}</span>
    </button>
  )
}

// Private subcomponent: ElementGeometrySection (formerly components/workspace/ElementGeometrySection.tsx)

function ElementGeometrySection({
  activeElement,
  atomClickMode,
  inspectedElement,
  elementName,
  activeFragmentId,
  fragments,
  onPickAtom,
  onPickHydrogenGrow,
  onChooseFragment,
}: {
  readonly activeElement: string
  readonly atomClickMode: 'grow' | 'replace'
  readonly inspectedElement: string
  readonly elementName: string
  readonly activeFragmentId: string | null
  readonly fragments: readonly PublicFragmentDef[]
  readonly onPickAtom: (symbol: string) => void
  readonly onPickHydrogenGrow: () => void
  readonly onChooseFragment: (fragmentId: string) => void
}) {
  return (
    <section aria-label={`${elementName}构型`} className="border-t border-border pt-3">
      <SectionHeading
        title={`选择 ${elementName} 构型`}
        meta={`${fragments.length + (inspectedElement === 'H' ? 2 : 1)} 项`}
      />
      <div className="grid grid-cols-4 gap-1.5">
        <GeometryButton
          active={activeElement === inspectedElement && !activeFragmentId && atomClickMode === 'replace'}
          symbol={inspectedElement}
          kind="atom"
          label="原子"
          title={`用 ${inspectedElement} 替换目标原子`}
          onClick={() => onPickAtom(inspectedElement)}
        />

        {inspectedElement === 'H' && (
          <GeometryButton
            active={activeElement === 'H' && !activeFragmentId && atomClickMode === 'grow'}
            symbol="H"
            kind="grow"
            label="加 H"
            title="从目标原子向外增加氢"
            onClick={onPickHydrogenGrow}
          />
        )}

        {fragments.map(fragment => (
          <GeometryButton
            key={fragment.id}
            active={activeFragmentId === fragment.id || activeFragmentId?.startsWith(`${fragment.id}--site--`) === true}
            symbol={inspectedElement}
            kind={geometryKind(fragment)}
            label={HYBRID_GROUP_LABEL[fragment.group ?? ''] ?? fragment.short}
            title={`${inspectedElement} ${fragment.name} 构型`}
            directions={fragment.coordination?.directions}
            geometryId={fragment.coordination?.geometryId}
            onClick={() => onChooseFragment(fragment.id)}
          />
        ))}
      </div>

      {fragments.length === 0 && inspectedElement !== 'H' && (
        <p className="mt-2 text-[9px] leading-4 text-muted-foreground">
          当前元素仅提供原子替换；配位构型将在元素模板库中补充。
        </p>
      )}
    </section>
  )
}

function geometryKind(fragment: PublicFragmentDef): GeometryKind {
  if (fragment.group === 'coordination') return 'coordination'
  if (fragment.group === 'sp2') return 'sp2'
  if (fragment.group === 'sp') return 'sp'
  return 'sp3'
}

function SectionHeading({ title, meta }: { title: string; meta: string }) {
  return (
    <div className="mb-2 flex min-w-0 items-center gap-2">
      <h3 className="truncate text-[10px] font-semibold text-foreground">{title}</h3>
      <span className="ml-auto shrink-0 font-mono text-[9px] text-muted-foreground">{meta}</span>
    </div>
  )
}

type GeometryKind = 'atom' | 'grow' | 'sp3' | 'sp2' | 'sp' | 'coordination'

function GeometryButton({
  active,
  symbol,
  kind,
  label,
  title,
  directions,
  geometryId,
  onClick,
}: {
  active: boolean
  symbol: string
  kind: GeometryKind
  label: string
  title: string
  directions?: readonly (readonly [number, number, number])[]
  geometryId?: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'flex h-[66px] min-w-0 flex-col items-center justify-center border px-1 transition-colors',
        active
          ? 'border-primary bg-primary text-primary-foreground shadow-[inset_0_0_0_1px_currentColor]'
          : 'border-border bg-card text-card-foreground hover:border-foreground hover:bg-accent',
      )}
    >
      <GeometryGlyph symbol={symbol} kind={kind} directions={directions} geometryId={geometryId} />
      <span className="mt-1 text-[9px] font-semibold">{label}</span>
    </button>
  )
}

function GeometryGlyph({
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
    return <span className="flex h-8 items-center justify-center text-sm font-bold">{symbol}</span>
  }
  if (kind === 'coordination') {
    return <CoordinationGeometryGlyph symbol={symbol} directions={directions ?? []} geometryId={geometryId ?? 'default'} />
  }

  const arms = kind === 'sp3'
    ? ['left', 'right', 'up-left', 'down-right']
    : kind === 'sp2'
      ? ['left', 'up-right', 'down-right']
      : ['left', 'right']

  return (
    <span className="relative block h-8 w-12" aria-hidden="true">
      {arms.map(arm => (
        <BondArm
          key={arm}
          direction={arm}
          double={kind === 'sp2' && arm === 'left'}
          triple={kind === 'sp' && arm === 'left'}
        />
      ))}
      <span className="absolute left-1/2 top-1/2 z-10 flex size-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-current bg-card text-[9px] font-bold text-card-foreground shadow-sm">
        {symbol}
      </span>
      {kind === 'grow' && <span className="absolute right-0 top-1/2 -translate-y-1/2 text-[8px] font-bold">+</span>}
    </span>
  )
}

function BondArm({ direction, double, triple }: { direction: string; double?: boolean; triple?: boolean }) {
  const transform = direction === 'left'
    ? 'translate(-100%, -50%) rotate(0deg)'
    : direction === 'right'
      ? 'translate(0, -50%) rotate(0deg)'
      : direction === 'up-left'
        ? 'translate(-100%, -50%) rotate(35deg)'
        : direction === 'up-right'
          ? 'translate(0, -50%) rotate(-35deg)'
          : 'translate(0, -50%) rotate(35deg)'
  const origin = direction.includes('left') ? 'right center' : 'left center'
  return (
    <span
      className={cn(
        'absolute left-1/2 top-1/2 h-px w-[18px] bg-current',
        (double || triple) && 'shadow-[0_3px_0_currentColor]',
        triple && "before:absolute before:-top-[3px] before:left-0 before:h-px before:w-full before:bg-current before:content-['']",
      )}
      style={{ transform, transformOrigin: origin }}
    />
  )
}

// Private subcomponent: BondSection (subsection, formerly BondWorkspacePanel)

type BondOrder = 1 | 2 | 3

function BondSection(props: {
  selectedAtomCount: number
  selectedBond: { readonly id: string; readonly order: BondOrder; readonly atomSymbols: readonly string[] } | null
  onConnectSelectedAtoms: () => void
  onSetBondOrder: (order: BondOrder) => void
  onDeleteSelectedBond: () => void
}) {
  const canConnect = props.selectedAtomCount === 2
  return (
    <div className="space-y-5">
      <div className="rounded-md border border-border bg-muted px-3 py-2.5">
        <div className="flex items-center gap-2 text-[11px] font-semibold text-foreground">
          <MousePointer2 size={13} />先选择两个原子
        </div>
        <p className="mt-1 text-[10px] leading-4 text-muted-foreground">选择模式支持 Shift 多选。按 D 返回 Draw 后即可建立一根新键。</p>
      </div>

      <WorkspaceSection title="连接原子" meta={`${props.selectedAtomCount} / 2`}>
        <button
          type="button"
          disabled={!canConnect}
          onClick={props.onConnectSelectedAtoms}
          className={cn(
            'flex h-11 w-full items-center justify-center gap-2 rounded-md border text-xs font-semibold transition-colors',
            canConnect
              ? 'border-primary bg-primary text-primary-foreground hover:bg-primary/90'
              : 'cursor-not-allowed border-border bg-muted text-muted-foreground',
          )}
        >
          <Link2 size={15} />
          连接两个已选原子
        </button>
      </WorkspaceSection>

      <WorkspaceSection title="选中键" meta={props.selectedBond ? props.selectedBond.atomSymbols.join(' – ') : '未选择'}>
        {props.selectedBond ? (
          <div className="space-y-2.5 rounded-md border border-border bg-muted p-2.5">
            <div role="group" aria-label="键级" className="grid grid-cols-3 gap-1.5">
              {([1, 2, 3] as const).map(order => (
                <button
                  key={order}
                  type="button"
                  aria-label={`设为${order === 1 ? '单' : order === 2 ? '双' : '三'}键`}
                  aria-pressed={props.selectedBond?.order === order}
                  onClick={() => props.onSetBondOrder(order)}
                  className={cn(
                    'h-10 rounded-md border text-[11px] font-semibold transition-colors',
                    props.selectedBond?.order === order
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-card text-muted-foreground hover:border-foreground hover:text-foreground',
                  )}
                >
                  {order === 1 ? '单键' : order === 2 ? '双键' : '三键'}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={props.onDeleteSelectedBond}
              className="flex h-9 w-full items-center justify-center gap-2 rounded-md border border-foreground bg-card text-[11px] font-medium text-foreground transition-colors hover:bg-foreground hover:text-background"
            >
              <Trash2 size={13} />删除选中键
            </button>
          </div>
        ) : (
          <div className="flex h-24 items-center justify-center rounded-md border border-dashed border-border bg-muted text-[11px] text-muted-foreground">
            在画布中点击一根键
          </div>
        )}
      </WorkspaceSection>
    </div>
  )
}
