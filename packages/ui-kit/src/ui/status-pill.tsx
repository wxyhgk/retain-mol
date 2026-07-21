import { cn } from '../utils'

export type StatusTone = 'neutral' | 'success' | 'danger' | 'info' | 'emphasis' | 'gilt'

// 古建配色状态词汇：emphasis=铜青实心（全站唯一实心=正在发生），
// success=铜青描边淡底（完成是主色余韵），danger=朱砂，info=孔雀蓝，
// neutral=未着色（未开始/退场），gilt=鎏金（高级点缀，控制面积）
const TONE_CLASSES: Record<StatusTone, string> = {
  neutral: 'border-border text-muted-foreground',
  success: 'border-primary/40 bg-primary/5 text-primary',
  danger: 'border-destructive/50 text-destructive',
  info: 'border-ring/40 text-ring',
  emphasis: 'border-primary bg-primary text-primary-foreground',
  gilt: 'border-gilt/50 text-gilt',
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
        'inline-flex shrink-0 items-center rounded-md border font-medium',
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
