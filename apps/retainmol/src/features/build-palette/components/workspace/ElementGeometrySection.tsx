import type { PublicFragmentDef } from '@retainmol/mol-viewer/fragments'
import { cn } from '@/lib/utils'
import { HYBRID_GROUP_LABEL } from '../../domain/buildCatalog'
import { CoordinationGeometryGlyph } from './CoordinationGeometryGlyph'

interface Props {
  readonly activeElement: string
  readonly atomClickMode: 'grow' | 'replace'
  readonly inspectedElement: string
  readonly elementName: string
  readonly activeFragmentId: string | null
  readonly fragments: readonly PublicFragmentDef[]
  readonly onPickAtom: (symbol: string) => void
  readonly onPickHydrogenGrow: () => void
  readonly onChooseFragment: (fragmentId: string) => void
}

export function ElementGeometrySection({
  activeElement,
  atomClickMode,
  inspectedElement,
  elementName,
  activeFragmentId,
  fragments,
  onPickAtom,
  onPickHydrogenGrow,
  onChooseFragment,
}: Props) {
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
