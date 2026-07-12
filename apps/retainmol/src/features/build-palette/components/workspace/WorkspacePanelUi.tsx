import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function WorkspaceSection({ title, meta, children }: { title: string; meta?: string; children: ReactNode }) {
  return (
    <section className="space-y-2.5">
      <div className="flex min-w-0 items-center gap-2">
      <h3 className="truncate text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">{title}</h3>
        {meta && <span className="ml-auto shrink-0 font-mono text-[9px] text-muted-foreground">{meta}</span>}
      </div>
      {children}
    </section>
  )
}

export function WorkspaceChoice({
  active,
  disabled,
  icon,
  label,
  detail,
  onClick,
  className,
}: {
  active?: boolean
  disabled?: boolean
  icon?: ReactNode
  label: string
  detail?: string
  onClick: () => void
  className?: string
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'flex min-h-11 min-w-0 items-center gap-2 rounded-md border px-2.5 text-left transition-colors',
        active
          ? 'border-primary bg-primary text-primary-foreground shadow-[inset_0_0_0_1px_currentColor]'
          : 'border-border bg-card text-card-foreground hover:border-foreground hover:bg-accent hover:text-accent-foreground',
        disabled && 'cursor-not-allowed opacity-40',
        className,
      )}
    >
      {icon && <span className={cn('shrink-0 text-muted-foreground', active && 'text-primary-foreground')}>{icon}</span>}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[11px] font-semibold">{label}</span>
        {detail && <span className={cn('mt-0.5 block truncate text-[9px]', active ? 'text-primary-foreground/70' : 'text-muted-foreground')}>{detail}</span>}
      </span>
    </button>
  )
}
