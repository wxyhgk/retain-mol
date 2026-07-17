import { cn } from '../utils'

export type StatusTone = 'neutral' | 'success' | 'danger' | 'info' | 'emphasis'

const TONE_CLASSES: Record<StatusTone, string> = {
  neutral: 'border-border text-muted-foreground',
  success: 'border-emerald-300 text-emerald-700 dark:text-emerald-400',
  danger: 'border-destructive/40 text-destructive',
  info: 'border-sky-400/50 text-sky-600 dark:text-sky-400',
  emphasis: 'border-foreground bg-foreground text-background',
}

/** 通用状态胶囊：语义（label/tone/pulse）由调用方决定，本组件不含业务词汇。 */
export function StatusPill({ label, tone = 'neutral', pulse = false, size = 'default', className }: {
  label: string
  tone?: StatusTone
  pulse?: boolean
  size?: 'sm' | 'default'
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center border font-medium',
        size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-1 text-[11px]',
        TONE_CLASSES[tone],
        className,
      )}
    >
      {pulse && <span className="mr-1.5 size-1.5 animate-pulse rounded-full bg-current" />}
      {label}
    </span>
  )
}
