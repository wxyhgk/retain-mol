import { getElementConfig } from '@retainmol/mol-viewer/core'
import { cn } from '@/lib/utils'
import { FULL_PERIODIC_TABLE_LAYOUT } from '../domain/periodicTableLayout'

// Re-export quick elements for DrawPanel sharing
export { QUICK_ELEMENTS } from '../domain/periodicTableLayout'

export function PeriodicTable({
  activeElement,
  onSelect,
}: {
  readonly activeElement: string
  readonly onSelect: (symbol: string) => void
}) {
  return (
    <div className="overflow-x-auto px-4 py-4">
      <div className="mx-auto grid min-w-[680px] max-w-[860px] grid-cols-[repeat(18,minmax(0,1fr))] gap-1">
        {FULL_PERIODIC_TABLE_LAYOUT.flatMap((row, rowIndex) =>
          row.map((symbol, colIndex) => {
            if (!symbol || symbol === '*') return <span key={`${rowIndex}-${colIndex}`} className="h-10 min-w-0" />
            return (
              <ElementButton
                key={`${symbol}-${rowIndex}-${colIndex}`}
                symbol={symbol}
                active={activeElement === symbol}
                onClick={() => onSelect(symbol)}
              />
            )
          }),
        )}
      </div>
    </div>
  )
}

function ElementButton({
  symbol,
  active,
  onClick,
}: {
  symbol: string
  active: boolean
  onClick: () => void
}) {
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
        'flex h-10 min-w-0 flex-col items-center justify-center rounded-[3px] border text-[10px] font-semibold leading-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
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

export function QuickElementButton({
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
        'flex h-11 sm:h-12 min-w-0 flex-col items-center justify-center rounded-md border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
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
