import * as React from 'react'

import { cn } from '@/lib/utils'

export interface ChartFrameProps
  extends Omit<React.HTMLAttributes<HTMLElement>, 'children' | 'title'> {
  title: React.ReactNode
  description?: React.ReactNode
  actions?: React.ReactNode
  legend?: React.ReactNode
  /** A non-visual text or table alternative for the chart. */
  accessibleSummary?: React.ReactNode
  children: React.ReactNode
  contentClassName?: string
  contentStyle?: React.CSSProperties
  minHeight?: React.CSSProperties['minHeight']
  aspectRatio?: React.CSSProperties['aspectRatio']
}
export function ChartFrame({
  title,
  description,
  actions,
  legend,
  accessibleSummary,
  children,
  className,
  contentClassName,
  contentStyle,
  minHeight = 240,
  aspectRatio,
  'aria-label': ariaLabel,
  ...figureProps
}: ChartFrameProps) {
  const generatedId = React.useId()
  const titleId = `${generatedId}-title`
  const descriptionId = `${generatedId}-description`
  const summaryId = `${generatedId}-summary`
  const describedBy = [
    description ? descriptionId : null,
    accessibleSummary ? summaryId : null,
  ].filter(Boolean).join(' ') || undefined

  return (
    <figure
      aria-label={ariaLabel}
      aria-labelledby={ariaLabel ? undefined : titleId}
      aria-describedby={describedBy}
      className={cn('w-full overflow-hidden rounded-md border border-border bg-background text-foreground', className)}
      {...figureProps}
    >
      <figcaption className="flex min-w-0 items-start justify-between gap-4 border-b border-border px-4 py-3">
        <div className="min-w-0">
          <div id={titleId} className="truncate text-sm font-medium">
            {title}
          </div>
          {description && (
            <div id={descriptionId} className="mt-0.5 text-xs text-muted-foreground">
              {description}
            </div>
          )}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-1">{actions}</div>}
      </figcaption>
      <div
        className={cn('relative w-full', contentClassName)}
        style={{ minHeight, aspectRatio, ...contentStyle }}
      >
        {children}
      </div>
      {legend && (
        <div className="border-t border-border px-4 py-2 text-xs text-muted-foreground">
          {legend}
        </div>
      )}
      {accessibleSummary && (
        <div id={summaryId} className="sr-only">
          {accessibleSummary}
        </div>
      )}
    </figure>
  )
}
