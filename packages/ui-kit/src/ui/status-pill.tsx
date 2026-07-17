import { cn } from '../utils'

export type StatusTone = 'neutral' | 'success' | 'danger' | 'info' | 'emphasis'

// 黑白状态词汇（全站设计定论）：emphasis=唯一实心黑（活的），
// success=白底浅发丝，danger=深发丝，neutral=浅灰，info=中发丝
const TONE_CLASSES: Record<StatusTone, string> = {
  neutral: 'border-border text-muted-foreground',
  success: 'border-foreground/25 bg-background text-foreground',
  danger: 'border-foreground/45 text-foreground',
  info: 'border-foreground/35 text-foreground',
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
