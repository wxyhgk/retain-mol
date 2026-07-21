import { cn } from '@retainmol/ui-kit'

export type MoleculeCardVariant = 'row' | 'tile' | 'node' | 'plaque'

export interface MoleculeCardProps {
  /** 布局变体：row=列表行 / tile=网格卡 / node=工作流节点卡 / plaque=展柜展签（无 visual 槽） */
  variant?: MoleculeCardVariant
  /** 分子视觉槽（Molecule2D / <img> / 任意 ReactNode）；plaque 变体忽略 */
  visual?: React.ReactNode
  title: string
  /** 状态槽（StatusPill 等），位置跨变体固定 */
  status?: React.ReactNode
  /** 类型槽（KindChip 等） */
  kind?: React.ReactNode
  /** 其他信息（MonoId/MethodChip/ElapsedTime…），壳负责限行与间距 */
  meta?: React.ReactNode
  /** 可选扩展（进度环/迷你图） */
  extras?: React.ReactNode
  /** 动作行（按钮由调用方注入） */
  actions?: React.ReactNode
  selected?: boolean
  onClick?: () => void
  className?: string
}

/**
 * 分子卡片壳：只管槽位排布与密度，不取数、不含业务词汇。
 * 领域包在其上做预设（如 jobs 的 JobCard）。
 */
export function MoleculeCard({
  variant = 'row',
  visual,
  title,
  status,
  kind,
  meta,
  extras,
  actions,
  selected = false,
  onClick,
  className,
}: MoleculeCardProps) {
  const interactive = Boolean(onClick)
  // 根节点用 div + role="button" 而非 <button>：卡片槽位里常有嵌套按钮
  // （MonoId 复制、动作行），HTML 禁止 button 嵌 button
  const Root = 'div' as const
  const rootProps = interactive
    ? {
        role: 'button' as const,
        tabIndex: 0,
        onClick,
        onKeyDown: (event: React.KeyboardEvent) => {
          if (event.target !== event.currentTarget) return
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            onClick?.()
          }
        },
      }
    : {}

  const frame = cn(
    'rounded-lg border text-left shadow-[0_1px_2px_rgba(38,34,31,0.05)] transition-colors',
    selected ? 'border-foreground bg-background' : 'border-border bg-card',
    interactive && 'cursor-pointer hover:border-foreground/40 hover:bg-muted/40',
    className,
  )

  if (variant === 'plaque') {
    return (
      <Root {...rootProps} className={cn('block w-44 border-transparent bg-transparent text-center', interactive && 'cursor-pointer', className)}>
        <p className="truncate text-xs font-medium text-foreground">{title}</p>
        <div className="mt-1 flex flex-wrap items-center justify-center gap-1.5">
          {status}
          {kind}
          {meta}
        </div>
        {extras && <div className="mt-1 flex justify-center">{extras}</div>}
        {actions && <div className="mt-1.5 flex items-center justify-center gap-1">{actions}</div>}
      </Root>
    )
  }

  if (variant === 'row') {
    return (
      <Root {...rootProps} className={cn(frame, 'flex w-full items-center gap-3 p-2')}>
        {visual && <div className="size-12 shrink-0 overflow-hidden rounded-md border border-border/60 bg-muted/20 [&_svg]:size-full">{visual}</div>}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-xs font-medium">{title}</p>
            {kind}
          </div>
          {meta && <div className="mt-1 flex flex-wrap items-center gap-1.5">{meta}</div>}
        </div>
        {extras}
        {status && <div className="shrink-0">{status}</div>}
        {actions && <div className="flex shrink-0 items-center gap-1">{actions}</div>}
      </Root>
    )
  }

  // tile / node：竖排，visual 在上；node 更紧凑、extras（进度）紧贴 visual
  const isNode = variant === 'node'
  return (
    <Root {...rootProps} className={cn(frame, 'flex w-full flex-col', isNode ? 'max-w-60' : '')}>
      {visual && (
        <div className={cn('w-full overflow-hidden rounded-t-lg border-b border-border bg-muted/20 [&_svg]:h-full [&_svg]:w-full', isNode ? 'h-28' : 'aspect-[4/3]')}>
          {visual}
        </div>
      )}
      <div className={cn('flex min-w-0 flex-col gap-1.5', isNode ? 'p-2' : 'p-3')}>
        <div className="flex items-start justify-between gap-2">
          <p className="min-w-0 truncate text-xs font-medium">{title}</p>
          {status && <div className="shrink-0">{status}</div>}
        </div>
        {(kind || meta) && (
          <div className="flex flex-wrap items-center gap-1.5">
            {kind}
            {meta}
          </div>
        )}
        {extras}
        {actions && <div className="mt-0.5 flex items-center gap-1">{actions}</div>}
      </div>
    </Root>
  )
}
